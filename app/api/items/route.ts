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

  // 1) Items con sus relaciones (igual que antes)
  const { data: itemsData, error: itemsError } = await supabase
    .from("items")
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

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // 2) Totales de stock en unidad base desde la vista optimizada
  //    (si creaste v2, cambia el .from('v_item_stock_summary') por 'v_item_stock_summary_v2')
  const { data: stockRows, error: stockError } = await supabase
    .from("v_item_stock_summary")
    .select("item_id, stock_total_base_unit");

  if (stockError) {
    return NextResponse.json({ error: stockError.message }, { status: 500 });
  }

  // 3) Índice por item_id para fusionar rápido
  const stockByItemId = new Map<number, number>();
  (stockRows ?? []).forEach((r: any) => {
    stockByItemId.set(Number(r.item_id), Number(r.stock_total_base_unit ?? 0));
  });

  // 4) Respuesta final: mismo shape que antes + system_quantity desde la vista
  const items = (itemsData ?? []).map((item: any) => {
    const total = stockByItemId.get(Number(item.item_id)) ?? 0;

    return {
      ...item,
      // Compatibilidad con tu UI: usa este campo como el total del sistema
      system_quantity: total,
      // También puedes exponer explícitamente el nombre de la vista si te sirve
      stock_total_base_unit: total,
    };
  });

  return NextResponse.json(items);
}