import { createOrder, createOrderDetails } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { fullPresentItems, Order, OrderFromValues } from "@/types/order";
import { Save, X } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

interface OrdenDetailProps{
    presentations ?: fullPresentItems[] | null;
    order ?: OrderFromValues | null;
    onCancel?: () => void;
    onConfirm?: () => void;
}

export function OrdenDetails ({presentations, order,  onCancel, onConfirm }: OrdenDetailProps) {

    const { suppliers=[] } = useSuppliersSWR();
    const [description, setDescription] = useState('');

    const handleCancel = () => {
        if(onCancel) onCancel();
    }

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    const handleConfirm = async () => {
        if (!order || !presentations) return;

        try {
            const newOrder: Omit<Order, "order_id"> = {
                expiration_date: order.expiration_date,
                received_date: order.received_date,
                status: order.status,
                supplier_id: order.supplier_id,
                description: description
            }

            const {success, data} = await createOrder(newOrder);

            if(success && data){
                const newOrdersDetails = presentations.map( prese => { 
                    return {
                        order_id: data.order_id,
                        presentation_id: prese.presentation_id,
                        quantity_ordered:  prese.quantity_orderned,
                        quantity_received: prese.quantity_received,
                        unit_price: prese.unit_price                    
                    }
                });

                const newBatchs = presentations.map(( pre )=> {
                    return{
                        quantity_batch: pre.quantity_received,
                        current_quantity: pre.quantity_received,
                        received_date: new Date(),
                        expiration_date: pre.expiration_date ? pre.expiration_date : new Date(),
                        presentation_id: pre.presentation_id,
                        order_detail_id: 0
                    }
                }); 

                const responseD = await createOrderDetails(newOrdersDetails,newBatchs);

                if(responseD && responseD.success){
                    toast.success('Se creo');
                }
            }          
            if(onConfirm) onConfirm();
        } catch (err) {
            console.error("Error al guardar la orden:", err);
        }
    }

    return(
        <Card>
            <CardHeader>
                <CardTitle className="text-foreground text-lg">{suppliers.find(s => Number(s.supplier_id) == order?.supplier_id)?.company_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2 text-muted-foreground">
                    <div className="flex space-x-2">
                        <h3 className="text-sm font-semibold">Fecha de Recepcion: </h3>
                        <p className="text-sm">{order?.received_date.toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                        <h3 className="text-sm font-semibold">Fecha de Expiracion: </h3>
                        <p className="text-sm">{order?.expiration_date.toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm">
                            Comentario
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={handleInputChange}
                            placeholder="Algun comentario de la recepcion de la orden?"
                            className={`text-sm resize-none`}
                            rows={2}
                    />
                    </div>
                </div>
                <div className="flex flex-col space-y-2">
                    <h3 className="text-sm text-muted-foreground font-semibold tracking-tight">Productos Recibidos</h3>
                    {
                        presentations?.map((pres)=>(
                            <div key={pres.presentation_id} className="flex w-full gap-4 bg-background p-2 rounded border border-primary/50">
                                <div className="flex justify-center items-center p-1 px-2">
                                    <p className="text-lg font-bold text-foreground">{pres.quantity_received} {pres.presentation_unit}</p>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-semibold tracking-tight text-accent-foreground">{pres.item_name}</h3>
                                    <p className="text-xs font-medium text-primary">{pres.presentation_name}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
                {/* Actions */}
                {presentations && presentations?.length > 0 && 
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button type="submit" className="flex-1 text-sm" onClick={handleConfirm}>
                            <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Recibir Orden
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 sm:flex-none text-sm bg-transparent"
                            onClick={handleCancel}
                            >
                            <X className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Cancelar
                        </Button>
                    </div>                
                }

            </CardContent>
        </Card>
    );
}