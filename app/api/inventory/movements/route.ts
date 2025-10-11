// app/api/inventory/movements/route.ts
import { getInventoryMovements } from "@/actions/inventoryMovement";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");
  const movement_type = url.searchParams.get("movement_type") || undefined;
  const item_id = url.searchParams.get("item_id");
  const date_from = url.searchParams.get("date_from") || undefined;
  const date_to = url.searchParams.get("date_to") || undefined;
  const q = url.searchParams.get("q") || undefined;

  const res = await getInventoryMovements({
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
    movement_type,
    item_id: item_id ? Number(item_id) : undefined,
    date_from,
    date_to,
    q,
  });

  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }

  return NextResponse.json(res);
}
