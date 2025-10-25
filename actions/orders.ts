"use server"
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS } from "@/types/constants";
import { mapSupabaseDataToPresentations } from "@/types/order";

export async function getOrdersForStatus(
  status: typeof ORDER_STATUS[keyof typeof ORDER_STATUS][],
  limit?: number,
  offset?: number
) {
  try {
    const supabase = await createClient();

    // base query
    let query = supabase
      .from("orders")
      .select("*, suppliers(supplier_id, company_name)", { count: "exact" })
      .in("status", status);

    // aplicar paginación solo si se envían los parámetros
    if (typeof limit === "number" && typeof offset === "number") {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Error in getOrdersForStatus:", error);
      return { data: null, total: 0, error: "ERROR-GET-ORDERS" };
    }

    return { data, total: count ?? 0, error: null };
  } catch (err) {
    console.error("Error getOrdersForStatus:", err);
    return { data: null, total: 0, error: "ERROR-GET-ORDERS" };
  }
}

export async function getOrders() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {data, error} = await supabase.from("orders")
            .select('*,suppliers(supplier_id, company_name)');
            
        if(error){
            console.error('Error in get suppliers:', error);
            return { data: null, error: "ERROR-GET-SUPPLIERS"};
        }
        return {data: data, error: null};
    } catch (err) {
        console.error("Error get suppliers:", err)
        return { data: null, error: "ERROR-GET-SUPPLIERS" }
    }
}

export async function getOrderById(order_id:number) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                suppliers(supplier_id, company_name),
                order_details(*,
                    presentations(*,
                        items(*)
                    ),
                    item_batches(*)
                )`
            ) // Select the order and its related details
            .eq('order_id', order_id)
            .single(); // Use .single() to get one object instead of an array

        if (error) {
            console.error('Error fetching order:', error);
            return { error };
        }

        return { data:data, error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: null, error: 'Failed to fetch order' };
    }
}

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
                    quantity,
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
        const mappedData = mapSupabaseDataToPresentations(data);
        return {data: mappedData, error: null};

    } catch (err) {
        console.error('Unexpected error in get presents:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function updateBatch(batch_id: number, detail: { quantity_batch: number, current_quantity: number, expiration_date: Date }){
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
            .update({
                quantity_batch: detail.quantity_batch,
                current_quantity: detail.current_quantity,
                expiration_date: detail.expiration_date
            })
        .eq("batch_id", batch_id); 
        if(error){
            console.error('Error in create updateBatch:', error);
            return { error: error};
        }

        return {success: true, error:null};
    } catch (err) {
        console.error('Unexpected error in updateBatch:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function rpcUpdateOrder({
  orderId,
  updatedBy,
  status,
  description,
  items,
}: {
  orderId: number | undefined;
  updatedBy: number | undefined;
  status?: string;
  description?: string;
  items: Array<{
    presentation_id: number;
    quantity_ordered: number;
    quantity_received: number;
    unit_price: number;
    expiration_date: string | Date | null; // ISO
    delete: boolean;
  }>;
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

        const {data, error} = await supabase.rpc("update_order", {
            p_order_id: orderId,
            p_updated_by: updatedBy,
            p_items: items,
            p_status: status ?? null,
            p_description: description ?? null
        }); 

        if(error){
            console.error('Error in create updateBatch:', error);
            return { error: error};
        }

        return {success: true, data:data, error:null};
    } catch (err) {
        console.error('Unexpected error in updateBatch:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function rpcReceiveNewOrder({
  supplier_id,
  createdBy,
  received_date,
  description,
  items,
}: {
  supplier_id: number | undefined;
  createdBy: number | undefined;
  received_date?: string | Date | null;
  description?: string;
  items: Array<{
    presentation_id: number;
    quantity_ordered: number;
    quantity_received: number;
    unit_price: number;
    expiration_date: string | Date | null; // ISO
  }>;
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

        const {data, error} = await supabase.rpc("receive_new_order", {
            p_supplier_id: supplier_id,
            p_created_by: createdBy,
            p_items: items,
            p_received_date: received_date ?? null,
            p_description: description ?? null
        }); 

        if(error){
            console.error('Error in create updateBatch:', error);
            return { error: error};
        }

        return {success: true, data:data, error:null};
    } catch (err) {
        console.error('Unexpected error in updateBatch:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function rpcReceiveSuggestedOrder({
  order_id,
  received_by,
  received_date,
  description,
  items,
}: {
  order_id: number | undefined;
  received_by: number | undefined;
  received_date?: string | Date | null;
  description?: string;
  items: Array<{
    presentation_id: number;
    quantity_received: number;
    unit_price: number;
    expiration_date: string | Date | null; // ISO
  }>;
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

        const {data, error} = await supabase.rpc("receive_suggested_order", {
            p_order_id: order_id,
            p_received_by: received_by,
            p_items: items,
            p_received_date: received_date ?? null,
            p_description: description ?? null
        }); 

        if(error){
            console.error('Error in create receive_suggested_order:', error);
            return { error: error};
        }

        return {success: true, data:data, error:null};
    } catch (err) {
        console.error('Unexpected error in receive_suggested_order:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}
