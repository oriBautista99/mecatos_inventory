"use client"

import { suggestedOrders } from "@/actions/generate-suggested-orders";
import { getOrders } from "@/actions/orders";
import OrdersTable from "@/components/dashboard/orders/orders-table";
import { StatusBadge } from "@/components/dashboard/orders/StatusBadgeOrder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SelectItem, Select, SelectContent, SelectTrigger, SelectValue  } from "@/components/ui/select";
import { useSuppliersSWR } from "@/hooks/useSuppliers"
import { useProfileLoginSWR } from "@/hooks/useUserLogin";
import { ORDER_STATUS } from "@/types/constants";
import { Order } from "@/types/order";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrdersPage() {

  const { suppliers=[] } = useSuppliersSWR();
  const {profile} = useProfileLoginSWR();   

  const [selectedSupplier, setSelectedSupplier] = useState<string | null>('all');
  const [status, setStatus] = useState<string | null>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const t = useTranslations("SUPPLIER-ORDERS");

  async function loadOrders() {
    const { data, error } = await getOrders();
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

  const filterOrders = orders?.filter(
    (order) => {
      const matchesSearchTerm = String(order.order_id).includes(searchTerm.toLowerCase()) ||
        order.suppliers?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.created_at?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.expiration_date?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSupplier = selectedSupplier === "all" || 
        order.suppliers?.supplier_id.toString() === selectedSupplier;
      const matchesStatus = status === "all" || 
        order.status === status;
      return matchesSearchTerm && matchesSupplier && matchesStatus;
    }
  )

  const handleGenerateOrders = async () => {
    if(profile){ 
        const response = await suggestedOrders(profile.profile_id);
        if(response.data){
          toast.success("Ordenes por proveedor creadas correctamente");
          loadOrders();
        }  
    }
  }
  
  return (
    <div className="overflow-y-hidden space-y-4 mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
        <div className="flex flex-col justify-start w-full">
          <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
          <p className="text-sm text-muted-foreground tracking-tight">
            {t("DESCRIPTION")}
          </p>
        </div>
        <Button onClick={handleGenerateOrders} className="w-full md:w-fit">{t("SUGGEST-ORDER")}</Button>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <span className="text-muted-foreground">{t("LOADING")}</span>
          <Progress value={progress} className="w-2/3 h-3" />
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row lg:flex-wrap gap-4">
            <div className="group relative w-full md:max-w-xs">
              <label htmlFor="supplier" className="text-foreground text-sm font-medium">
                {t("ORDER")}
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("SEARCH")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full text-sm"
                />
              </div>
            </div>

            <div className="group relative w-full md:max-w-xs">
              <label htmlFor="supplier" className="text-foreground text-sm font-medium">
                {t("SUPPLIER")}
              </label>
              <Select value={selectedSupplier ?? undefined} onValueChange={setSelectedSupplier}>
                <SelectTrigger id="supplier" className="dark:!bg-background w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">{t("ALL")}</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.supplier_id} value={supplier.supplier_id.toString()}>
                      {supplier.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="group relative w-full md:max-w-xs lg:flex-1">
              <label htmlFor="status" className="text-foreground text-sm font-medium">
                {t("ORDER_STATUS")}
              </label>
              <Select value={status ?? undefined} onValueChange={setStatus}>
                <SelectTrigger id="status" className="w-full md:w-fit min-w-32">
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">{t("ALL")}</SelectItem>
                  {Object.values(ORDER_STATUS).map((statusValue) => (
                    <SelectItem key={statusValue} value={statusValue}>
                      <StatusBadge status={statusValue}></StatusBadge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            {filterOrders && 
              <div>
                <div className="overflow-x-auto">
                  <OrdersTable mode="all" data={filterOrders} />
                </div>
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}