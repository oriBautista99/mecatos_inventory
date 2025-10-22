"use server"

import { createClient } from "@/lib/supabase/server";
import { UnitFormValues, Units } from "@/types/units";

export async function getUnits(){
    try {
        const supabase = await createClient();
        const {data, error} = await supabase.from("units").select("*");
        if(error){
            console.error('Error in get units:', error);
            return { data: null, error: "ERROR-GET-UNITS"};
        }
        return {data: data, error: null};     
    } catch (err) {
        console.error("Error get units:", err)
        return { data: null, error: "ERROR-GET-UNITS" }
    }
}

export async function createUnit(unit: UnitFormValues) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {error: unitError} = await supabase.from("units").insert({
            name: unit.name,
            abbreviation: unit.abbreviation
        });

        if(unitError){
            console.error('Error in create units:', unitError);
            return { error: unitError};
        }

        return {success: true, error:null};        
    } catch (err) {
        console.error('Unexpected error in units:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function updateUnit(unit: Units, dataUnit: UnitFormValues) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {error} = await supabase.from("units")
                            .update({
                                name: dataUnit.name,
                                abbreviation: dataUnit.abbreviation,
                            })
                            .eq("unit_id", unit.unit_id);
        if(error){
            console.error('Error in update unit:', error);
            return {error: error};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error updating unit:", err)
        return {error: "Error actualizando unit" }
    }
}

//delete
export async function deleteUnit(unit_id: string) {
    try {
        const supabase =  await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {error} = await supabase.from("units").delete().eq("unit_id",unit_id);
        if(error){
            console.error('Error in delete unit:', error);
            return { data: null, error: "ERROR-DELETE-UNIT"};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error delete unit:", err)
        return { data: null, error: "ERROR-DELETE-UNIT" }
    }

}
