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

  const { data: itemsData, error: itemsError } = await supabase
    .from("items")
    .select(`
      *,
      categories ( category_id, name, description ),
      item_types ( item_type_id, name, description ),
      storage_areas ( storage_area_id, name, description ),
      units:unit_id ( unit_id, name, abbreviation ),
      item_presentations (
        item_presentation_id,
        quantity,
        is_default,
        presentation_types (
          presentation_type_id,
          name,
          description,
          conversion_factor,
          unit:unit_id ( unit_id, name, abbreviation )
        ),
        suppliers_presentations (
          supplier_presentation_id,
          suppliers ( supplier_id, company_name, contact_name, email, phone )
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

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const { data: stockRows, error: stockError } = await supabase
    .from("v_item_stock_summary")
    .select("item_id, stock_total_base_unit");

  if (stockError) {
    return NextResponse.json({ error: stockError.message }, { status: 500 });
  }

  const stockByItemId = new Map<number, number>();
  (stockRows ?? []).forEach((r: any) => {
    stockByItemId.set(Number(r.item_id), Number(r.stock_total_base_unit ?? 0));
  });

  const items = (itemsData ?? []).map((item: any) => {
    const total = stockByItemId.get(Number(item.item_id)) ?? 0;

    return {
      ...item,
      system_quantity: total,
      stock_total_base_unit: total,
    };
  });

  return NextResponse.json(items);
}