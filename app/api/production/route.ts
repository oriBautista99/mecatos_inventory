import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    
    const { item_id, quantity, profile_id, event_date, shelf_life_days } = body

    const { data, error } = await supabase.rpc('create_production', {
        p_item_id: item_id,
        p_quantity: quantity,
        p_profile_id: profile_id,
        p_event_date: event_date ?? new Date().toISOString(),
        p_shelf_life_days: shelf_life_days ?? null
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, data })
}