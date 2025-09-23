"use client";

import OrderForm from "@/components/dashboard/orders/order-form";
import { OrdenDetails } from "@/components/dashboard/orders/order_details";
import PresentationOrdesTable from "@/components/dashboard/orders/present_order_table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger,Sheet } from "@/components/ui/sheet";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { fullPresentItems, Order, OrderFromValues } from "@/types/order";
import { BookOpenCheck, ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { isEqual } from "lodash";
import { createOrderDetail, deleteOrderDetail, updateOrder, updateOrderDetail } from "@/actions/orders";
import { toast } from "sonner";

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export default function OrderDetails({ order, presentations }: {order: Order, presentations: fullPresentItems[] }){
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<fullPresentItems[]>([]);
    const { suppliers, isLoading: loadingSuppliers } = useSuppliersSWR();
    const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(true);
    const [progress, setProgress] = useState(0);
    const isLoading = isLoadingOrder || loadingSuppliers;

    const [originalDetails, setOriginalDetails] = useState<fullPresentItems[]>(presentations || []);
    const originalDataRef = useRef<Order | null>(null);
    const originalRef = useRef<fullPresentItems[]>(presentations || []);
    const initializedRef = useRef(false);
    const t = useTranslations("ORDER-DETAILS-PURCHASE");

    useEffect(() => {
        if(order){
            originalDataRef.current = order;         
            const timer: NodeJS.Timeout = setInterval(() => {
                setProgress((old) => {
                    if (old >= 100) {
                        clearInterval(timer)
                        setIsLoadingOrder(false)
                        return 100
                    }
                    return old + 20
                })
            }, 150)        
            return () => clearInterval(timer)
        }
    },[order]);

    useEffect(() => {
        setOriginalDetails(presentations || []);
        originalRef.current = presentations || [];
        initializedRef.current = false;
    }, [presentations]);

    const handleUpdateOrder = useCallback(
        debounce(async (data: OrderFromValues) => {
            if (!order) return;
            const res = await updateOrder(order.order_id, data);
            if (res.error) {
                console.error(res.error);
            } else {
                console.log("Orden actualizada correctamente");
                toast.success(t("SUCCESSFULY-UPDATE-ORDER"));
            }
        }, 800),
        [order]
    );

    const handleOrder = useCallback(
        (data: OrderFromValues) => {
            const original = originalDataRef.current;
            const originalData = {
                supplier_id: original?.supplier_id,
                status: original?.status,
                received_date: original?.received_date ? original?.received_date : undefined,
                expiration_date: original?.expiration_date ? original?.expiration_date : undefined,
                order_id: original?.order_id,
                created_by: original?.created_by
            }
            if (!original) return;
            if (!isEqual(data, originalData)){
                handleUpdateOrder(data);
            }
        },
        [handleUpdateOrder]
    );


    const processSelected = useCallback(async (selected: fullPresentItems[]) => {
        console.log(selected)
        const prevList = originalRef.current || [];
        const prevMap = new Map(prevList.map((p) => [p.presentation_id, p]));
        const nextMap = new Map(selected.map((p) => [p.presentation_id, p]));

        const inserts: fullPresentItems[] = [];
        const updates: fullPresentItems[] = [];
        const deletes: fullPresentItems[] = [];

        // detecta inserts y updates
        for (const [id, item] of nextMap.entries()) {
            const prev = prevMap.get(id);
            if (!prev) {
                inserts.push(item);
            } else {
                const prevDate = prev.expiration_date
                    ? new Date(prev.expiration_date).toISOString()
                    : null;
                const nextDate = item.expiration_date
                    ? new Date(item.expiration_date).toISOString()
                    : null;

                const hasChanged =
                    Number(prev.quantity_orderned) !== Number(item.quantity_orderned) ||
                    Number(prev.quantity_received) !== Number(item.quantity_received) ||
                    Number(prev.unit_price) !== Number(item.unit_price) ||
                    prevDate !== nextDate;

                if (hasChanged) {
                    updates.push(item);
                }
            }
        }

        // detecta deletes
        for (const [id, prev] of prevMap.entries()) {
            if (!nextMap.has(id)) {
                deletes.push(prev);
            }
        }

        try {
            const orderId = originalDataRef.current?.order_id;
            if (!orderId) return;

            for (const item of inserts) {
                const response = await createOrderDetail(orderId, item);
                if(response.data){
                    console.log("CREATE: ", item);
                    toast.success(t("SUCCESSFULY-UPDATE-ORDER"));
                }
            }
            for (const item of updates) {
                if(item.order_detail_id){
                    const response = await updateOrderDetail(order, item);
                    if(response.data){
                        toast.success(t("SUCCESSFULY-UPDATE-ORDER"));
                    }
                }
            }
            for (const item of deletes) {
                const response = await deleteOrderDetail(orderId, item.presentation_id);
                if(response.data){
                    console.log("DELETE: ", item);
                    toast.success(t("SUCCESSFULY-UPDATE-ORDER"));
                }
            }

            // actualiza el original
            originalRef.current = selected;
            setOriginalDetails(selected);
        } catch (err) {
            console.error("Error saving details:", err);
        }
    }, []);

    const debouncedProcess = useCallback(
        debounce((selected: fullPresentItems[]) => {
            processSelected(selected);
        }, 800),
        [processSelected]
    );
    
    const handleUpdate = useCallback(
        (selected: fullPresentItems[]) => {
            setSelectedProducts(selected);

            if (!initializedRef.current) {
                initializedRef.current = true;
                return;
            }

            debouncedProcess(selected);
        },
        [debouncedProcess]
    );

    if(isLoading){
        return (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
                <span className="text-muted-foreground">
                    {t("LOADING")}
                </span>
                <Progress value={progress} className="w-2/3 h-3"/>
            </div>
        );
    }
    
    return(
        <div className="max-h-screen overflow-y-auto space-y-4">
            <div className="flex px-2 md:pb-6 items-center justify-between gap-4">
                <div className="flex flex-col items-start">
                    <h1 className="text-2xl font-bold tracking-tight">{t("ORDER")}: {order.order_id}</h1>
                    <p className="text-sm text-muted-foreground tracking-tight">{t("DESCRIPTION")}</p>
                </div>
                {
                order?.supplier_id && order.status === "RECEIVED" && 
                <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <SheetTrigger asChild>
                    <Button className="w-fit">
                        <BookOpenCheck className="h-4 w-4" />
                        {t("RESUMEN-ORDER")}
                    </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg lg:max-w-xl overflow-y-auto p-6 sm:p-6">
                    <SheetHeader className="space-y-2 sm:space-y-3 mb-3 py-3">
                        <SheetTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
                        {t("DETAILS-ORDER")}
                        </SheetTitle>
                    </SheetHeader>
                    <OrdenDetails
                        presentations={selectedProducts}
                        order={order}
                        mode="VIEW"
                    ></OrdenDetails>
                    </SheetContent>
                </Sheet>            
                }
            </div>
            <div className="w-full flex flex-col gap-4">
                <div className="px-2">
                    {
                        order && suppliers && suppliers?.length > 0 && 
                            <OrderForm 
                                modeForm="EDIT"
                                onSave={handleOrder} 
                                order={order} 
                                suppliers={suppliers}>
                            </OrderForm>
                    }

                </div>
                <div className="px-2 py-6">
                    {
                        order && 
                        <PresentationOrdesTable
                            supplier={order.supplier_id}
                            presentationsOrder={presentations}
                            onUpdate={handleUpdate}
                            mode="EDIT"
                        ></PresentationOrdesTable>                  
                    }
                </div> 
            </div>
        </div>
    );
}