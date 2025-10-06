"use server"
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS } from "@/types/constants";
import { fullPresentItems, itemBatches, mapSupabaseDataToPresentations, Order, OrderDetails, OrderFromValues } from "@/types/order";

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

export async function updateOrder(order_id: number | undefined, data: OrderFromValues | Order) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }
        const {error} = await supabase.from("orders")
                            .update({
                                order_id : data.order_id,
                                received_date: data.received_date,
                                expiration_date: data.expiration_date,
                                status: data.status,
                                supplier_id: data.supplier_id,
                                description: data.description
                            })
                            .eq("order_id", order_id);
        if(error){
            console.error('Error in update supplier:', error);
            return {error: error};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error updating order:", err)
        return { success: false, error: "Error actualizando order" }        
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
            console.error('Error in createOrderDetails:', presError);
            return { error: presError};
        }
    } catch (err) {
        console.error('Unexpected error in order details:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function createOrderDetail(orderId: number | undefined, detail: fullPresentItems) {
  try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {data, error: presError} = await supabase.from("order_details").insert({
            order_id: orderId,
            presentation_id: detail.presentation_id,
            quantity_ordered: detail.quantity_orderned,
            quantity_received: detail.quantity_received,
            unit_price: detail.unit_price
        }).select().single();
          
        if(presError){
            console.error('Error in createOrderDetail:', presError);
            return { error: presError};
        }
        return {success: true, data:data, error:null};
  } catch (err) {
        console.error('Unexpected error in createOrderDetail:', err);
        return { error: "Error create deatils" }  
  }

}

export async function updateOrderDetail(order: Order, detail: fullPresentItems) {
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
        .update({
            quantity_ordered: detail.quantity_orderned,
            quantity_received: detail.quantity_received,
            unit_price: detail.unit_price,
        })
        .eq("order_detail_id", detail.order_detail_id)
        .select().single();  


        if(order.status === 'RECEIVED' && data ){
            const response = await updateBatches(data, detail);
            if(response.success){
                return {success: true, data:data, error:null};
            }
        }
        
        if(presError){
            console.error('Error in updateOrderDetail:', presError);
            return { error: presError};
        }
        return {success: true, data:data, error:null};
  } catch (err) {
        console.error('Unexpected error updateOrderDetail:', err);
        return { error: "Error update deatils" }  
  }

}

export async function deleteOrderDetail(orderId: number, presentationId: number) {
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
            .delete()
            .eq("order_id", orderId)
            .eq("presentation_id", presentationId);  

        if(presError){
            console.error('Error in deleteOrderDetail:', presError);
            return { error: presError};
        }
        return {success: true, data:data, error:null};    
        
    } catch (err) {
        console.error('Unexpected error deleteOrderDetail:', err);
        return { error: "Error delete deatils" } 
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
        console.error('Unexpected error createNewsBatches:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function createBatch(newBatch: Omit<itemBatches,"batch_id">){
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
            .insert(newBatch)
            .select();
        if(error){
            console.error('Error in create createBatch:', error);
            return { error: error};
        }

        return {success: true, error:null};
    } catch (err) {
        console.error('Unexpected error in createBatch:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function updateBatches(order_detail: OrderDetails, detail: fullPresentItems){
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
                quantity_batch: detail.quantity_received,
                current_quantity: detail.quantity_received,
                expiration_date: detail.expiration_date
            })
        .eq("order_detail_id", order_detail.order_detail_id)
        .eq("presentation_id", detail.presentation_id); 
        if(error){
            console.error('Error in create updateBatches:', error);
            return { error: error};
        }

        return {success: true, error:null};
    } catch (err) {
        console.error('Unexpected error in updateBatches:', err);
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