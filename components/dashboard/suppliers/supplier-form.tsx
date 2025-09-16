
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Supplier, SupplierFormValues, supplierSchema } from "@/types/suppliers";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Calendar, Mail, Phone, Save, User, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface SupplierModalProps {
  onClose: () => void
  onSave: (supplier: SupplierFormValues) => void
  supplier?: Supplier | null
}

const daysOfWeek = [
  { id: "lunes", label: "MONDAY" },
  { id: "martes", label: "TUESDAY" },
  { id: "miércoles", label: "WEDNESDAY" },
  { id: "jueves", label: "THURSDAY" },
  { id: "viernes", label: "FRIDAY" },
  { id: "sábado", label: "SATURDAY" },
  { id: "domingo", label: "SUNDAY" },
];

export function SupplierForm({ onClose, onSave, supplier }: SupplierModalProps){

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      address: "",
      phone: "",
      email: "",
      frecuency: [],
      is_active: true,
    },
  });

  const orderFrequency = watch("frecuency");
  const t = useTranslations("SUPPLIER-FORM"); 
  
  useEffect(() => {
        if (supplier) {
            reset({
              company_name: supplier.company_name,
              contact_name: supplier.contact_name,
              address: supplier.address,
              phone: supplier.phone,
              email: supplier.email,
              frecuency: supplier.frecuency,
              is_active: supplier.is_active,
            });
        }
  }, [supplier, reset]);


  // const handleFrequencyChange = (dayId: string, checked: boolean) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     orderFrequency: checked ? [...prev.orderFrequency, dayId] : prev.orderFrequency.filter((day) => day !== dayId),
  //   }))
  // }

  return (
    <div>
        <div className="p-4">
          <SheetHeader className="space-y-2 sm:space-y-3 mb-3">
            <SheetTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
              {supplier ? t("EDIT-SUPPLIER") : t("CREATE-SUPPLIER")}
            </SheetTitle>
            <SheetDescription className="text-sm">
              {supplier
                ? t("EDIT-DESCRIPTION")
                : t("CREATE-DESCRIPTION")}
            </SheetDescription>
          </SheetHeader>          
        </div>
        <Separator />
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Company Information */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm sm:text-base">{t("COMPANY-INFO")}</h3>
            </div>
          

            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-sm">
                {t("COMPANY-NAME")} *
              </Label>
              <Input
                id="company_name"
                 {...register("company_name")}
                placeholder="Ej: Distribuidora Central S.A."
                className={`text-sm ${errors.company_name ? "border-destructive" : ""}`}
              />
              {errors.company_name && <p className="text-xs text-destructive">{errors.company_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm">
                {t("ADDRESS")} *
              </Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder={t("ADDRESS-PLACEHOLDER")}
                className={`text-sm resize-none ${errors.address ? "border-destructive" : ""}`}
                rows={2}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm sm:text-base">{t("CONTACT-INFO")}</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name" className="text-sm">
                {t("CONTACT-NAME")} *
              </Label>
              <Input 
                id="contact_name"
                {...register("contact_name")}
                placeholder={t("CONTACT-PLACEHOLDER")}
                className={`text-sm ${errors.contact_name ? "border-destructive" : ""}`}
              />
              {errors.contact_name && <p className="text-xs text-destructive">{errors.contact_name.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">
                  {t("PHONE")} *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+1234567890"
                    className={`pl-9 sm:pl-10 text-sm ${errors.phone ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  {t("EMAIL")} *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    {...register("email")} 
                    placeholder="contact@company.com"
                    className={`pl-9 sm:pl-10 text-sm ${errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Frequency */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm sm:text-base">{t("ORDER-FRECUENCY")}</h3>
            </div>

            <div className="space-y-3">
              <Label className="text-sm">{t("DAYS-FRECUENCY")} *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {daysOfWeek.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={orderFrequency.includes(day.id)}
                      onCheckedChange={(checked) => {
                        const newDays = checked
                          ? [...orderFrequency, day.id]
                          : orderFrequency.filter((d) => d !== day.id);
                        setValue("frecuency", newDays, { shouldValidate: true });
                      }}
                    />
                    <Label htmlFor={day.id} className="text-xs sm:text-sm font-normal">
                      {t(day.label)}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.frecuency && <p className="text-xs text-destructive">{errors.frecuency.message}</p>}

              {orderFrequency.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {orderFrequency.map((dayId) => {
                    const day = daysOfWeek.find((d) => d.id === dayId);
                    return <Badge key={dayId}>{day && t(day?.label)}</Badge>;
                  })}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
            <Button type="submit" className="flex-1 text-sm">
              <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {supplier ? t("UPDATE-SUPPLIER") : t("SAVE-SUPPLIER")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none text-sm bg-transparent"
            >
              <X className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {t("CANCEL")} 
            </Button>
          </div>
        </form>      
    </div>


  );

}