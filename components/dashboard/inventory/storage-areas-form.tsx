import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { AreaStorageFormValues, storagAreaSchema, Storage_area } from "@/types/storage_area"
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { Package, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface AreaModalProps {
  onClose: () => void
  onSave: (area: AreaStorageFormValues) => void
  area?: Storage_area | null
}

export function StorageAreasForm({ onClose, onSave, area }: AreaModalProps){

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
      } = useForm<AreaStorageFormValues>({
        resolver: zodResolver(storagAreaSchema),
        defaultValues: {
          name: "",
          description: "",
          is_active: true,
        },
    });

    const t = useTranslations("STORAGE-AREAS-FORM"); 

    useEffect(() => {
        if (area) {
            reset({
              name: area.name,
              description: area.description,
              is_active: area.is_active,
            });
        }
    }, [area, reset]);

    return (
        <div>
            <div className="p-4">
                <SheetHeader className="space-y-2 sm:space-y-3 mb-3">
                    <SheetTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    {area ? t("EDIT-AREA") : t("CREATE-AREA")}
                    </SheetTitle>
                    <SheetDescription className="text-sm">
                    {area
                        ? t("EDIT-DESCRIPTION")
                        : t("CREATE-DESCRIPTION")}
                    </SheetDescription>
                </SheetHeader>          
            </div>
            <Separator />
            <form onSubmit={handleSubmit(onSave)} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">
                        {t("NAME")} *
                    </Label>
                    <Input
                        id="name"
                        {...register("name")}
                        placeholder={t("NAME-PLACEHOLDER")}
                        className={`text-sm ${errors.name ? "border-destructive" : ""}`}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm">
                        {t("DESCRIPTION")} *
                    </Label>
                    <Textarea
                        id="description"
                        {...register("description")}
                        placeholder={t("DESCRIPTION-PLACEHOLDER")}
                        className={`text-sm resize-none ${errors.description ? "border-destructive" : ""}`}
                        rows={2}
                    />
                    {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>
                <Separator />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                    <Button type="submit" className="flex-1 text-sm">
                        <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        {area ? t("UPDATE-AREA") : t("SAVE-AREA")}
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