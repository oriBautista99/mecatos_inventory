import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Row = {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function escapeCSV(v: any) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function iso(dt?: string | null) {
  if (!dt) return "";
  try { return new Date(dt).toISOString(); } catch { return String(dt); }
}

async function fetchAllMovements(): Promise<Row[]> {
  const supabase = await createClient();
  const pageSize = 1000;
  let from = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("inventory_movement")
      .select(
        `
        movement_id, created_at, movement_date, movement_type, quantity, notes,
        item_id,
        items:item_id ( name ),
        profile_id,
        profiles:profile_id ( username ),
        production_event_detail_id, loss_event_detail_id
      `
      )
      .order("movement_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);

    const batch = (data ?? []);
    out.push(...batch);

    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return out;
}

export async function GET() {
  try {
    const rows = await fetchAllMovements();

    // calcular rango (min/max) de movement_date/created_at para el encabezado
    const dates = rows.map(r => r.movement_date ?? r.created_at).filter(Boolean) as string[];
    const minDate = dates.length ? new Date(Math.min(...dates.map(d => +new Date(d)))).toISOString() : "—";
    const maxDate = dates.length ? new Date(Math.max(...dates.map(d => +new Date(d)))).toISOString() : "—";

    const metaTitle = "Auditoria de Movimientos de Inventario";
    const generatedAt = new Date().toISOString();

    // encabezado “humano”
    const headerLines = [
      metaTitle,
      `Rango detectado: ${minDate} a ${maxDate}`,
      `Descargado el: ${generatedAt}`,
      "", // línea en blanco
    ];

    // columnas
    const columns = [
      "movement_id",
      "movement_date",
      "created_at",
      "movement_type",
      "item_id",
      "item_name",
      "quantity_signed",
      "quantity_raw",
      "profile_id",
      "profile_username",
      "notes",
      "production_event_detail_id",
      "loss_event_detail_id",
    ];

    // filas
    const rowsCSV = rows.map(r => {
      const qtySigned = (r.movement_type === "loss_out" ? -1 : 1) * Number(r.quantity ?? 0);
      return [
        r.movement_id,
        iso(r.movement_date ?? r.created_at),
        iso(r.created_at),
        r.movement_type ?? "",
        r.item_id ?? "",
        r.items?.name ?? "",
        qtySigned,
        r.quantity ?? "",
        r.profile_id ?? "",
        r.profiles?.username ?? "",
        r.notes ?? "",
        r.production_event_detail_id ?? "",
        r.loss_event_detail_id ?? "",
      ].map(escapeCSV).join(",");
    });

    const csv = [...headerLines, columns.join(","), ...rowsCSV].join("\n");

    const filename = `movimientos_all_${minDate?.slice(0,10)}_${maxDate?.slice(0,10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Export error" }, { status: 500 });
  }
}
