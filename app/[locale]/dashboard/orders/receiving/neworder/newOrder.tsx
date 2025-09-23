"use client";

import { fullPresentItems, OrderFromValues } from "@/types/order";
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

export default function NewOrder(){
  
    const t = useTranslations("NEW-ORDER");
    const [supplier, setSupplier] = useState<number | null>();
    const [order, setOrder] = useState<OrderFromValues | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<fullPresentItems[]>([]);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { suppliers, isLoading: loadingSuppliers } = useSuppliersSWR();

    
    const handleOrder = useCallback((data: OrderFromValues) => {
        if(data.supplier_id){
        setSupplier(data.supplier_id);
        setOrder( prev => {
            if (!prev) return data;
            const same =
            prev.supplier_id === data.supplier_id; // solo si estos cambian mando a los details
            return same ? prev : data;
        });
        }
    },[]);

    const handleUpdate = useCallback((allProducts: fullPresentItems[]) => {
        // Aquí filtramos los productos seleccionados directamente
        setSelectedProducts([]);
        const selected = allProducts.filter(p => p.selected);
        setSelectedProducts(selected);
    }, []);

    return(
        <div className="max-h-screen overflow-y-auto space-y-4">
            <div className="flex lg:flex-col px-2 md:pb-6 items-center lg:items-start justify-between gap-4">
              <div className="flex flex-col items-start">
                <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                <p className="text-sm text-muted-foreground tracking-tight">{t("DESCRIPTION")}</p>
              </div>
              <div className="lg:hidden">  
                  {
                    order?.supplier_id && 
                    <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <SheetTrigger asChild>
                          <Button className="w-fit bg-primary/60 border-primary  hover:bg-primary/50">
                            <BookOpenCheck className="h-4 w-4" />
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
                            onCancel={() => {
                              setOrder(null);
                              setSelectedProducts([]);
                              setSupplier(null);
                              router.back();
                            }}
                            onConfirm={() => {
                              setOrder(null);
                              setSelectedProducts([]);
                              setSupplier(null);
                              router.back();
                            }}
                          ></OrdenDetails>   
                        </SheetContent>
                    </Sheet>                    
                  }
              </div>
            </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-6 lg:grid-rows-auto gap-4">
              <div className="lg:col-span-4 px-2">
                {
                  suppliers && suppliers?.length > 0 && 
                    <OrderForm 
                        modeForm="RECEIVED"
                        onSave={handleOrder} 
                        suppliers={suppliers}>
                    </OrderForm>
                }
              </div>
              <div className="hidden lg:block lg:col-span-2 lg:row-span-2 lg:col-start-5">
                {
                  order?.supplier_id &&
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <h3 className="font-medium text-sm sm:text-base">{t("DETAILS-ORDER")}</h3>
                    </div>  
                    <OrdenDetails
                      presentations={selectedProducts}
                      order={order}
                      onCancel={() => {
                        setOrder(null);
                        setSelectedProducts([]);
                        setSupplier(null);
                        router.back();
                      }}
                      onConfirm={() => {
                        setOrder(null);
                        setSelectedProducts([]);
                        setSupplier(null);
                        router.back();
                      }}
                    ></OrdenDetails>                        
                  </div>
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