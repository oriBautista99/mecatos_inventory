"use client"
import OrdersTable from "@/components/dashboard/orders/orders-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectItem, Select, SelectContent, SelectTrigger, SelectValue  } from "@/components/ui/select";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { ORDER_STATUS } from "@/types/constants";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const { suppliers=[] } = useSuppliersSWR();
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname(); 
  const [orders, setOrders] = useState([]);

  return (
    <div className="max-h-screen overflow-y-auto space-y-4">
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-bold tracking-tight">Ordenes Recibidas</h1>
          <p className="text-sm text-muted-foreground tracking-tight">Administra las ordenes registradas en tu sistema y recibe nuevas ordenes.</p>
        </div>
        <Link href={`${pathname}/neworder`}>
          <Button>
            Recibir Nueva Orden
          </Button>        
        </Link>
      </div>
      <Card className="p-3 flex flex-col space-y-2">
        <div className="flex justify-start space-x-2">
          <div className="group relative w-full max-w-xs">
            <label
              htmlFor="supplier"
              className='text-foreground text-xs font-medium'
            >
              Numero de Orden
            </label>
            <div className="relative flex-1 max-w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar orden"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className='group relative w-full max-w-xs'>
            <label
              htmlFor="supplier"
              className='text-foreground text-xs font-medium'
            >
              Proveedor
            </label>
            <Select
              value={selectedSupplier ?? undefined}
              onValueChange={setSelectedSupplier}
            >
              <SelectTrigger id="supplier" className='dark:!bg-background w-full'>
                <SelectValue placeholder='Selecciona un proveedor' />
              </SelectTrigger>
              <SelectContent>
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
          <div className='group relative w-full max-w-xs'>
            <label
              htmlFor="supplier"
              className='text-foreground text-xs font-medium'
            >
              Estado de la Orden
            </label>
            <Select
              value={status ?? undefined}
              onValueChange={setStatus}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona estado" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ORDER_STATUS).map((statusValue) => (
                  <SelectItem key={statusValue} value={statusValue}>
                    {statusValue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <OrdersTable
          data={orders}
        ></OrdersTable>
      </Card>
    </div>
  );
}