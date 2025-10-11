// actions/inventoryMovements.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export type MovementRow = {
  movement_id: number;
  created_at: string;
  movement_date: string | null;
  movement_type: string | null;
  quantity: number | null;
  notes: string | null;

  item_id: number | null;
  items?: { name: string } | null;

  profile_id: number | null;
  profiles?: { username: string } | null;

  production_event_detail_id: number | null;
  loss_event_detail_id: number | null;
};

export type GetMovementsParams = {
  page?: number;         // default 1
  pageSize?: number;     // default 25
  movement_type?: string;
  item_id?: number;
  date_from?: string;    // ISO 8601
  date_to?: string;      // ISO 8601
  q?: string;            // busca en notes / items.name
};

export async function getInventoryMovements(params: GetMovementsParams = {}) {
  const supabase = await createClient();

  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = Math.max(1, Math.min(200, Number(params.pageSize ?? 25)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("inventory_movement")
    .select(
      `
      movement_id, created_at, movement_date, movement_type, quantity, notes,
      item_id,
      items:item_id ( name ),
      profile_id,
      profiles:profile_id ( username ),
      production_event_detail_id, loss_event_detail_id
    `,
      { count: "exact" }
    )
    // Ordena por movement_date (los nulls al final), luego por created_at
    .order("movement_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.movement_type) query = query.eq("movement_type", params.movement_type);
  if (params.item_id)       query = query.eq("item_id", params.item_id);
  if (params.date_from)     query = query.gte("movement_date", params.date_from);
  if (params.date_to)       query = query.lte("movement_date", params.date_to);
  if (params.q && params.q.trim()) {
    const q = params.q.trim();
    // Busca en notas o en el nombre del ítem (campo embebido)
    query = query.or(`notes.ilike.%${q}%,items.name.ilike.%${q}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return {
    ok: true as const,
    page,
    pageSize,
    total: count ?? 0,
    rows: (data ?? []),
  };
}
