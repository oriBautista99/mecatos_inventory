import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { LossEventRow } from "@/types/loss";
import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { useState } from "react";

interface Props {
  data: LossEventRow[];
  onSelectRow?: (id: number) => void;
}

export default function LossTable({ data, onSelectRow }: Props) {

    const t = useTranslations("LOSS-TABLE");
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [page, setPage] = useState(1);
    const pageSize = 10; 

    const filteredData = data.filter((prod) => {
        const matchesSearch =
        (prod.profiles?.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
        prod.reason?.toLowerCase().includes(search.toLowerCase()) ||
        prod.notes?.toLowerCase().includes(search.toLowerCase());

        const matchesDate = selectedDate
            ? new Date(prod.loss_date).toDateString() === selectedDate.toDateString()
            : true;

        return matchesSearch && matchesDate;
    });


    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentData = filteredData.slice(startIndex, startIndex + pageSize);

    const handleRowClick = (id: number) => {
        if (onSelectRow) onSelectRow(id);
    };

    if (!data || data.length === 0) {
        return <p className="p-4 text-gray-500">{t("NO-REGISTER")}</p>
    }

    return(
        <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row lg:flex-wrap gap-4">
                <div className="relative flex-1 max-w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder={t("SEARCH")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 w-full text-sm"
                    />                    
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant='outline' id='date' className='w-full md:w-fit justify-between font-normal'>
                            <span className='flex items-center'>
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {selectedDate ? format(selectedDate, "dd/MM/yyyy") : t("DATE-SEARCH")}
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
            </div>
            <div  className="md:rounded-xl md:border md:border-border shadow">
                <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[60vh]">
                    <Table className="bg-card">
                        <TableHeader>
                            <TableRow className="bg-secondary">
                                <TableHead className="text-foreground font-semibold">{t("DATE")}</TableHead>
                                <TableHead className="text-foreground font-semibold">{t("REGISTER_BY")}</TableHead>
                                <TableHead className="text-foreground font-semibold">{t("REASON")}</TableHead>
                                <TableHead className="text-foreground font-semibold">{t("NOTE")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.map((prod) => (
                                <TableRow 
                                        className="cursor-pointer" 
                                        onClick={() => handleRowClick(prod.loss_event_id)} 
                                        key={prod.loss_event_id}>
                                    <TableCell>{new Date(prod.loss_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{prod.profiles.username}</TableCell>
                                    <TableCell>{prod.reason}</TableCell>
                                    <TableCell>{prod.notes}</TableCell>
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
    )
}