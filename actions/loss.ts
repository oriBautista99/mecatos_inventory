'use server'

import { createClient } from "@/lib/supabase/server";

export async function getLoss(){
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
            .from("loss_events")
            .select(`
            loss_event_id,
            loss_date,
            reason,
            notes,
            profiles(username),
            loss_event_details(
                loss_event_detail_id,
                item_id,
                quantity_lost,
                production_event_detail_id,
                items(name),
                production_event_details(current_quantity)
            )
            `)
            .order("loss_date", { ascending: false });

        if(error){
            console.error('Error in get production event:', error);
            return { error: error};
        }

        return {success: true,data:data, error:null}; 

    } catch (err) {
        console.error('Unexpected error in getProductionEvents:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function createLossEvent(lostData:any) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const { data, error } = await supabase.rpc("create_loss_event", {
            p_profile_id: lostData.profile_id,
            p_reason: lostData.reason,
            p_notes: lostData.notes || null,
            p_loss_date: lostData.loss_date || new Date().toISOString(),
            p_items: lostData.items
        });

        if (error) throw error;
        return { success: true, data, error: null };

    } catch (err) {
        console.error("Unexpected error in createLossEvent:", err);
        return { error: { message: "Unexpected error in createLossEvent" } }
    }
}

export async function updateLossEvent(lossEventId: number, formData: any) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return { error: "Unauthorized" };
        }

        const { data, error } = await supabase.rpc("update_loss_event", {
            p_loss_event_id: lossEventId,
            p_profile_id: formData.profile_id,
            p_reason: formData.reason,
            p_notes: formData.notes,
            p_items: formData.items,
            p_loss_date: formData.loss_date,
        });

        if (error) throw new Error(error.message);
        return { success: true, data, error: null };
    } catch (err) {
        console.error("Unexpected error in updateLossEvent:", err);
        return { error: { message: "Unexpected error occurred" } };
    }
}

export async function getLossEventById(lossEventId: number) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
        .from("loss_events")
        .select(`
            loss_event_id,
            loss_date,
            reason,
            notes,
            profile_id,
            profiles(username),
            loss_event_details(
            loss_event_detail_id,
            item_id,
            quantity_lost,
            items(name, description)
            )
        `)
        .eq("loss_event_id", lossEventId)
        .single();

        if (error) throw error;
        return { success: true, data, error: null };
    } catch (err) {
        console.error("Unexpected error in getLossEventById:", err);
        return { error: { message: "Unexpected error occurred" } };
    }
}
