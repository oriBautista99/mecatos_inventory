"use server"

import { createClient } from "@/lib/supabase/server";


export type DateRange = { from: string; to: string } // ISO strings "YYYY-MM-DD"

export async function getTopProducedByItem(range: DateRange, limit = 10, itemId?: number) {
    try {
        const supabase = await createClient(); 
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }

        const { data, error } = await supabase.rpc("get_top_produced_by_item", {
                    date_from: range.from,
                    date_to: range.to,
                    limit_count: limit,
                    item_filter: itemId ?? null
                });

        if (error) return { error }

        return { data , error}

    } catch (err) {
        console.error('Unexpected error in getTopProducedByItem:', err);
        return { error: { message: 'Unexpected error occurred - getTopProducedByItem' } }
    }
 
}

export async function getDailyProductionSeries(range: DateRange, itemId?: number) {
    try {
        const supabase = await createClient(); 
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const { data, error } = await supabase.rpc("get_daily_production_series", {
            date_from: range.from,
            date_to: range.to,
            item_filter: itemId ?? null,
        });
        if (error) return { error }
        return { data }        
    } catch (err) {
        console.error('Unexpected error in getDailyProductionSeries:', err);
        return { error: { message: 'Unexpected error occurred - getDailyProductionSeries' } }
    }
}



export async function getShowcaseSnapshot(range?: DateRange) {
    try {
        const supabase = await createClient(); 
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const { data, error } = await supabase.rpc("get_expiration_snapshot", {
            date_from: range ? range.from : null,
            date_to: range ? range.to : null,
        });
        if (error) return { error }
        return { data }        
    } catch (err) {
        console.error('Unexpected error in getShowcaseSnapshot:', err);
        return { error: { message: 'Unexpected error occurred - getShowcaseSnapshot' } }
    }

}

export async function getShowcaseAging() {
    try {
        const supabase = await createClient(); 
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        // Buckets por días hasta vencimiento
        const { data, error } = await supabase
            .from("v_expiration_alerts")
            .select("item_id,item_name,due_date,remaining_quantity")
            .eq("resolved", false)

        if (error) return { error }

        //agrupamos por buckets (0-1, 2-3, 4+ días)
        return { data }        
    } catch (err) {
        console.error('Unexpected error in getShowcaseAging:', err);
        return { error: { message: 'Unexpected error occurred - getShowcaseAging' } }
    }

}