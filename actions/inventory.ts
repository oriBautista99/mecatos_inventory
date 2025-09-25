"use server"
import { createClient } from "@/lib/supabase/server";
import { CountDetails, InventoryCount, InventoryCountDetail, Item, ItemForCount, Presentation, Profiles, SupplierPresentation } from "@/types/inventory";

// Obtiene items filtrados y calcula stock total por item (en unidades base)
export async function getItemsWithStock() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select(
      `
      item_id,
      name,
      base_unit,
      category_id,
      storage_area_id,
      item_type_id,
      presentations (
        presentation_id,
        name,
        unit,
        conversion_factor,
        is_default,
        quantity,
        item_id,
        suppliers_presentations(
          supplier_presentation_id,
          suppliers(
            supplier_id,
            company_name
          )
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
    // 🔹 Transformar la data de `presentations` para corregir la estructura de `suppliers`
    const correctedPresentations = item.presentations.map((pres: any) => {
        // Asumo que el array `sp.suppliers` solo tiene un elemento
        const correctedSuppliersPresentations = pres.suppliers_presentations.map((sp: any) => {
            // ✅ CORRECCIÓN: Accedemos al primer elemento del array `suppliers`
            const supplier = sp.suppliers[0];
            return {
                ...sp,
                // ✅ Sobreescribimos la propiedad `suppliers` para que sea un solo objeto
                suppliers: supplier,
            } as SupplierPresentation;
        });

        return {
            ...pres,
            suppliers_presentations: correctedSuppliersPresentations,
        } as Presentation;
    });

    // 🔹 Calcular el stock real sumando lotes del item
    const system_quantity = correctedPresentations.reduce((acc:any, pres:any) => {
      const sumBatches = pres.item_batches && pres.item_batches
        .filter((b:any) => b.is_active)
        .reduce((s:any, b:any) => s + b.current_quantity, 0);
      return acc + (sumBatches ? sumBatches: 0) * pres.conversion_factor;
    }, 0);
  
    // Devolvemos el objeto con la estructura correcta
    return { 
      ...item, 
      presentations: correctedPresentations,
      system_quantity 
    };
  });

  return items;
}


/**
 * Crea el inventario count y detalles; luego ajusta lotes por diferencia (FIFO).
 * payload.items = [{ item_id, counted_quantity, system_quantity }]
 */
export async function saveInventoryCount(
  countedBy: number,
  items: { item_id: number; counted_quantity: number; system_quantity: number }[]
) {
  const supabase = await createClient();

  // Crear conteo principal
  const { data: count, error: countError } = await supabase
    .from("inventory_counts")
    .insert([{counted_by: countedBy }])
    .select()
    .single();

    // console.log(countError)
  if (countError || !count) {
    throw new Error("Error creando conteo");
  }

  // Crear detalles
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

  // 🔹 Ajustar lotes según diferencia
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
  // Traer presentaciones + batches del item
  const { data: presData, error } = await supabase
    .from("presentations")
    .select(`
      presentation_id,
      conversion_factor,
      is_default,
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
    const conv = Number(p.conversion_factor ?? 1);
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
    // 🔹 Rebajar stock
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
    // 🔹 Aumentar stock
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
          presentation_id: defaultPres.presentation_id,
          order_detail_id: null,
          created_at: new Date().toISOString(),
        },
      ]);
      if (e) throw e;
    }
  }
}

export async function getInventoryHistory(): Promise<(InventoryCount & { inventory_counts_details: InventoryCountDetail[] } & {profiles: Profiles})[]> {
  const supabase = await createClient();

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
            base_unit,
            category_id,
            storage_area_id,
            item_type_id,
            presentations (
              presentation_id,
              name,
              unit,
              conversion_factor,
              is_default,
              item_id,
              quantity,
              suppliers_presentations(
                supplier_presentation_id,
                suppliers(
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
          inventory_counts_details: data.inventory_counts_details.map((d: any) => ({
            ...d,
            item: d.items,
          })),
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