"use server"

import { createClient } from "@/lib/supabase/server";

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