import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.from("items")
    .select(`
        *,
        categories(category_id,name,description),
        item_types(item_type_id,name,description),
        storage_areas(storage_area_id,name,description),
        presentations(
          *,
          suppliers_presentations(
            suppliers(*)
          )
        )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
