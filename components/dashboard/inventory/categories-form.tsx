import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Category, CategoryFormValues, CategorySchema } from "@/types/category"
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Shapes, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface CategoryModalProps {
  onClose: () => void
  onSave: (category: CategoryFormValues) => void
  category?: Category | null
}

export function CategoriesForm({ onClose, onSave, category }: CategoryModalProps){
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        } = useForm<CategoryFormValues>({
        resolver: zodResolver(CategorySchema),
        defaultValues: {
            name: "",
            description: ""
        },
    });

    const t = useTranslations("CATEGORIES-FORM"); 
    
    useEffect(() => {
        if (category) {
            reset({
                name: category.name,
                description: category.description
            });
        }
    }, [category, reset]);
    
        return (
        <div>
            <SheetHeader className="space-y-2 sm:space-y-3 mb-3">
                <SheetTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Shapes className="h-4 w-4 sm:h-5 sm:w-5" />
                    {category ? t("EDIT-CATEGORY") : t("CREATE-CATEGORY")}
                </SheetTitle>
                <SheetDescription className="text-sm">
                {category
                    ? t("EDIT-DESCRIPTION")
                    : t("CREATE-DESCRIPTION")}
                </SheetDescription>
            </SheetHeader>      
            <Separator />
            <form onSubmit={handleSubmit(onSave)} className="space-y-4 sm:space-y-6 mt-4">
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
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button type="submit" className="flex-1 text-sm">
                        <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        {category ? t("UPDATE-CATEGORY") : t("SAVE-CATEGORY")}
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