"use server";

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type MissingItemRow = {
  item_id: string
  item_name?: string
  target_quantity: number
  current_stock_base_unit: number
  missing_quantity_base_unit: number
  supplier_id?: string
}

export async function POST(req: Request){

    const { created_by } = await req.json();
    const supabase = await createClient();

    try {

        // Obtener items con stock por debajo de la meta
        const { data, error } = await supabase
            .from('missing_items')
            .select('*');
        
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const missingItems = data as MissingItemRow[];

        if (!missingItems || missingItems.length === 0) {
            return NextResponse.json({ message: 'No hay items por debajo de la meta.' })
        }

        // Agrupar por proveedor
        const groups: Record<string, MissingItemRow[]> = {}
        for (const item of missingItems) {
            if (!item.supplier_id) continue;
            if (!groups[item.supplier_id]) groups[item.supplier_id] = [];
            groups[item.supplier_id].push(item);
        }

        const results: Array<{ supplier_id: string; order_id: string; details_processed: number, updated_existing_order:boolean}> = [];

        // Crear orden sugerida y detalles por proveedor
        for (const [supplierId, items] of Object.entries(groups)) {
            // verificar si existe orden sugerida por proveedor
            const { data: existingOrder, error: checkError } = await supabase
                .from('orders')
                .select('order_id')
                .eq('supplier_id', supplierId)
                .eq('status', 'SUGGESTED')
                .maybeSingle();
            
            if (checkError) throw checkError

            let orderId: string;

            if(existingOrder){
                orderId = existingOrder.order_id
            }else{
                // Crear orden sugerida
                const { data: insertedOrder, error: errOrder } = await supabase
                    .from('orders')
                    .insert([{
                        status: 'SUGGESTED',
                        supplier_id: supplierId,
                        created_by
                    }])
                    .select()
                    .single();
                
                if (errOrder) throw errOrder;

                orderId = insertedOrder.order_id;
            }

            // Buscar la presentación default del item para este proveedor
            let orderDetails = 0;

            for (const item of items){
                // Buscar la presentación default del item
                const { data: defaultPres, error: presError } = await supabase
                    .from('presentations')
                    .select('presentation_id, conversion_factor')
                    .eq('item_id', item.item_id)
                    .eq('is_default', true)
                    .limit(1)
                    .single()

                if (presError || !defaultPres) {
                    throw new Error(`No hay presentación default para item ${item.item_id}`)
                }

                // Calcular cantidad en presentación
                const quantityInPresentation = Math.ceil(
                    item.missing_quantity_base_unit / (defaultPres.conversion_factor || 1)
                )

                // Verificar si ya existe un detalle de orden para este producto
                const { data: existingDetail, error: detailError } = await supabase
                .from('order_details')
                .select('order_detail_id, quantity_ordered')
                .eq('order_id', orderId)
                .eq('presentation_id', defaultPres.presentation_id)
                .maybeSingle();

                if (detailError) throw detailError

                if(existingDetail){
                    const { error: updateError } = await supabase
                        .from('order_details')
                        .update({
                            quantity_ordered:
                            existingDetail.quantity_ordered + quantityInPresentation,
                        })
                        .eq('order_detail_id', existingDetail.order_detail_id)

                    if (updateError) throw updateError
                }else{
                    // Armar detalle de orden
                    const { error: errDetails } = await supabase
                        .from('order_details')
                        .insert({
                            order_id: orderId,
                            presentation_id: defaultPres.presentation_id,
                            quantity_ordered: quantityInPresentation,
                            quantity_received: 0,
                            unit_price: null   
                        });

                    if (errDetails) throw errDetails;                    
                }
                orderDetails++;
            }

            results.push({
                supplier_id: supplierId,
                order_id: orderId,
                details_processed: orderDetails,
                updated_existing_order: !!existingOrder,
            });
        }

        return NextResponse.json({ created: results })

    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: e }, { status: 500 })
    }
}