"use server"
import { createClient } from "@/lib/supabase/server";
import { CountDetails, InventoryCount, InventoryCountDetail, ItemForCount, Presentation, Profiles, SupplierPresentation } from "@/types/inventory";
import { boolean } from "zod";

// Obtiene items filtrados y calcula stock total por item (en unidades base)
export async function getItemsWithStock() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select(
      `
      item_id,
      name,
      units:unit_id ( unit_id, name, abbreviation ),
      category_id,
      storage_area_id,
      item_type_id,
      item_presentations (
        item_presentation_id,
        quantity,
        is_default,
        presentation_types (
          presentation_type_id,
          name,
          description,
          conversion_factor,
          unit:unit_id ( unit_id, name, abbreviation )
        ),
        suppliers_presentations(
          supplier_presentation_id,
          suppliers ( supplier_id, company_name, contact_name, email, phone )
        ),
        item_batches (
          batch_id,
          current_quantity,
          received_date,
          expiration_date,
          is_active,
          order_detail_id,
          created_at
        )
      )
      `
    );

  if (error || !data) {
    console.error("Error loading items", error);
    return [];
  }

const items: ItemForCount[] = data.map((item: any) => {
    const correctedPresentations = item.item_presentations.map((pres: any) => {
        const correctedSuppliersPresentations = pres.suppliers_presentations.map((sp: any) => {
            const supplier = sp.suppliers[0];
            return {
                ...sp,
                suppliers: supplier,
            } as SupplierPresentation;
        });

        return {
            ...pres,
            suppliers_presentations: correctedSuppliersPresentations,
        } as Presentation;
    });

    const system_quantity = correctedPresentations.reduce((acc:any, pres:any) => {
      const sumBatches = pres.item_batches && pres.item_batches
        .filter((b:any) => b.is_active)
        .reduce((s:any, b:any) => s + b.current_quantity, 0);
      return acc + (sumBatches ? sumBatches: 0) * pres.presentation_types.conversion_factor;
    }, 0);
  
    return { 
      ...item, 
      presentations: correctedPresentations,
      system_quantity 
    };
  });

  return items;
}


export async function saveInventoryCount(
  countedBy: number,
  items: { item_id: number; counted_quantity: number; system_quantity: number }[]
) {
  const supabase = await createClient();

  const { data: count, error: countError } = await supabase
    .from("inventory_counts")
    .insert([{counted_by: countedBy }])
    .select()
    .single();

  if (countError || !count) {
    throw new Error("Error creando conteo");
  }

  const details = items.map((i) => ({
    count_id: count.count_id,
    item_id: i.item_id,
    counted_quantity: i.counted_quantity,
    system_quantity: i.system_quantity,
    difference: (i.counted_quantity - i.system_quantity)*(-1),
  }));

  const { error: detailError } = await supabase
    .from("inventory_counts_details")
    .insert(details);

  if (detailError) throw new Error("Error guardando detalles del conteo");

  //Ajustar lotes según diferencia
  for (const i of items) {
    const diff = i.counted_quantity - i.system_quantity;
    if (diff !== 0) {
      await adjustBatchesForItem(supabase, i.item_id, diff);
    }
  }

  return count;
}


/**
 * Ajusta lotes de un item para que sumen la diferencia (base units).
 * - diff < 0 => sistema > contado => quitar unidades (rebaja) FIFO (oldest first)
 * - diff > 0 => contado > sistema => sumar unidades (se agregan al lote más reciente o se crea nuevo)
 */
export async function adjustBatchesForItem(
  supabase: any,
  item_id: number,
  diff: number
) {
  // Traer item_presentaciones + batches del item
  const { data: presData, error } = await supabase
    .from("item_presentations")
    .select(`
      item_presentation_id,
      is_default,
      quantity,
      presentation_types (
        presentation_type_id,
        name,
        description,
        conversion_factor,
        unit:unit_id ( unit_id, name, abbreviation )
      ),
      item_batches (
        batch_id,
        current_quantity,
        received_date,
        expiration_date,
        is_active
      )
    `)
    .eq("item_id", item_id);

  if (error) {
    console.error("Error fetching presentations for adjust", error);
    throw error;
  }

  // Normalizar batches
  const batches: Array<{
    batch_id: number;
    presentation_id: number;
    current_quantity: number;
    received_date: string | null;
    conversion_factor: number;
  }> = [];

  for (const p of presData || []) {
    const conv = Number(p.presentation_types.conversion_factor ?? 1);
    for (const b of p.item_batches || []) {
      if (b.is_active === false) continue;
      batches.push({
        batch_id: b.batch_id,
        presentation_id: p.presentation_id,
        current_quantity: Number(b.current_quantity || 0),
        received_date: b.received_date || null,
        conversion_factor: conv,
      });
    }
  }

  // Orden FIFO por fecha recibida
  batches.sort((a, b) => {
    if (!a.received_date) return 1;
    if (!b.received_date) return -1;
    return (
      new Date(a.received_date).getTime() - new Date(b.received_date).getTime()
    );
  });

  const remaining = Number(diff); // en unidades base

  if (remaining === 0) return;

  if (remaining < 0) {
    //Rebajar stock
    let toRemove = Math.abs(remaining);
    for (const batch of batches) {
      if (toRemove <= 0) break;
      const batchBaseQty = batch.current_quantity * batch.conversion_factor;
      if (batchBaseQty <= 0) continue;

      if (batchBaseQty <= toRemove + 1e-9) {
        // Vaciar lote
        const { error: e } = await supabase
          .from("item_batches")
          .update({ current_quantity: 0 })
          .eq("batch_id", batch.batch_id);
        if (e) throw e;
        toRemove -= batchBaseQty;
      } else {
        // Reducir parcialmente
        const newBase = batchBaseQty - toRemove;
        const newCurrent = newBase / batch.conversion_factor;
        const { error: e } = await supabase
          .from("item_batches")
          .update({ current_quantity: newCurrent })
          .eq("batch_id", batch.batch_id);
        if (e) throw e;
        toRemove = 0;
      }
    }

    if (toRemove > 0) {
      console.warn(
        `No había stock suficiente para rebajar completamente el item ${item_id}, faltaron:`,
        toRemove
      );
    }
  } else {
    //Aumentar stock
    const latestBatch = batches.length ? batches[batches.length - 1] : null;

    if (latestBatch) {
      const addInPresentationUnits = remaining / latestBatch.conversion_factor;
      const newCurrent = latestBatch.current_quantity + addInPresentationUnits;
      const { error: e } = await supabase
        .from("item_batches")
        .update({ current_quantity: newCurrent })
        .eq("batch_id", latestBatch.batch_id);
      if (e) throw e;
    } else {
      // No hay batches: crear uno nuevo en la presentación por defecto
      const defaultPres =
        (presData || []).find((p: any) => p.is_default) || (presData || [])[0];
      if (!defaultPres) {
        console.warn("No presentation found to add stock for item", item_id);
        return;
      }

      const conv = Number(defaultPres.conversion_factor || 1);
      const newCurrent = remaining / conv;

      const { error: e } = await supabase.from("item_batches").insert([
        {
          quantity_batch: newCurrent,
          current_quantity: newCurrent,
          received_date: new Date().toISOString(),
          expiration_date: null,
          is_active: true,
          item_presentation_id: defaultPres.item_presentation_id,
          order_detail_id: null,
          created_at: new Date().toISOString(),
        },
      ]);
      if (e) throw e;
    }
  }
}

export async function getInventoryHistory(limit?: number): Promise<(InventoryCount & { inventory_counts_details: InventoryCountDetail[] } & {profiles: Profiles})[]> {
  
  const supabase = await createClient();

  if(limit){ 
    const { data, error } = await supabase
      .from("inventory_counts")
      .select(
        `
        count_id,
        counted_by,
        created_at,
        notes,
        profiles(
          username,
          profile_id
        ),
        inventory_counts_details(
          *
        )
        `
      )
      .order("created_at", { ascending: false })
      .range(0,limit);

    if (error) {
      console.error(error);
      return [];
    }

    return data as any;
  }else{
    const { data, error } = await supabase
      .from("inventory_counts")
      .select(
        `
        count_id,
        counted_by,
        created_at,
        notes,
        profiles(
          username,
          profile_id
        ),
        inventory_counts_details(
          *
        )
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return [];
    }

    return data as any;
  }


}

export async function getInventoryCount(count_id: number){
  try {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
    }

    const {data, error} = await supabase
      .from("inventory_counts")
      .select(`
            count_id,
            created_at,
            counted_by,
            notes,
            inventory_counts_details (
              count_id,
              count_detail_id,
              item_id,
              counted_quantity,
              system_quantity,
              difference,
              created_at,
              items (
                item_id,
                name,
                unit_id,
                category_id,
                storage_area_id,
                item_type_id,
                units (
                  unit_id,
                  name,
                  abbreviation
                ),
                item_presentations (
                  item_presentation_id,
                  quantity,
                  is_default,
                  presentation_types (
                    presentation_type_id,
                    name,
                    description,
                    conversion_factor,
                    units (
                      unit_id,
                      name,
                      abbreviation
                    )
                  ),
                  suppliers_presentations (
                    supplier_presentation_id,
                    suppliers (
                      supplier_id,
                      company_name
                    )
                  )
                )
              )
            )
      `)
      .eq("count_id", count_id)
      .single();
      if(data){
        const mapped: CountDetails = {
          count_id: data.count_id,
          counted_by: data.counted_by,
          created_at: data.created_at,
          notes: data.notes,
          inventory_counts_details: data.inventory_counts_details.map((d: any) => {
            const presen_quantity = d.items.item_presentations.find(p => p.is_default);
            if(presen_quantity){
              return {
                ...d,
                counted_quantity: d.counted_quantity / presen_quantity.quantity,
                presentation: presen_quantity,
                item: d.items,
              }              
            }else {
              return null;
            } 
          }).filter(Boolean),
        };     
        return {data: mapped, error: null}; 
      }

      if(error){
          console.error('Error in get categories:', error);
          return { data: null, error: "ERROR-GET-CATEGORIES"};
      }
      
  } catch (err) {
    console.error("Error get inventory count:", err)
    return { data: null, error: "ERROR-GET-INVENTORY-COUNT" }
  }
}

export async function updateInventoryCount(
  countId: number,
  updates: { 
    count_detail_id: number; 
    item_id: number; 
    counted_quantity: number; 
    system_quantity: number; 
  }[],
  userId: number
) {
  const supabase = await createClient();

  // 1. Actualizar detalles del conteo
  const updatedDetails = updates.map((u) => ({
    count_detail_id: u.count_detail_id,
    item_id: u.item_id,
    counted_quantity: u.counted_quantity,
    system_quantity: u.system_quantity,
    difference: u.counted_quantity - u.system_quantity,
  }));

  const { error: updateError } = await supabase
    .from("inventory_counts_details")
    .upsert(updatedDetails, { onConflict: "count_detail_id" });

  if (updateError) {
    console.error("Error actualizando detalles", updateError);
    throw new Error("No se pudo actualizar los detalles del conteo");
  }

  // 2. Reaplicar ajustes de lotes
  for (const u of updatedDetails) {
    const diff = u.difference;
    if (diff !== 0) {
      await adjustBatchesForItem(supabase, u.item_id, diff);
    }
  }

  // 3. Actualizar la metadata del conteo
  const { error: countError } = await supabase
    .from("inventory_counts")
    .update({ created_at: new Date().toISOString(), counted_by: userId })
    .eq("count_id", countId);

  if (countError) {
    console.error("Error actualizando inventario", countError);
    throw new Error("No se pudo actualizar el conteo principal");
  }

  return { success: true };
}

export async function deleteInventoryCount({
    count_id,
    delete_by
}:{
    count_id: number | undefined;
    delete_by: number | undefined;
}){

    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {data, error} = await supabase.rpc("delete_inventory_count", {
            p_count_id: count_id,
            p_deleted_by: delete_by
        }); 

        if(error){
            console.error('Error in create delete_inventory_count:', error);
            return { error: error};
        }

        return {success: true, data:data, error:null};
    } catch (err) {
        console.error('Unexpected error in delete_inventory_count:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }


}
