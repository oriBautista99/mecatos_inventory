import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server'

export async function GET() {
    
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
        
    const { data, error } = await supabase
        .from('production_events')
        .select('item_id, quantity_produced, event_date, items(name)')
        .order('event_date', { ascending: false })
        .limit(50) // puedes ajustar o agrupar en SQL/vista

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
}