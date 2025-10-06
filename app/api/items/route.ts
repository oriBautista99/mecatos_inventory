import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
          ),
          item_batches (
            batch_id,
            current_quantity,
            received_date,
            expiration_date,
            is_active,
            order_detail_id,
            created_at
          )            
        )

    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items: any[] = data.map((item: any) => {
    const system_quantity = item.presentations.reduce((acc:any, pres:any) => {
      const sumBatches = pres.item_batches && pres.item_batches
        .filter((b:any) => b.is_active)
        .reduce((s:any, b:any) => s + b.current_quantity, 0);
      return acc + (sumBatches ? sumBatches: 0) * pres.conversion_factor;
    }, 0);
    return {
      ...item,
      system_quantity
    }
  });

  return NextResponse.json(items);
}
