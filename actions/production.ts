'use server'

import { createClient } from "@/lib/supabase/server";
import { ProductionEvent } from "@/types/production";

export async function createProduction(productionData:any) {

    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        console.log(productionData)
        
        const { data, error } = await supabase.rpc('create_production_event', {
            p_profile_id: productionData.profileId,
            p_notes: productionData.notes,
            p_items: productionData.items,
            p_event_date: new Date().toISOString(),
            p_type_production: productionData.typeProduction
        });

        if (error) throw new Error(error.message)
        return {success: true, data:data, error:null};      

    } catch (err) {
        console.error('Unexpected error in create production:', err);
        return { error: { message: 'Unexpected error create production' } }
    }

}

export async function getProductionEvents(date_event?: string){ //YYYY-MM-DD
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        let query = supabase
            .from('production_events')
            .select(`
                production_event_id,
                event_date,
                notes,
                profile_id,
                created_at,
                type_production,
                profiles(
                    username
                )
            `)
            .order('event_date', { ascending: false });
        
        if (date_event) {
            // Filtrar eventos cuya fecha caiga en ese día
            query = query.gte('event_date', `${date_event} 00:00:00`).lt('event_date', `${date_event} 23:59:59`)
        }

        const { data, error } = await query;
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

export async function getProductionById(production_event_id:number) {

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
            .from('production_events')
            .select(`
                production_event_id,
                event_date,
                notes,
                profile_id,
                created_at,
                type_production,
                profiles(username),
                production_event_details(
                    production_event_detail_id,
                    item_id,
                    quantity_produced,
                    current_quantity,
                    shelf_life_days,
                    hour,
                    created_at,
                    items(
                        item_id,
                        name,
                        description,
                        shelf_life_days
                    )
                )
            `)
            .eq('production_event_id', production_event_id)
            .order('created_at', { ascending: false }).single();
        
            
            const normalized = {
            ...data,
            profiles: Array.isArray(data?.profiles) ? data.profiles[0] : data?.profiles,
            };

        if(error){
            console.error('Error in create getProductionDetails:', error);
            return { error: error};
        }

        return {success: true,data:normalized, error:null};           
    } catch (err) {
        console.error('Unexpected error in getProductionHistory:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }

}

export async function updateProductioEvent(eventId:number, productionData: Partial<ProductionEvent>){
    
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const { error } = await supabase
            .from('production_events')
            .update(productionData)
            .eq('production_event_id', eventId);
        
        if(error){
            console.error('Error in create category:', error);
            return { error: error};
        }
        return {success: true, error:null};
    } catch (err) {
        console.error('Unexpected error in updateProductionDetails:', err);
        return { error: { message: 'Unexpected error occurred updateProductionDetails' } }
    }
}

export async function updateProductionDetails(detailData:any[]){
    
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const { error } = await supabase.rpc("update_production_event_details", {
            p_items: detailData
        }); 
        
        if(error){
            console.error('Error in create category:', error);
            return { error: error};
        }
        return {success: true, error:null};
    } catch (err) {
        console.error('Unexpected error in updateProductionDetails:', err);
        return { error: { message: 'Unexpected error occurred updateProductionDetails' } }
    }
}