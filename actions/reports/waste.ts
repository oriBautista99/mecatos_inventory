"use server"

import { createClient } from "@/lib/supabase/server";
export type DateRange = { from: string; to: string } // ISO strings "YYYY-MM-DD"

export async function getLossesByItem(range: DateRange) {
    try {
        const supabase = await createClient(); 
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const { data, error } = await supabase.rpc("get_losses_by_item", {
            date_from: range.from,
            date_to: range.to,
        });
        if (error) return { error }
        return { data }
    } catch (err) {
        console.error('Unexpected error in getLossesByItem:', err);
        return { error: { message: 'Unexpected error occurred - getLossesByItem' } }
    }

}

export async function getLossesByReason(range: DateRange, reason?: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_losses_by_reason", {
        date_from: range.from,
        date_to: range.to,
        p_reason: reason || null,
    });

    if (error) throw new Error(error.message);

    return { success: true, data, error: null };
  } catch (err) {
    console.error("Unexpected error in getLossesByReason:", err);
    return { error: { message: "Unexpected error occurred" } };
  }
}

export async function getLossesByDate(range: DateRange) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_losses_by_date", {
        date_from: range.from,
        date_to: range.to,
    });

    if (error) throw new Error(error.message);
    return { success: true, data, error: null };
  } catch (err) {
    console.error("Unexpected error in getLossesByDate:", err);
    return { error: { message: "Unexpected error occurred" } };
  }
}