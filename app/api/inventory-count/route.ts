"use server"

import { NextResponse } from "next/server";
import { saveInventoryCount } from "@/actions/inventory";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {

    // body should be { counted_by: number, items: [{ item_id, counted_quantity }] }
    const body = await req.json();
    const { profile_id, countedItems } = body;

    const supabase = await createClient();

  try {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await saveInventoryCount(profile_id, countedItems);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true, count_id: result.count_id });
  } catch (err) {
    console.error("API inventory-count error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}