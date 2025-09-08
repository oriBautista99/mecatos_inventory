"use server"

import { createClient } from "@/lib/supabase/server";
import { AreaStorageFormValues, Storage_area } from "@/types/storage_area";

export async function createArea(area: AreaStorageFormValues) {
    try {
        const supabase = await createClient();
        const {error: areaError} = await supabase.from("storage_areas").insert({
            name: area.name,
            description: area.description,
            is_active: true
        });

        if(areaError){
            console.error('Error in create Profile:', areaError);
            return { error: areaError};
        }

        return {success: true, error:null};        
    } catch (err) {
        console.error('Unexpected error in createArea:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }

}

export async function updateArea(area: Storage_area, dataArea: AreaStorageFormValues) {
    try {
        const supabase = await createClient();
        const {error} = await supabase.from("storage_areas")
                            .update({
                                name: dataArea.name,
                                description: dataArea.description,
                                is_active: true
                            })
                            .eq("storage_area_id", area.storage_area_id);
        if(error){
            console.error('Error in update area:', error);
            return {error: error};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error updating areas:", err)
        return {error: "Error actualizando areas" }
    }
}

//delete
export async function deleteArea(storage_area_id: string) {
    try {
        const supabase =  await createClient();
        const {error} = await supabase.from("storage_areas").delete().eq("storage_area_id",storage_area_id);
        if(error){
            console.error('Error in delete area:', error);
            return { data: null, error: "ERROR-DELETE-AREAS"};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error delete areas:", err)
        return { data: null, error: "ERROR-DELETE-AREAS" }
    }

}

export async function getAreas(){
    try {
        const supabase = await createClient();
        const {data, error} = await supabase.from("storage_areas").select("*");
        if(error){
            console.error('Error in get areas:', error);
            return { data: null, error: "ERROR-GET-AREAS"};
        }
        return {data: data, error: null};     
    } catch (err) {
        console.error("Error get areas:", err)
        return { data: null, error: "ERROR-GET-AREAS" }
    }
}
