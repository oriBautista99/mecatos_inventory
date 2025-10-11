"use server";

import { createClient } from "@/lib/supabase/server";

export async function suggestedOrders(profileId: number){
    try {

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }

        const { data, error } = await supabase.rpc('generate_suggested_orders', {
            p_created_by: profileId
        });

        if(error){
            console.error('Error in generate_suggested_orders:', error);
            return { error: error};
        }

        return {success: true, data:data,  error:null};
    } catch (err) {
        console.error('Unexpected error in suggest-orders:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}