"use client";

import { rpcReceiveSuggestedOrder } from "@/actions/orders";
import OrderForm from "@/components/dashboard/orders/order-form";
import { OrdenDetails } from "@/components/dashboard/orders/order_details";
import PresentationOrdesTable from "@/components/dashboard/orders/present_order_table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { useProfileLoginSWR } from "@/hooks/useUserLogin";
import { fullPresentItems, Order, OrderFromValues } from "@/types/order";
import { BookOpenCheck, ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function OrderDetail({ order, presentations }: {order: Order, presentations: fullPresentItems[] }){

    const t = useTranslations("RECEIVING-ORDER");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<fullPresentItems[]>([]);
    const { suppliers, isLoading: loadingSuppliers } = useSuppliersSWR();
    const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(true);
    const [progress, setProgress] = useState(0);
    const [currentOrder, setCurrentOrder] = useState<Order>(order);
    const isFirstLoad = useRef(true);
    const isLoading = isLoadingOrder || loadingSuppliers;
    const userLogin = useProfileLoginSWR();
    const router = useRouter();

    useEffect(() => {
        if(order){
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

    const handleOrder = useCallback((data: OrderFromValues) => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        const newData = {
            ...order,
            received_date: data.received_date,
            description: data.description,
            expiration_date: data.expiration_date,
            status: data.status
        }
        setCurrentOrder(newData);
    },[order]);

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
                        presentation_id:item.presentation_id, 
                        quantity_received:(item.quantity_received * item.presentation_quantity), 
                        unit_price:item.unit_price, 
                        expiration_date:item.expiration_date
                    }
                )
            });
            
            try {
                const response = await rpcReceiveSuggestedOrder({
                    order_id: order.order_id,
                    received_by: userLogin.profile?.profile_id,
                    received_date: order.received_date,
                    description:order.description,
                    items: itemsData
                });
                if(response.data){
                    toast.success(t("SUCCESSFULY-UPDATE-ORDER"));
                    setSelectedProducts([]);            
                    router.back();                
                }
            } catch (err) {
                console.error("Error update order:", err);
            }
            
        },
        []
    );
    
    if(isLoading){
        return (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
                <span className="text-muted-foreground">
                    Cargando data de la orden...
                </span>
                <Progress value={progress} className="w-2/3 h-3"/>
            </div>
        );
    }

    return(
        <div className="max-h-screen overflow-y-auto space-y-4">
            <div className="flex px-2 md:pb-6 items-center justify-between gap-4">
                <div className="flex flex-col items-start">
                    <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")} {order.order_id}</h1>
                    <p className="text-sm text-muted-foreground tracking-tight">{t("DESCRIPTION")}</p>
                </div>
                <div className="">  
                   {
                        order?.supplier_id && 
                        <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <SheetTrigger asChild>
                            <Button className="w-fit bg-primary/60 border-primary  hover:bg-primary/50">
                                <BookOpenCheck className="h-4 w-4" />
                                Recibir Orden
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
                                order={currentOrder}
                                mode="RECEIVED"
                                onCancel={() => setIsModalOpen(false)}
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
                        order && suppliers && suppliers?.length > 0 && 
                        <OrderForm 
                            suppliers={suppliers}
                            onSave={handleOrder} 
                            order={currentOrder} 
                            modeForm="RECEIVED">
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
                            mode="RECEIVED"
                        ></PresentationOrdesTable>                  
                    }
                </div>             
            </div>
        </div>
    );
}