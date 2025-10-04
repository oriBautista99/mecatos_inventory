"use client"

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LOSS_TYPES } from "@/types/loss";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";


const formSchema = z.object({
  loss_date: z.date(),
  reason: z.string().min(1, "Selecciona una razon"),
  notes: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

type Props = {
  onSubmit: (data:FormValues) => void;
  initialData?: Partial<FormValues> | null;
};

export default function LossForm({ onSubmit, initialData }: Props){

    const t = useTranslations("LOSS-FORM");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            loss_date: new Date(),
            reason: undefined,
            notes: "",
        },
    });
    
    function handleSubmit(values: FormValues) {
        onSubmit(values);
    }

    useEffect(() => {
        if (initialData) {
            form.reset({
                loss_date: initialData.loss_date ? new Date(initialData.loss_date) : new Date(),
                reason: initialData.reason ?? undefined,
                notes: initialData.notes ?? "",
            });
            form.clearErrors('reason');
        }
    }, [initialData, form]);
    
    useEffect(() => {
        const subscription = form.watch(() => {
            form.handleSubmit(handleSubmit)();
        });
        return () => subscription.unsubscribe();
    }, [form]);

    return(
        <Form {...form}>
            <form className="space-y-2">

                <div className='flex flex-col md:flex-row gap-2 items-center justify-end w-full'>
                    <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                            <FormItem className="w-full md:w-1/2">
                                <FormLabel>{t("REASON")}</FormLabel>
                                <FormControl>
                                    <Select
                                        key={field.value ?? 'empty'}             
                                        value={field.value ?? undefined}        
                                        onValueChange={(v) => {
                                            field.onChange(v);
                                            form.trigger('reason');
                                        }}
                                    >
                                        <SelectTrigger className="focus:ring-0 focus:ring-offset-0">
                                            <SelectValue placeholder={t("SELECT")}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LOSS_TYPES.map(type => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />                    
                    {/* Fecha */}
                    <FormField
                        control={form.control}
                        name="loss_date"
                        render={({ field }) => (
                            <FormItem className='w-full md:w-1/2 flex flex-col gap-3'>
                                <FormLabel>{t("DATE")}</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className="w-full justify-between text-left font-normal"
                                    >
                                        {field.value ? format(field.value, "PPP") : t("SELECT")}
                                        <ChevronDownIcon  className="h-4 w-4" />
                                    </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {/* Notas */}
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("NOTE")}</FormLabel>
                        <FormControl>
                            <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}