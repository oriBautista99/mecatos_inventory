"use client";

import { fullPresentItems, Order, OrderFromValues } from "@/types/order";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BookOpenCheck, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrdenDetails } from "@/components/dashboard/orders/order_details";
import OrderForm from "@/components/dashboard/orders/order-form";
import PresentationOrdesTable from "@/components/dashboard/orders/present_order_table";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { toast } from "sonner";
import { rpcReceiveNewOrder } from "@/actions/orders";
import { useProfileLoginSWR } from "@/hooks/useUserLogin";

export default function NewOrder(){
  
    const t = useTranslations("NEW-ORDER");
    const [supplier, setSupplier] = useState<number | null>();
    const [order, setOrder] = useState<OrderFromValues | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<fullPresentItems[]>([]);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { suppliers } = useSuppliersSWR();
    const userLogin = useProfileLoginSWR();

    
    const handleOrder = useCallback((data: OrderFromValues) => {
        if(data.supplier_id){
          setSupplier(data.supplier_id);
          setOrder(prev => {
            if (!prev) return data;
            const isSame = JSON.stringify(prev) === JSON.stringify(data);
            return isSame ? prev : data;
          });
        }
    },[]);

    const handleUpdate = useCallback((allProducts: fullPresentItems[]) => {
        setSelectedProducts([]);
        const selected = allProducts.filter(p => p.selected);
        setSelectedProducts(selected);
    }, []);

    const handleConfirmDetails = useCallback(
      async ({
          order,
          presentations
      }: {
          order: OrderFromValues | Order;
          presentations: fullPresentItems[];
          mode: string;
      }) => {
        const itemsData = presentations.map(item => {
          return(
              { 
                  item_presentation_id:item.presentation_id, 
                  quantity_ordered:item.quantity_orderned, 
                  quantity_received:(item.quantity_received * item.presentation_quantity), 
                  unit_price:item.unit_price, 
                  expiration_date:item.expiration_date
              }
          )
        });
        try {
            const response = await rpcReceiveNewOrder({
                supplier_id: order.supplier_id,
                createdBy: userLogin.profile?.profile_id,
                received_date: order.received_date,
                description:order.description,
                items: itemsData
            });
            if(response.data){
              toast.success(t("SUCCESSFULY-UPDATE-ORDER"));
              setOrder(null);
              setSelectedProducts([]);
              setSupplier(null);
              router.back();                
            }

        } catch (err) {
            console.error("Error update order:", err);
        }

      }, []
    )

    return(
        <div className="max-h-screen overflow-y-auto space-y-4">
            <div className="flex px-2 md:pb-6 items-center justify-between gap-4">
              <div className="flex flex-col items-start">
                <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                <p className="text-sm text-muted-foreground tracking-tight">{t("DESCRIPTION")}</p>
              </div>
              <div className="">  
                  {
                    order?.supplier_id && 
                    <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <SheetTrigger asChild>
                          <Button className="w-fit bg-primary border-primary  hover:bg-primary/50">
                            <BookOpenCheck className="h-4 w-4" />
                            {t("RECEIVE-ORDER")}
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
                            mode="RECEIVED"
                            presentations={selectedProducts}
                            order={order}
                            onCancel={() => {
                              setOrder(null);
                              setSelectedProducts([]);
                              setSupplier(null);
                              router.back();
                            }}
                            onConfirm={handleConfirmDetails}
                          ></OrdenDetails>   
                        </SheetContent>
                    </Sheet>                    
                  }
              </div>
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="px-2">
                {
                  suppliers && suppliers?.length > 0 && 
                    <OrderForm 
                        modeForm="RECEIVED"
                        onSave={handleOrder} 
                        suppliers={suppliers}>
                    </OrderForm>
                }
              </div>
              <div className="lg:col-span-4 lg:row-start-2 px-2 py-6">
                {
                  supplier && 
                  <PresentationOrdesTable
                    supplier={supplier}
                    onUpdate={handleUpdate}
                  ></PresentationOrdesTable>                  
                }
              </div>              
            </div>
        </div>
    )
}