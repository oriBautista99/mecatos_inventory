"use client";

import { rpcUpdateOrder } from "@/actions/orders";
import OrderForm from "@/components/dashboard/orders/order-form";
import { OrdenDetails } from "@/components/dashboard/orders/order_details";
import PresentationOrdesTable from "@/components/dashboard/orders/present_order_table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger, Sheet } from "@/components/ui/sheet";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { useProfileLoginSWR } from "@/hooks/useUserLogin";
import { fullPresentItems, Order, OrderFromValues } from "@/types/order";
import { BookOpenCheck, ClipboardList, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useCallback, useState, useRef } from "react";
import { toast } from "sonner";

export default function OrderDetails({
  order,
  presentations,
}: {
  order: Order;
  presentations: fullPresentItems[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { suppliers, isLoading: loadingSuppliers } = useSuppliersSWR();
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(true);
  const [progress, setProgress] = useState(0);
  const [orderData, setOrderData] = useState<OrderFromValues | Order | null>(order);
  const [tableData, setTableData] = useState<fullPresentItems[]>(presentations || []);
  const userLogin = useProfileLoginSWR();
  const originalRef = useRef<fullPresentItems[]>(presentations || []);
  const isLoading = isLoadingOrder || loadingSuppliers;
  const t = useTranslations("ORDER-DETAILS-PURCHASE");


  useEffect(() => {
    if (order) {
      const timer: NodeJS.Timeout = setInterval(() => {
        setProgress((old) => {
          if (old >= 100) {
            clearInterval(timer);
            setIsLoadingOrder(false);
            return 100;
          }
          return old + 20;
        });
      }, 150);
      return () => clearInterval(timer);
    }
  }, [order]);


  useEffect(() => {
    setTableData(presentations || []);
    originalRef.current = presentations || [];
  }, [presentations]);


  const handleFormChange = useCallback((data: OrderFromValues) => {
    setOrderData((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
      return data;
    });
  }, []);

  const handleTableChange = useCallback((selected: fullPresentItems[]) => {
    setTableData(selected);
  }, []);

  const handlePrintData = useCallback(async () => {
    const prevList = originalRef.current || [];
    const prevMap = new Map(prevList.map((p) => [p.presentation_id, p]));
    const nextMap = new Map(tableData.map((p) => [p.presentation_id, p]));

    const itemsData = tableData.map(item => {
        return(
            { 
                presentation_id:item.presentation_id, 
                quantity_ordered:(item.quantity_orderned * item.presentation_quantity), 
                quantity_received:(item.quantity_received * item.presentation_quantity), 
                unit_price:item.unit_price, 
                expiration_date:item.expiration_date, 
                delete: false 
            }
        )
    });

    for (const [id, prev] of prevMap.entries()) {
        if (!nextMap.has(id)) {
            itemsData.push({
                presentation_id:prev.presentation_id, 
                quantity_ordered:prev.quantity_orderned, 
                quantity_received:prev.quantity_received, 
                unit_price:prev.unit_price, 
                expiration_date:prev.expiration_date, 
                delete: true 
            });
        }
    }

    try {
        const response =await rpcUpdateOrder({
            orderId: orderData?.order_id,
            updatedBy: userLogin.profile?.profile_id,
            description: orderData?.description,
            status: orderData?.status,
            items: itemsData
        });
        if(response.data){
            toast.success(t("SUCCESSFULY-UPDATE-ORDER"));
        }
    } catch (err) {
        console.error("Error update order:", err);
    }
  }, [orderData, tableData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <span className="text-muted-foreground">{t("LOADING")}</span>
        <Progress value={progress} className="w-2/3 h-3" />
      </div>
    );
  }

  return (
    <div className=" overflow-y-hidden space-y-4">
      <div className="flex px-2 md:pb-6 items-center justify-between gap-4">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("ORDER")}: {order.order_id}
          </h1>
          <p className="text-sm text-muted-foreground tracking-tight">{t("DESCRIPTION")}</p>
        </div>
        <div className="flex gap-2">
            {order?.supplier_id && order.status === "RECEIVED" && (
                <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                <SheetTrigger asChild>
                    <Button variant={"ghost"} className="w-fit">
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
                    <OrdenDetails presentations={tableData} order={order} mode="VIEW" />
                </SheetContent>
                </Sheet>
            )}
            <Button className="w-fit" onClick={handlePrintData}>
                <Save></Save>
                {t("UPDATE")}
            </Button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="px-2">
          {order && suppliers && suppliers?.length > 0 && (
            <OrderForm
              modeForm="EDIT"
              onSave={handleFormChange}
              order={order}
              suppliers={suppliers}
            />
          )}
        </div>

        <div className="px-2 py-6">
          {order && (
            <PresentationOrdesTable
              supplier={order.supplier_id}
              presentationsOrder={tableData}
              onUpdate={handleTableChange}
              mode="EDIT"
            />
          )}
        </div>
      </div>
    </div>
  );
}
