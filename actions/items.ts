"use server"
import { createClient } from "@/lib/supabase/server";
import { Item, ItemFormValues } from "@/types/item";

export async function createItem(item: ItemFormValues) {
    try {
        const supabase = await createClient();
        // validar sesión con el cliente del request
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {data, error: itemError} = await supabase.from("items").insert({
            name: item.name,
            description: item.description,
            unit_id: item.unit_id,
            min_quantity: item.min_quantity,
            target_quantity: item.target_quantity,
            category_id: item.category_id,
            item_type_id: item.item_type_id,
            storage_area_id: item.storage_area_id,
        }).select().single();

        if(itemError){
            console.error('Error in create category:', itemError);
            return { error: itemError};
        }

        return {success: true, data:data, error:null}; 
    } catch (err) {
        console.error('Unexpected error in category:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function updateItem(item: Item, dataItem: ItemFormValues) {
    try {
        const supabase = await createClient();
        // validar sesión con el cliente del request
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {error} = await supabase.from("items")
                            .update({
                                name: dataItem.name,
                                description: dataItem.description,
                                unit_id: dataItem.unit_id,
                                min_quantity: dataItem.min_quantity,
                                target_quantity: dataItem.target_quantity,
                                category_id: dataItem.category_id,
                                item_type_id: dataItem.item_type_id,
                                storage_area_id: dataItem.storage_area_id,
                            })
                            .eq("item_id", item.item_id);
        if(error){
            console.error('Error in update caregory:', error);
            return {error: error};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error updating categories:", err)
        return {error: "Error actualizando categories" }
    }
}

//delete
export async function deleteItem(item_id: string) {
    try {
        const supabase =  await createClient();
        // validar sesión con el cliente del request
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {error} = await supabase.from("items").delete().eq("item_id",item_id);
        if(error){
            console.error('Error in delete categories:', error);
            return { data: null, error: "ERROR-DELETE-CATEGORIES"};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error delete categories:", err)
        return { data: null, error: "ERROR-DELETE-CATEGORIES" }
    }

}
