
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { PopoverContent, PopoverTrigger, Popover } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { ORDER_STATUS } from "@/types/constants";
import { Order, OrderFromValues, OrderSchema } from "@/types/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ChevronDownIcon, NotebookPen, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface OrderProps {
    onSave: (order: OrderFromValues) => void
    order ?: Order | null
}

export default function OrderForm({onSave, order}: OrderProps){
    
    const { suppliers = [] } = useSuppliersSWR();
    const [openRecive, setOpenRecive] = useState(false);
    const [openExp, setOpenExp] = useState(false);
    const creationMode = !order ? true : false;

    const {
        // register, 
        // handleSubmit, 
        control, 
        watch,
        // formState: { errors }, 
        reset
    } = useForm<OrderFromValues>({
        resolver: zodResolver(OrderSchema),
        defaultValues: {
            supplier_id: 0,
            status: "REVISED",
            received_date: new Date(),
            expiration_date: new Date()
        }
    });

    const values = watch();

    useEffect(() => {
        onSave?.(values);
    }, [values, onSave]);

    useEffect(() => {
        if(order){
            reset({
                order_id: order.order_id,
                status: order.status,
                supplier_id: order.supplier_id,
                expiration_date: order.expiration_date,
                created_at: order.created_at,
                created_by: order.created_by
            })
        }
    },[order, reset])

    return(
        <div className="flex- flex-col w-ful space-y-2">
            <div className="flex items-center gap-2">
              <NotebookPen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm sm:text-base">Informacion de la orden</h3>
            </div>
            <form className="flex flex-col md:flex-row gap-4">
                <div className="space-y-2 w-full max-w-xs">
                    <Label htmlFor="supplier_id" className="text-sm">Proveedor *</Label>
                    <Controller
                        control={control}
                        name="supplier_id"
                        render={({field}) => (
                            <Select
                                value={field.value ? String(field.value) : ""}
                                onValueChange={(val) => {
                                    field.onChange(Number(val));
                                }}
                                
                            >
                                <SelectTrigger id="supplier_id" className='relative w-full ps-9 text-sm py-2'>
                                    <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                        <Truck size={12} aria-hidden='true' />
                                    </div>
                                    <SelectValue className="text-sm sm:text-base lg:text-sm tracking-tight" placeholder="Proveedor"></SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        suppliers.map((supplier) => (
                                            <SelectItem 
                                                className="text-sm sm:text-base lg:text-sm"
                                                key={supplier.supplier_id} 
                                                value={String(supplier.supplier_id)}
                                            >
                                                {supplier.company_name}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                          </Select>
                        )}
                    />
                </div>
                <div className='w-full max-w-xs space-y-2'>
                    <Label htmlFor='received_date' className='px-1'>
                        Fecha de Recepcion
                    </Label>
                    <Controller
                        control={control}
                        name="received_date"
                        render={({field}) => (
                            <Popover open={openRecive} onOpenChange={setOpenRecive}>
                                <PopoverTrigger asChild>
                                <Button variant='outline' id='received_date' disabled={creationMode} className='w-full justify-between font-normal'>
                                    <span className='flex items-center'>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                        {field.value ? field.value.toLocaleDateString() : 'Pick a date'}
                                    </span>
                                    <ChevronDownIcon />
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
                                <Calendar
                                    mode='single'
                                    selected={field.value}
                                    onSelect={date => {
                                        field.onChange(date);
                                        setOpenRecive(false);
                                    }}
                                />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </div>
                <div className="space-y-2 w-full max-w-xs">
                    <label
                        htmlFor="status"
                        className="text-sm"
                    >
                        Estado de la Orden
                    </label>
                    <Controller
                        control={control}
                        name="status"
                        render={({field}) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={creationMode}
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
                        )}
                    />

                </div>
                <div className='w-full max-w-xs space-y-2'>
                    <Label htmlFor='expiration_date' className='px-1'>
                        Fecha de Expiracion
                    </Label>
                    <Controller
                        control={control}
                        name="expiration_date"
                        render={({field}) => (
                            <Popover open={openExp} onOpenChange={setOpenExp}>
                                <PopoverTrigger asChild>
                                <Button variant='outline' id='expiration_date' disabled={creationMode} className='w-full justify-between font-normal'>
                                    <span className='flex items-center'>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                        {field.value ? field.value.toLocaleDateString() : 'Pick a date'}
                                    </span>
                                    <ChevronDownIcon />
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
                                <Calendar
                                    mode='single'
                                    selected={field.value}
                                    onSelect={date => {
                                        field.onChange(date);
                                        setOpenExp(false);
                                    }}
                                />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </div>
            </form>
        </div>
    )
}