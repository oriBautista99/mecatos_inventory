"use client"

import { Button, buttonVariants } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowDownToLine } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

type ApiResponse = {
  ok: true;
  page: number;
  pageSize: number;
  total: number;
  rows: Row[];
} | {
  ok: false;
  error: string;
};

export default function AuditView() {

    const [page, setPage] = useState(1);
    const [pageSize] = useState(100);
    const [movementType] = useState("");
    const [itemId] = useState<string>("");
    const [dateFrom] = useState<string>("");
    const [dateTo] = useState<string>("");
    const [q] = useState("");

    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [err, setErr] = useState<string | null>(null);
    const t = useTranslations("MOVEMENTS-VIEW");

    const query = useMemo(() => {
        const p = new URLSearchParams();
        p.set("page", String(page));
        p.set("pageSize", String(pageSize));
        if (movementType) p.set("movement_type", movementType);
        if (itemId) p.set("item_id", itemId);
        if (dateFrom) p.set("date_from", new Date(dateFrom).toISOString());
        if (dateTo) p.set("date_to", new Date(dateTo).toISOString());
        if (q) p.set("q", q);
        return p.toString();
    }, [page, pageSize, movementType, itemId, dateFrom, dateTo, q]);

    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const res = await fetch(`/api/inventory/movements?${query}`, { cache: "no-store" });
                if (!res.ok) throw new Error(await res.text());
                const json = (await res.json()) as ApiResponse;
                if (!ignore) setData(json);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                if (!ignore) setErr(e?.message ?? "Error al cargar");
                console.log(err)
            } finally {
                const timer: NodeJS.Timeout = setInterval(() => {
                setProgress((old) => {
                        if (old >= 100) {
                            clearInterval(timer)
                            setLoading(false)
                            return 100
                        }
                        return old + 20
                    })
                }, 150)
                return () => clearInterval(timer) 
            }
        })();
        return () => { ignore = true; };
    }, [query]);

    const total = (data && data.ok) ? data.total : 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const rows: Row[] = (data && data.ok) ? data.rows : [];

    return(
        <div className="overflow-y-hidden space-y-4 mx-auto px-2 sm:px-4">
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                <div className="flex flex-col justify-start w-full">
                    <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                    <p className="text-sm text-muted-foreground tracking-tight">
                        {t("DESCRIPTION")}
                    </p>
                </div>
                <Link
                    href="/api/inventory/movements/export"
                >
                    <Button className="flex gap-2 w-fit">
                        <ArrowDownToLine className="h-4 w-4"></ArrowDownToLine>
                        {t("FILE")}
                    </Button>
                
                </Link>
            </div>
            {
                loading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        <span className="text-muted-foreground">{t("LOADING")}</span>
                        <Progress value={progress} className="w-2/3 h-3" />
                    </div>
                ) : (
                    <div className="overflow-x-auto space-y-2">
                        <div className="md:rounded-xl md:border md:border-border shadow">
                            <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[70vh]">
                                <Table className="bg-card">
                                    <TableHeader>
                                        <TableRow className="bg-secondary">
                                            <TableHead className="text-foreground font-semibold">{t("DATE")}</TableHead>
                                            <TableHead className="text-foreground font-semibold">{t("TYPE")}</TableHead>
                                            <TableHead className="text-foreground font-semibold">{t("ITEM")}</TableHead>
                                            <TableHead className="text-foreground font-semibold">{t("QTY")}</TableHead>          
                                            <TableHead className="text-foreground font-semibold">{t("USER")}</TableHead>          
                                            <TableHead className="text-foreground font-semibold">{t("NOTES")}</TableHead>          
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {
                                            rows.map((r) => {
                                                const displayDate = new Date(r.movement_date ?? r.created_at).toLocaleString();
                                                const qtySigned = (r.movement_type === "loss_out" ? -1 : 1) * Number(r.quantity ?? 0);
                                                return(
                                                  <TableRow key={r.movement_id}>
                                                    <TableCell>{displayDate}</TableCell>
                                                    <TableCell>{r.movement_type ?? "-"}</TableCell>
                                                    <TableCell>
                                                         {r.items?.name ?? "-"}{" "}
                                                        <span className="text-xs text-muted-foreground">#{r.item_id ?? "-"}</span>
                                                    </TableCell>
                                                    <TableCell>{qtySigned}</TableCell>
                                                    <TableCell>{r.profiles?.username ?? `#${r.profile_id ?? "-"}`}</TableCell>
                                                    <TableCell>{r.notes ?? "-"}</TableCell>
                                                  </TableRow>  
                                                )
                                            })
                                        }
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination>
                <PaginationContent>
                    <PaginationItem>
                    <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-disabled={page === 1}
                    />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                        <PaginationLink 
                            isActive={page === i + 1} 
                            onClick={() => setPage(i + 1)}
                            className={cn(
                                'hover:!text-secondary-foreground !border-none !shadow-none',
                                buttonVariants({
                                    variant: "ghost",
                                    size: 'icon'
                                })
                            )}
                        >
                        {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                    ))}
                    <PaginationItem>
                    <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        aria-disabled={page === totalPages}
                    />
                    </PaginationItem>
                </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}