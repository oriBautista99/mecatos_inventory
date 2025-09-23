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

        const res = await fetch('/api/generate-suggested-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            created_by: profileId, 
            }),
        });

        const data = await res.json();
        //console.log(data)
        if(!res.ok){
            console.error('Error in generated orders:', data.error);
            return { error: data.error};
        }
        return {success: true, data:data,  error:null};
    } catch (err) {
        console.error('Unexpected error in suggest-orders:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}