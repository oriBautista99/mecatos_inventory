"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { withMask } from "use-mask-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// Importa componentes de shadcn
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Profile } from "@/types/user";
import { getUsers } from "@/actions/users";
import { toast } from "sonner";
import { UserCombobox } from "@/components/user-combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TYPE_PRODUCTION } from "@/types/constants";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  user: z.string().min(1, "Selecciona un usuario"),
  date: z.date(),
  time: z.string().min(1, "Selecciona una hora"),
  notes: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

type Props = {
  type: typeof TYPE_PRODUCTION[keyof typeof TYPE_PRODUCTION];
  onSubmit: (data:FormValues) => void;
  initialData?: Partial<FormValues> | null;
};

export default function ProductionSheetForm({ type, onSubmit, initialData }: Props) {

    const [users, setUsers] = useState<Profile[]>([]);
    const t = useTranslations("PROD-SHEET-FORM");

    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12; // convierte 0 en 12
        const formattedHours = hours < 10 ? `0${hours}` : hours;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user: "",
            date: new Date(),
            time: getCurrentTime(),
            notes: "",
        },
    });

    function handleSubmit(values: FormValues) {
        onSubmit(values);
    }

    async function loadUsers() {
        const {data, error} = await getUsers();
        if(data) {
            setUsers(data);
        }else{
            toast.error(error);
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    useEffect(() => {
        if (initialData) {
            form.reset({
                user: String(initialData.user) || "",
                date: initialData.date ? new Date(initialData.date) : new Date(),
                time: initialData.time || getCurrentTime(),
                notes: initialData.notes || "",
            });
        }
    }, [initialData, form]);

    useEffect(() => {
        const subscription = form.watch(() => {
            form.handleSubmit(handleSubmit)();
        });
        return () => subscription.unsubscribe();
    }, [form]);


  return (
    <Form {...form}>
        <form className="space-y-4">
            {/* Combobox de usuarios */}
            <FormField
                control={form.control}
                name="user"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t("USER")}</FormLabel>
                    <FormControl>
                        <UserCombobox
                            value={field.value}
                            onChange={field.onChange}
                            users={users}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <div className='flex gap-4 items-end'>
                {/* Fecha */}
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className='flex flex-col gap-3 w-full'>
                        <FormLabel>{t("DATE")}</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className="w-full justify-between text-left font-normal"
                            >
                                {field.value ? format(field.value, "PPP") : "Selecciona una fecha"}
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
            
                {/* Hora */}
                {
                    type === 'DESSERT' && 
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem className="flex flex-col gap-3 w-full">
                                <FormControl>
                                    <div className="flex items-center w-full border rounded-md bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                    {/* Input con máscara HH:MM */}
                                    <Input
                                        type="text"
                                        placeholder="HH:MM"
                                        value={field.value.split(" ")[0] || ""}
                                        onChange={(e) => {
                                        const ampm = field.value.split(" ")[1] || "AM"
                                        field.onChange(`${e.target.value} ${ampm}`)
                                        }}
                                        ref={withMask("99:99", { placeholder: "_" })} // ⏰ Máscara aquí
                                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                                    />

                                    {/* Selector AM/PM dentro del mismo input */}
                                    <Select
                                        value={field.value.split(" ")[1] || "AM"}
                                        onValueChange={(val) => {
                                        const current = field.value.split(" ")[0] || ""
                                        field.onChange(`${current} ${val}`)
                                        }}
                                    >
                                        <SelectTrigger className="w-20 border-0 rounded-none bg-muted/50 focus:ring-0 focus:ring-offset-0">
                                        <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="AM">AM</SelectItem>
                                        <SelectItem value="PM">PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    </div>
                                </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />                        
                }
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
