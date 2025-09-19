"use server"
import { createClient } from "@/lib/supabase/server";
import { itemBatches, Order, OrderDetails } from "@/types/order";

export async function getPrsentationsForSupplier(supplier_id: number){
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }

        const {data,error: preError} = await supabase
            .from('suppliers_presentations')
            .select(`
                presentation_id,
                suppliers(supplier_id, company_name),
                presentations(
                    presentation_id,
                    name,
                    description,
                    conversion_factor,
                    unit,
                    items:item_id (
                    item_id,
                    name,
                    description,
                    base_unit,
                    min_quantity,
                    target_quantity
                    )
                )
            `).eq('supplier_id', supplier_id);

        if(preError){
            console.error('Error in get presentations:', preError);
            return { data: null, error: "ERROR-GET-CATEGORIES"};
        }
        return {data: data, error: null};

    } catch (err) {
        console.error('Unexpected error in get presents:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function createOrder(order: Omit<Order, "order_id">){
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {data, error:orderErr} = await supabase.from("orders").insert(order).select().single();
        if(orderErr){
            console.error('Error in create category:', orderErr);
            return { error: orderErr};
        }

        return {success: true, data:data, error:null};
    } catch (err) {
        console.error('Unexpected error in order:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function createOrderDetails(orderDetail: Omit<OrderDetails[],"order_detail_id">, newBatchs: Omit<itemBatches[],"batch_id">) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {data, error: presError} = await supabase.from("order_details")
            .insert(orderDetail)
            .select();

        if(data){
            for (let i = 0; i < newBatchs.length; i++) {
                newBatchs[i].order_detail_id = data[i].order_detail_id;
            }
            const responseOD = await createNewsBatches(newBatchs);

            if(responseOD.success){
                return {success: true, data:data, error:null}; 
            }
        }
        

        if(presError){
            console.error('Error in create Profile:', presError);
            return { error: presError};
        }
    } catch (err) {
        console.error('Unexpected error in order details:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function createNewsBatches(newBatchs: Omit<itemBatches[],"batch_id">){
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {error} = await supabase.from("item_batches")
            .insert(newBatchs)
            .select();
        if(error){
            console.error('Error in create item_batches:', error);
            return { error: error};
        }

        return {success: true, error:null};
    } catch (err) {
        console.error('Unexpected error in item_batches:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}