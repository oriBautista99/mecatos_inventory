import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ProductionEventRow } from "@/types/production";
import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon, Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Props {
  data: ProductionEventRow[];
  daily ?: boolean;
  onSelectRow?: (id: number, type:string) => void;
}

export function ProductionHistoryTable({ data, daily, onSelectRow }: Props){

    const t = useTranslations("PROD-HISTORY-TABLE");
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [page, setPage] = useState(1);
    const pageSize = 10; 

    const filteredData = data.filter((prod) => {
        const matchesSearch =
        (prod.profiles?.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
        prod.type_production?.toLowerCase().includes(search.toLowerCase()) ||
        prod.notes?.toLowerCase().includes(search.toLowerCase());

        const matchesDate = selectedDate
            ? new Date(prod.event_date).toDateString() === selectedDate.toDateString()
            : true;

        return matchesSearch && matchesDate;
    });


    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentData = filteredData.slice(startIndex, startIndex + pageSize);

    const handleRowClick = (id: number, type: string | undefined) => {
        if (onSelectRow && type) onSelectRow(id, type);
    };

    if (!data || data.length === 0) {
        return <p className="p-4 text-gray-500">{t("NO-DATA")}</p>
    }

    return(
        <div className="overflow-x-auto space-y-2 p-2">
            <div className="flex flex-col md:flex-row gap-4">
                <Input
                    placeholder={t("SEARCH")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="md:w-1/3"
                />

                {/* DatePicker de Shadcn UI */}
                {
                    !daily &&
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant='outline' id='date' className='w-fit justify-between font-normal'>
                                <span className='flex items-center'>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : t("SELECT-DATE")}
                                    </span>
                                <ChevronDownIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                            />
                        </PopoverContent>
                    </Popover>                    
                }
 
            </div>
            <div className="hidden md:block md:rounded-xl md:border md:border-border shadow">
                <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[70vh]">
                    <Table className="bg-card">
                        <TableHeader>
                            <TableRow className="bg-secondary">
                                <TableHead className="text-foreground font-semibold">{t("DATE")}</TableHead>
                                <TableHead className="text-foreground font-semibold">{t("CREATED_BY")}</TableHead>
                                <TableHead className="text-foreground font-semibold">{t("TYPE")}</TableHead>
                                <TableHead className="text-foreground font-semibold">{t("NOTES")}</TableHead>
                                <TableHead className="text-foreground font-semibold">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.map((prod) => (
                                <TableRow 
                                        className="cursor-pointer" 
                                        onClick={() => handleRowClick(prod.production_event_id, prod.type_production)} 
                                        key={prod.production_event_id}>
                                    <TableCell>{new Date(prod.event_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{prod.profiles.username}</TableCell>
                                    <TableCell>{prod.type_production}</TableCell>
                                    <TableCell>{prod.notes}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                // onClick={() => handleEdit(unit)}
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <ConfirmDialog
                                                trigger={
                                                    <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    title="Eliminar"
                                                    >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                }
                                                title={""}
                                                description={""}
                                                confirmText={""}
                                                cancelText={""}
                                                onConfirm={() => {}}
                                            />

                                            </div>
                                    </TableCell>
                                </TableRow>
                            ))}
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
                        <PaginationLink 
                            isActive={page === i + 1} 
                            onClick={() => setPage(i + 1)}
                            className={cn(
                                'hover:!text-secondary-foreground !border-none !shadow-none',
                                buttonVariants({
                                    variant: 'secondary',
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