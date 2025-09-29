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
        .from('production_status')
        .select('*')
        .or('resolved.is.null,resolved.eq.false')
        .gt('remaining', 0)
        .order('due_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
}