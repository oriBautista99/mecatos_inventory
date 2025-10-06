"use client"
import { getOrdersForStatus } from "@/actions/orders";
import OrdersTable from "@/components/dashboard/orders/orders-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SelectItem, Select, SelectContent, SelectTrigger, SelectValue  } from "@/components/ui/select";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { Order } from "@/types/order";
import { Search, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrdersReceiving() {
  const { suppliers=[] } = useSuppliersSWR();
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname(); 
  const [orders, setOrders] = useState<Order[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const t = useTranslations("RECEIVING-ORDERS");


  async function loadOrders() {
    const { data, error } = await getOrdersForStatus(["SUGGESTED","REVISED","ACCEPTED"]);
    if(data) {
      setOrders(data);
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
      toast.error(error);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders?.filter(
    (order) => {
      const matchesSearchTerm = String(order.order_id)?.includes(searchTerm.toLowerCase()) ||
      order.suppliers?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.created_at?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.expiration_date?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSupplier = selectedSupplier === "all" || 
      order.suppliers?.supplier_id.toString() === selectedSupplier; 
      return matchesSearchTerm && matchesSupplier;
    });


  return (
    <div className="overflow-y-hidden space-y-4 mx-auto px-2 sm:px-4">
      <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
        <div className="flex flex-col justify-start w-full">
          <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
          <p className="text-sm text-muted-foreground tracking-tight">{t("DESCRIPTION")}</p>
        </div>
        <Link className="w-full md:w-fit" href={`${pathname}/neworder`}>
          <Button className="w-full md:w-fit">
            {t("RECEIVE-NEW-ORDER")}
          </Button>        
        </Link>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <span className="text-muted-foreground">
              {t("LOADING")}
          </span>
          <Progress value={progress} className="w-2/3 h-3"/>
        </div>
      ):(
        <div className="flex flex-col space-y-4">
            <div className="flex flex-col gap-4 justify-start md:flex-row md:space-y-0 md:justify-between lg:space-x-4 2xl:justify-start">
                <div className="group relative w-full md:max-w-xs">
                  {/* <label
                      htmlFor="supplier"
                      className='text-foreground text-sm font-medium'
                  >
                      Numero de Orden
                  </label> */}
                  <div className="relative flex-1 w-full">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                      placeholder={t("SEARCH")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                      />
                  </div>
                </div>
                <div className='group relative  w-full md:max-w-xs'>
                  <Select
                      value={selectedSupplier ?? undefined}
                      onValueChange={setSelectedSupplier}
                  >
                      <SelectTrigger id="supplier" className='relative dark:!bg-background w-full ps-9'>
                      <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                          <Truck size={16} aria-hidden='true' />
                      </div>
                      <SelectValue placeholder='Selecciona un proveedor' />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem key="all" value="all">{t("ALL")}</SelectItem>
                      {suppliers.map((supplier) => 
                          <SelectItem 
                          key={supplier.supplier_id} 
                          value={supplier.supplier_id.toString()}
                          >
                          {supplier.company_name}
                          </SelectItem>
                      )}
                      </SelectContent>
                  </Select>
                </div>
            </div>
            
            {filteredOrders &&
                <OrdersTable
                mode="RECEIVED"
                data={filteredOrders}
                ></OrdersTable>        
            }
        </div>
      )}
    </div>
  );
}