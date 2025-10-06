'use server'

import { createClient } from "@/lib/supabase/server";

export async function resolveAlert(alertId: string, resolvedBy: string) {
  
    try {
        const supabase = await createClient(); 
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const { error } = await supabase.rpc('resolve_expiration_alert', {
            p_alert_id: alertId,
            p_resolved_by: resolvedBy
        })

        if (error) throw new Error(error.message)
        return { success: true, error:null }        
    } catch (err) {
        console.error('Unexpected error in resolveAlert:', err);
        return { error: { message: 'Unexpected error occurred - resolveAlert' } }
    }

}

export async function getPendingAlerts(limit?: number) {
    const supabase = await createClient();

    if(limit) { 
        const { data, error } = await supabase
            .from("v_expiration_alerts")
            .select("*")
            .eq("resolved", false)
            .range(0,limit)
            .order("due_date", { ascending: true }); 

        if (error) {
            console.error("Error fetching alerts:", error);
            return { error };
        }

        return { success: true, data };                  
    }else{
        const { data, error } = await supabase
            .from("v_expiration_alerts")
            .select("*")
            .eq("resolved", false)
            .order("due_date", { ascending: true }); 

        if (error) {
            console.error("Error fetching alerts:", error);
            return { error };
        }

        return { success: true, data };   
    }




}