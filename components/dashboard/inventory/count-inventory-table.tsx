import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CountTableRow } from "@/types/inventory";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";


type OrdersTableProps = {
    data: CountTableRow[];
    onChange?: (updateData: CountTableRow[]) => void;
    mode: "CREATE" | "EDIT";
};

export default function CountInventoryTable({ data, onChange, mode }: OrdersTableProps){

    const t = useTranslations("COUNT-INVENTORY-TABLE");

    const [page, setPage] = useState(1);
    const pageSize = 10; 
    const totalPages = Math.ceil(data.length / pageSize);

    const startIndex = (page - 1) * pageSize;
    
    const currentData = data.slice(startIndex, startIndex + pageSize);
    const [counts, setCounts] = useState<Record<number, number>>(() => {
    const initialCounts: Record<number, number> = {};
        data.forEach((item) => {
            if (item.counted_quantity !== undefined && item.counted_quantity !== null) {
                initialCounts[item.item_id] = item.counted_quantity;
            }
        });
        return initialCounts;
    });

    const dataRef = useRef(data);
    dataRef.current = data;

    useEffect(() => {
        if (!onChange) return; 
        const updatedData = dataRef.current.map((item) => ({
            ...item,
            counted_quantity: counts[item.item_id] ?? item.counted_quantity,
        }));

        const hasChanged = dataRef.current.some((item) => {
            const currentCount = item.counted_quantity;
            const newCount = counts[item.item_id];
            return (newCount !== undefined && newCount !== currentCount) || 
                (newCount === undefined && currentCount !== undefined);
        });
        if (hasChanged) {
        onChange(updatedData);
    }

    }, [counts, onChange]);

    const handleCountChange = (itemId: number, value: string) => {
        setCounts((prev) => {
            const parsed = value === "" ? undefined : Number(value);
            const updatedCounts = { ...prev };
            
            if (parsed === undefined) {
                delete updatedCounts[itemId];
            } else {
                updatedCounts[itemId] = parsed;
            }
                        
            return updatedCounts;
        });
    };
      
    if (!data.length) {
        return <p className="text-center text-sm text-muted-foreground">{t("NO-ITEMS")}</p>;
    }

    return(
        <div className="overflow-x-auto space-y-2">
            <div className="md:rounded-xl md:border md:border-border shadow">
                <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[65vh]">
                    <Table className="bg-card">
                        <TableHeader>
                            <TableRow className="bg-secondary uppercase text-md tracking-tight">
                                <TableHead className="text-foreground font-bold ">{t("INVENTORY")}</TableHead>
                                <TableHead className="text-foreground font-bold ">{t("THERE-IS")}</TableHead>
                                {mode === "CREATE" && (
                                    <TableHead className="text-foreground font-bold ">
                                    {t("THERE-MUST-BE")}
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                            currentData.map(it => {
                                return(
                                    <TableRow key={it.item_id} className="text-md tracking-tight font-semibold">
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium text-md">{it.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 min-w-25 w-28 max-w-xs relative">
                                                <Input
                                                    type="number"
                                                    value={counts[it.item_id]?.toString() ?? ""}
                                                    onChange={(e) => handleCountChange(it.item_id, e.target.value)}
                                                    className="pl-5 w-full max-w-sm text-md"
                                                />
                                                <div className='text-muted-foreground pointer-events-none absolute inset-y-1 end-0 flex items-center justify-center pe-8 peer-disabled:opacity-50'>
                                                    <span>{it.base_unit}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {mode === "CREATE" && (
                                            <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">
                                                {it.system_quantity} {it.base_unit}
                                                </div>
                                            </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )
                            })                                            
                        }
                        </TableBody>
                    </Table>
                </div>
            </div>

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
                            <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>
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
    )
}