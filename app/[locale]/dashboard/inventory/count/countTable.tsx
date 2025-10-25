"use client"

import { getInventoryHistory } from "@/actions/inventory";
import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { InventoryCount, InventoryCountDetail, Profiles } from "@/types/inventory";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CountTable(){
    
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [counts, setCounts] = useState<(InventoryCount & { inventory_counts_details: InventoryCountDetail[] } & {profiles: Profiles})[]>([]);  
  const router = useRouter();
  const pathname = usePathname(); 
  const t = useTranslations("COUNTS");

  async function loadCounts() {
    const data  = await getInventoryHistory();
    if(data) {
        setCounts(data);
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
    }else{
      toast.error('Error al cargar conteos');
    }
  }

  useEffect(() => {
    loadCounts();
  }, []);

  //filters
  const filteredCounts = counts && counts.filter(
    (item) =>
      item.profiles.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //pagination
  const [page, setPage] = useState(1);
  const pageSize = 10; 
  const totalPages = filteredCounts && Math.ceil(filteredCounts.length / pageSize);

  const startIndex = (page - 1) * pageSize;
  const currentData = filteredCounts && filteredCounts.slice(startIndex, startIndex + pageSize);

  //redirect for row
  const handleRowClick = (count_id:number | undefined) => {
    router.push(`${pathname}/${count_id}`);
  };

  return(
    <div className="overflow-y-hidden space-y-4 mx-auto px-2 sm:px-4">
      <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
        <div className="flex flex-col justify-start w-full">
          <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
          <p className="text-sm text-muted-foreground tracking-tight">
           {t("DESCRIPTION")}
          </p>
        </div>
        <Link  className="w-full md:w-fit" href={'./count/new_count'}>
          <Button className="w-full md:w-fit">
            <Plus className="mr-2 h-4 w-4"></Plus>
            {t("NEW_COUNT")}
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
          <div className="flex flex-col space-y-4">
            {/* Search Bar Mobile */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                <Input
                  placeholder={t("SEARCH")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div  className="md:rounded-xl md:border md:border-border shadow">
              <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[70vh]">
                <Table className="bg-card">
                  <TableHeader>
                    <TableRow className="bg-secondary">
                      <TableHead className="text-foreground font-semibold">{t("N-COUNT")}</TableHead>
                      <TableHead className="text-foreground font-semibold">{t("T-USER")}</TableHead>
                      <TableHead className="text-foreground font-semibold">{t("T-DATE")}</TableHead>
                      {/* <TableHead className="hidden md:table-cell text-foreground font-semibold">{t("T-NOTES")}</TableHead> */}
                      <TableHead className="hidden md:table-cell text-foreground font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {
                      currentData?.map((count) => (
                        <TableRow className="cursor-pointer"  onClick={() => handleRowClick(count.count_id)} key={count.count_id}>
                          <TableCell>{count.count_id}</TableCell>
                          <TableCell>{count.profiles.username}</TableCell>
                          <TableCell>{new Date(count.created_at).toLocaleString()}</TableCell>
                          {/* <TableCell className="hidden md:table-cell">{count.notes}</TableCell> */}
                          <TableCell className="hidden md:table-cell">
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
                      ))
                    }
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* Pagination */}
            {
            totalPages > 1 && (
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
    </div>
  );
}