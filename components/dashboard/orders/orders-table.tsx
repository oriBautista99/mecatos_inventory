import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types/order";
import { StatusBadge } from "./StatusBadgeOrder";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Edit, PackageCheck, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-delete-dialog";

type OrdersTableProps = {
  data: Order[];
  mode: 'RECEIVED' | 'all'
};

export default function OrdersTable({ data, mode }: OrdersTableProps) {

    const pathname = usePathname(); 
    const t = useTranslations("ORDERS-TABLE");
    const router = useRouter();

    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.ceil(data.length / pageSize);

    const startIndex = (page - 1) * pageSize;
    const currentData = data.slice(startIndex, startIndex + pageSize);

    const handleRowClick = (orderId:number | undefined) => {
      router.push(`${pathname}/${orderId}`);
    };
  
    if (!data.length) {
        return <p className="text-center text-sm text-muted-foreground">{t("NO-ORDERS")}</p>;
    }

      
    // const handleDelete = async (id: number) => {
      // const response = await deleteOrder(id);
      // if (response.success){ 
      //   toast.success(t("SUCCESS-DELETE"));
      // } else{ 
      //   toast.error(t("ERROR-DELETE"));
      // }
    // }


    return(
        <div className="overflow-x-auto space-y-2">
            <div className="hidden md:block md:rounded-xl md:border md:border-border shadow">
              <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[60vh]">
                <Table className="bg-card">
                    <TableHeader>
                        <TableRow className="bg-secondary">
                            <TableHead className="text-foreground font-semibold">{t("N-ORDER")}</TableHead>
                            <TableHead className="text-foreground font-semibold">{t("SUPPLIER")}</TableHead>
                            <TableHead className="text-foreground font-semibold">{t("CREATED_AT")}</TableHead>
                            <TableHead className="text-foreground font-semibold">{t("STATUS")}</TableHead>          
                            {
                              mode != 'RECEIVED' && <TableHead className="text-foreground font-semibold">{t("RECEIVED_DATE")}</TableHead>
                            }                  
                            
                            <TableHead className="text-foreground font-semibold">{t("EXPIRATION_DATE")}</TableHead>
                            <TableHead className="text-foreground font-semibold">{t("ACTIONS")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.map((order) => (
                            <TableRow className="cursor-pointer" key={order.order_id}>
                                <TableCell>{order.order_id}</TableCell>
                                <TableCell>{order.suppliers && order.suppliers.company_name}</TableCell>
                                <TableCell>{order.created_at && new Date(order.created_at).toDateString()}</TableCell>
                                <TableCell>
                                    <StatusBadge status={order.status} />
                                </TableCell>  
                                {
                                  mode != 'RECEIVED' && <TableCell>{order.received_date && new Date(order.received_date).toDateString()}</TableCell>
                                }                              
                                <TableCell>{order.expiration_date &&  new Date(order.expiration_date).toDateString()}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleRowClick(order.order_id)}
                                        title="Editar"
                                    >
                                      {
                                        mode === 'RECEIVED' ? 
                                        <PackageCheck className="h-4 w-4" /> : 
                                        <Edit className="h-4 w-4" />
                                      }
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
                                        title={t("DELETE-ORDER")}
                                        description={t("DELETE-DESCRIPTION")}
                                        confirmText={t("DELETE")}
                                        cancelText={t("CANCEL")}
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
            <div className="grid gap-4 md:hidden">
              {currentData.map((order) => (
                <Link key={order.order_id} href={`${pathname}/${order.order_id}`}>
                  <Card className="p-4 bg-secondary cursor-pointer hover:bg-primary/20">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">
                          {t("N-ORDER")}: {order.order_id}
                        </h3>
                        <p className="text-xs text-muted-foreground">{order.description}</p>                      
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground space-y-2">
                      <p><span className="font-semibold text-foreground">{t("SUPPLIER")}: </span> {order.suppliers?.company_name}</p>
                      <p><span className="font-semibold text-foreground">{t("CREATED_AT")}: </span>{order.created_at && new Date(order.created_at).toLocaleDateString()}</p>
                      <p><span className="font-semibold text-foreground">{t("EXPIRATION_DATE")}: </span>{order.expiration_date && new Date(order.expiration_date).toLocaleDateString()}</p>
                    </div>
                  </Card>                
                </Link>
              ))}
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
    );
}