import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectValue, Select, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useCategoriesSWR } from "@/hooks/useCategoriesSWR";
import { useItemTypesSWR } from "@/hooks/useItemTypesSWR";
import { useStorageAreasSWR } from "@/hooks/useStorageAreas";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { filters_Items } from "@/types/item";
import { Funnel, FunnelX, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FiltersProps {
  onApplyFilters: (filters: filters_Items) => void
  initialFilters: filters_Items
}

export function FiltersInventory({onApplyFilters, initialFilters}: FiltersProps) {

    const { categories = [], error: errorCategories } = useCategoriesSWR();
    const { suppliers = [], error: errorSuppliers } = useSuppliersSWR();
    const { itemTypes = [], error: errorTypes } = useItemTypesSWR();
    const { areas = [], error: errorAreas } = useStorageAreasSWR();
    const t = useTranslations("FILTERS-INVENTORY");
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        setFilters(initialFilters) // cuando cambian los filtros iniciales desde el padre
    }, [initialFilters])

    if (errorCategories) {
        toast.error("Error cargando categorías");
    }

    if (errorSuppliers) {
        toast.error("Error cargando proveedores");
    }

    if (errorTypes) {
        toast.error("Error cargando tipos");
    }

    if (errorAreas) {
        toast.error("Error cargando areas");
    }

    const handleResetFilters = () => {
        const reset = {
            category_id: "",
            item_type_id: "",
            storage_area_id: "",
            supplier: "",
        };
        setFilters(reset);
        onApplyFilters(reset); // opcional: aplica inmediatamente el reset
    };

    return(
        <div className="flex flex-col space-y-4 md:space-y-6 lg:space-y-4">
            <div className="grid grid-cols-1 sm:space-x-0 gap-4 lg:gap-2 content-center">
                <div className='w-full sm:mt-2 space-y-1'>
                    <Label htmlFor="category_id" className="text-muted-foreground text-xs sm:text-base lg:text-sm">
                        {t("CATEGORIES")}
                    </Label>
                    <Select 
                        value={filters.category_id}
                        onValueChange={(value) => setFilters((prev) => ({...prev, category_id : value}))}
                        
                    >
                        <SelectTrigger id="category_id" className='relative w-full ps-9 text-sm py-2 h-8'>
                            <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                <Tag size={12} aria-hidden='true' />
                            </div>
                            <SelectValue className="text-sm sm:text-base lg:text-sm tracking-tight" placeholder={t("CATEGORIES-PLACEHOLDER")} />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                categories.map((category) => (
                                    <SelectItem 
                                        className="text-sm sm:text-base lg:text-sm"
                                        key={category.category_id} 
                                        value={category.category_id}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </div>
                <div className='w-full space-y-1'>
                    <Label htmlFor="supplier" className="text-muted-foreground text-xs sm:text-base lg:text-sm">
                        {t("SUPPLIERS")}
                    </Label>
                    <Select 
                        value={filters.supplier}
                        onValueChange={(value) => setFilters((prev) => ({...prev, supplier : value}))}
                        
                    >
                        <SelectTrigger id="supplier" className='relative w-full ps-9 text-sm py-2 h-8'>
                            <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                <Tag size={12} aria-hidden='true' />
                            </div>
                            <SelectValue className="text-sm sm:text-base" placeholder={t("SUPPLIERS-PLACEHOLDER")} />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                suppliers.map((supplier) => (
                                    <SelectItem 
                                        className="text-sm sm:text-base"
                                        key={supplier.supplier_id} 
                                        value={supplier.supplier_id}
                                    >
                                        {supplier.company_name}
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </div>
                <div className='w-full space-y-1'>
                    <Label htmlFor="type_id" className="text-muted-foreground text-xs sm:text-base lg:text-sm">
                        {t("TYPES")}
                    </Label>
                    <Select 
                        value={filters.item_type_id}
                        onValueChange={(value) => setFilters((prev) => ({...prev, item_type_id : value}))}
                        
                    >
                        <SelectTrigger id="type_id" className='relative w-full ps-9 text-sm py-2 h-8'>
                            <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                <Tag size={12} aria-hidden='true' />
                            </div>
                            <SelectValue className="text-sm sm:text-base lg:text-sm" placeholder={t("TYPES-PLACEHOLDER")} />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                itemTypes.map((type) => (
                                    <SelectItem 
                                        className="text-sm sm:text-base lg:text-sm"
                                        key={type.item_type_id} 
                                        value={type.item_type_id}
                                    >
                                        {type.name}
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </div>
                <div className='w-full space-y-1'>
                    <Label htmlFor="storage_area_id" className="text-muted-foreground text-xs sm:text-base lg:text-sm">
                        {t("AREAS")}
                    </Label>
                    <Select 
                        value={filters.storage_area_id}
                        onValueChange={(value) => setFilters((prev) => ({...prev, storage_area_id : value}))}
                        
                    >
                        <SelectTrigger id="storage_area_id" className='relative w-full ps-9 text-sm py-2 h-8'>
                            <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                <Tag size={12} aria-hidden='true' />
                            </div>
                            <SelectValue className="text-sm sm:text-base" placeholder={t("AREAS-PLACEHOLDER")} />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                areas.map((area) => (
                                    <SelectItem 
                                        className="text-sm sm:text-base"
                                        key={area.storage_area_id} 
                                        value={area.storage_area_id}
                                    >
                                        {area.name}
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    onClick={() => onApplyFilters(filters)}
                    size='sm'
                    className="flex-1 text-sm"
                >
                    <Funnel className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {t("FILTER")}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size='sm'
                    className="flex-1 sm:flex-none text-sm bg-transparent"
                    onClick={handleResetFilters}
                >
                    <FunnelX className="h-3 w-3 sm:h-4 sm:w-4" />
                    {t("RESET")} 
                </Button>
            </div>
        </div>
    );
}