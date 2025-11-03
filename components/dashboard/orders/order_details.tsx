import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { fullPresentItems, Order, OrderFromValues } from "@/types/order";
import { Save, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface OrdenDetailProps{
    presentations ?: fullPresentItems[] | null;
    order ?: OrderFromValues | null | Order;
    mode : 'RECEIVED' | "VIEW";
    onCancel?: () => void;
    onConfirm?: (result: { 
        mode: 'RECEIVED' | 'VIEW', 
        order: OrderFromValues | Order, 
        presentations: fullPresentItems[] 
    }) => void;
}

export function OrdenDetails ({presentations, order, mode, onCancel, onConfirm }: OrdenDetailProps) {

    const { suppliers=[] } = useSuppliersSWR();
    const t = useTranslations("ORDER-DETAILS");

    const handleCancel = () => {
        if (onCancel) onCancel();
    };

    const handleConfirm = () => {
        if (!order || !presentations) return;

        // devolvemos todo al padre
        if (onConfirm) {
            onConfirm({
                order,
                presentations,
                mode,
            });
        }
    };

    return(
        <Card className="p-4">
            <h1 className="text-card-foreground text-lg font-semibold tracking-tight">{suppliers.find(s => Number(s.supplier_id) == order?.supplier_id)?.company_name}</h1>
            <Separator className="my-2"/>
            <CardContent className="space-y-2">
                <div className="flex flex-col space-y-2 text-card-foreground">
                    <div className="flex space-x-2">
                        <h3 className="text-sm font-semibold">{t("RECEIVED_DATE")}</h3>
                        <p className="text-sm">{ order?.order_id && order.received_date ? new Date(order.received_date).toLocaleDateString() : order?.received_date && order?.received_date.toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                        <h3 className="text-sm font-semibold">{t("EXPIRATION_DATE")}</h3>
                        <p className="text-sm">{ order?.order_id && order.expiration_date ? new Date(order.expiration_date).toLocaleDateString() : order?.expiration_date && order?.expiration_date.toLocaleDateString()}</p>
                    </div>
                </div>                    
                {
                    presentations && presentations?.length > 0 &&
                    <div className="flex flex-col space-y-2">
                        <h3 className="text-sm text-card-foreground font-semibold tracking-tight">{t("PRODUCTS_RECEIVED")}</h3>
                        {
                            presentations?.map((pres)=>(
                                <div key={pres.presentation_id} className="flex w-full gap-4 bg-background p-2 rounded border border-primary/50">
                                    <div className="flex justify-center items-center p-1 px-2 min-w-fit">
                                        <p className="text-lg font-bold text-foreground">{pres.quantity_received}</p>
                                    </div>
                                    <div className="flex flex-col w-auto">
                                        <h3 className="text-sm font-semibold tracking-tight text-card-foreground">{pres.item_name}</h3>
                                        <p className="text-xs font-medium text-primary">{pres.presentation_name}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>                    
                }
            
                {/* Actions */}
                {mode==='RECEIVED' && presentations && presentations?.length > 0 && 
                    <div className="flex flex-col md:flex-row lg:flex-col lx:flex-row gap-2 lg:gap-3">
                        <Button type="submit" className="flex-1 text-sm" onClick={handleConfirm}>
                            <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            {t("RECEIVE_ORDER")}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 sm:flex-none text-sm bg-transparent"
                            onClick={handleCancel}
                            >
                            <X className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            {t("CANCEL")}
                        </Button>
                    </div>                
                }
            </CardContent>
        </Card>
    );
}