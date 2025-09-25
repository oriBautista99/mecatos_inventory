"use server"

import { createClient } from "@/lib/supabase/server";
import { Item_types, ItemTypesFormValues } from "@/types/itemTypes";

export async function createItemType(type: ItemTypesFormValues) {

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }
        const {data, error: typeError} = await supabase.from('item_types').insert({
            name: type.name,
            description: type.description
        });

        // console.log(data, typeError)

        if(typeError){
            console.error('Error in create item_types:', typeError);
            return { error: typeError};
        }

        return {success: true, error:null};        
    } catch (err) {
        console.error('Unexpected error in item_types:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function updateItemType(type: Item_types, dataType: ItemTypesFormValues) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }
        const {error} = await supabase.from("item_types")
                            .update({
                                name: dataType.name,
                                description: dataType.description,
                            })
                            .eq("item_type_id", type.item_type_id);
        if(error){
            console.error('Error in update item_types:', error);
            return {error: error};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error updating item_types:", err)
        return {error: "Error actualizando item_types" }
    }
}

//delete
export async function deleteItemType(item_type_id: string) {
    try {
        const supabase =  await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }
        const {error} = await supabase.from("item_types").delete().eq("item_type_id",item_type_id);
        if(error){
            console.error('Error in delete item_types:', error);
            return { data: null, error: "ERROR-DELETE-item_types"};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error delete item_types:", err)
        return { data: null, error: "ERROR-DELETE-item_types" }
    }

}

/*export async function getItemTypes(){
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }
        const {data, error} = await supabase.from("item_types").select("*");
        if(error){
            console.error('Error in get categories:', error);
            return { data: null, error: "ERROR-GET-CATEGORIES"};
        }
        return {data: data, error: null};     
    } catch (err) {
        console.error("Error get categories:", err)
        return { data: null, error: "ERROR-GET-CATEGORIES" }
    }
}*/
