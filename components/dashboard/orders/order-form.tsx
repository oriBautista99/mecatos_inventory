"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { PopoverContent, PopoverTrigger, Popover } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUS } from "@/types/constants";
import { Order, OrderFromValues, OrderSchema } from "@/types/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ChevronDownIcon, NotebookPen, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StatusBadge } from "./StatusBadgeOrder";
import { Supplier } from "@/types/suppliers";
import { Textarea } from "@/components/ui/textarea";

interface OrderProps {
    onSave: (order: OrderFromValues) => void
    order ?: Order | null
    suppliers : Supplier[]
    modeForm: 'RECEIVED' | 'EDIT'
}

export default function OrderForm({onSave, order, suppliers, modeForm}: OrderProps){
    
    const [openRecive, setOpenRecive] = useState(false);
    const [openExp, setOpenExp] = useState(false);
    const creationMode = !order ? true : false;
    const t = useTranslations("ORDER-FORM");
    const [isLoading, setIsLoading] = useState<boolean>(true);


    const {
        control, 
        register,
        watch,
        setValue,
        formState: { isDirty }, 
        reset
    } = useForm<OrderFromValues>({
        resolver: zodResolver(OrderSchema),
        defaultValues: {
            supplier_id: 0,
            status: "RECEIVED",
            received_date: undefined,
            expiration_date: undefined,
            description: ""
        }
    });

    const values = watch();

    useEffect(() => {
        if(isDirty){
            onSave?.(values);
        }        
    }, [values, onSave, isDirty]);

    useEffect(() => {
        if(order && suppliers.length > 0){
            reset({
                order_id: order.order_id,
                status: order.status,
                supplier_id: order.supplier_id,
                expiration_date: order.expiration_date ? new Date(order.expiration_date) : undefined,
                received_date: order.received_date ? new Date(order.received_date) : undefined,
                created_by: order.created_by ? order.created_by : 0,
                description: order.description,
            });
            setIsLoading(false);
        }
        if(suppliers.length > 0 && modeForm === 'RECEIVED'){
            setValue('received_date', new Date());
            setValue('expiration_date', new Date());
            setIsLoading(false);
        }
    },[order, suppliers, reset, modeForm])

    return(
        
        <div className="flex flex-col max-w-full w-full space-y-2">
            <div className="flex items-center gap-2">
              <NotebookPen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <h3 className="font-medium text-lg md:text-base">{t("INFO-ORDER")}</h3>
            </div>
            {
                ! isLoading &&
                <form className="flex flex-col gap-2 md:gap-4">
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                        <div className="space-y-2 w-full md:w-1/2 lg:w-1/4 max-w-xs">
                            <Label htmlFor="supplier_id" className="text-sm">{t("SUPPLIER")} *</Label>
                            <Controller
                                control={control}
                                name="supplier_id"
                                render={({field}) => (
                                    <Select
                                        value={field.value ? String(field.value) : ""}
                                        onValueChange={(val) => {
                                            field.onChange(Number(val));
                                        }}
                                        disabled={!creationMode}
                                    >
                                        <SelectTrigger id="supplier_id" className='relative w-full ps-9 text-sm py-2'>
                                            <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                                <Truck size={12} aria-hidden='true' />
                                            </div>
                                            <SelectValue className="text-sm sm:text-base lg:text-sm tracking-tight" placeholder={t("SUPPLIER")}></SelectValue>
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
                        <div className="space-y-2 w-full md:w-1/2 lg:w-1/4  max-w-xs">
                            <label
                                htmlFor="status"
                                className="text-sm"
                            >
                                {t("STATUS")} *
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
                                            <SelectValue placeholder={t("SELECT-STATUS")} />
                                        </SelectTrigger>
                                        {
                                            modeForm === 'EDIT' && order?.status != 'RECEIVED' ?
                                                <SelectContent>
                                                    {Object.values(ORDER_STATUS).filter((statusValue) => statusValue !== "RECEIVED").map((statusValue) => (
                                                        <SelectItem key={statusValue} value={statusValue}>
                                                            <StatusBadge status={statusValue}></StatusBadge>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            : 
                                                <SelectContent>
                                                    {Object.values(ORDER_STATUS).map((statusValue) => (
                                                        <SelectItem key={statusValue} value={statusValue}>
                                                            <StatusBadge status={statusValue}></StatusBadge>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>                                        
                                        }

                                    </Select>                            
                                )}
                            />

                        </div>                
                        <div className='w-full  md:w-1/2 lg:w-1/4  max-w-xs space-y-2'>
                            <Label htmlFor='received_date' className='px-1'>
                                {t("RECEIVED_DATE")} *
                            </Label>
                            <Controller
                                control={control}
                                name="received_date"
                                render={({field}) => (
                                    <Popover open={openRecive} onOpenChange={setOpenRecive} >
                                        <PopoverTrigger asChild>
                                        <Button variant='outline' id='received_date' disabled={creationMode || modeForm === 'EDIT'} className='w-full justify-between font-normal'>
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
                        <div className='w-full  md:w-1/2 lg:w-1/4  max-w-xs space-y-2'>
                            <Label htmlFor='expiration_date' className='px-1'>
                                {t("EXPIRATION_DATE")} *
                            </Label>
                            <Controller
                                control={control}
                                name="expiration_date"
                                render={({field}) => (
                                    <Popover open={openExp} onOpenChange={setOpenExp}>
                                        <PopoverTrigger asChild>
                                        <Button variant='outline' id='expiration_date' disabled={creationMode || modeForm === 'EDIT'} className='w-full justify-between font-normal'>
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
                    </div>
                    <div className='w-full lg:w-1/3 min-w-[40%] space-y-2'>
                        <Label htmlFor="description" className="text-sm">
                            Observacion *
                        </Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Observacion de la orden"
                            className='text-sm'
                            rows={2}
                        />
                    </div>
                </form>
            }

        </div>
    )
}