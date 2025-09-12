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

  const { data, error } = await supabase.from("categories")
    .select(`
        item_id,
        name,
        description,
        base_unit,
        min_quantity,
        target_quantity,
        is_active,
        created_at,
        suppliers(supplier_id,company_name,contact_name,address,phone,email,frecuency),
        categories(category_id,name,description),
        item_types(item_type_id,name,description),
        storage_areas(storage_area_id,name,description)
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
