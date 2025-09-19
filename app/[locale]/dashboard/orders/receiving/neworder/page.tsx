'use client'

import OrderForm from "@/components/dashboard/orders/order-form";
import { OrdenDetails } from "@/components/dashboard/orders/order_details";
import PresentationOrdesTable from "@/components/dashboard/orders/present_order_table";
import { fullPresentItems, OrderFromValues } from "@/types/order";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function Page() {

  const [supplier, setSupplier] = useState<number | null>();
  const [order, setOrder] = useState<OrderFromValues | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<fullPresentItems[]>([]);
  const router = useRouter();

  const handleOrder = useCallback((data: OrderFromValues) => {
    //console.log(data)
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
    const selected = allProducts.filter(p => p.selected);
    setSelectedProducts(selected);
  }, []);

    return(
        <div className="max-h-screen overflow-y-auto space-y-4">
            <div className="flex flex-col items-start">
                <h1 className="text-2xl font-bold tracking-tight">Recibir Nueva Orden</h1>
                <p className="text-sm text-muted-foreground tracking-tight">A continuacion selecciona los datos necesarios de la nueva orden por recibir</p>
            </div>
            <div className="w-full grid grid-cols-6 grid-rows-auto gap-4">
              <div className="col-span-4">
                <OrderForm onSave={handleOrder}></OrderForm>
              </div>
              <div className="col-span-2 row-span-2 col-start-5">
                {
                  order?.supplier_id &&
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
                }
              </div>
              <div className="col-span-4 row-start-2">
                <PresentationOrdesTable
                  supplier={supplier}
                  onUpdate={handleUpdate}
                ></PresentationOrdesTable>
              </div>              
            </div>
        </div>
    );
}