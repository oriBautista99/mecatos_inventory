"use server"

import { createClient } from "@/lib/supabase/server";
import { TypePresentation, TypePresentationFormValues } from "@/types/type_presentation";

export async function getTypePresentation(){
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }
        const {data, error} = await supabase.from("presentation_types").select("*");
        if(error){
            console.error('Error in get categories:', error);
            return { data: null, error: "ERROR-GET-CATEGORIES"};
        }
        return {data: data, error: null};     
    } catch (err) {
        console.error("Error get categories:", err)
        return { data: null, error: "ERROR-GET-CATEGORIES" }
    }
}

export async function createPresentationType(type: TypePresentationFormValues) {

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }
        const {error: typeError} = await supabase.from('presentation_types').insert({
            name: type.name,
            description: type.description,
            conversion_factor: type.conversion_factor,
            unit_id: type.unit_id
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

export async function updatePresentationType(type: TypePresentation, dataType: TypePresentationFormValues) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }
        const {error} = await supabase.from("presentation_types")
                            .update({
                                name: dataType.name,
                                description: dataType.description,
                                conversion_factor: dataType.conversion_factor,
                                unit_id: dataType.unit_id
                            })
                            .eq("presentation_type_id", type.presentation_type_id);
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
export async function deletePresentationType(presentation_type_id: string) {
    try {
        const supabase =  await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); 
        }
        const {error} = await supabase.from("presentation_types").delete().eq("presentation_type_id",presentation_type_id);
        if(error){
            console.error('Error in delete presentation_type_id:', error);
            return { data: null, error: "ERROR-DELETE-presentation_type_id"};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error delete presentation_type_id:", err)
        return { data: null, error: "ERROR-DELETE-presentation_type_id" }
    }

}
