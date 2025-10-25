"use client"

import { getInventoryCount, updateInventoryCount } from "@/actions/inventory";
import CountInventoryTable from "@/components/dashboard/inventory/count-inventory-table";
import { FiltersInventory } from "@/components/dashboard/inventory/filters-inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CountDetails, CountTableRow, InventoryCountDetailUpdate } from "@/types/inventory";
import { filters_Items } from "@/types/item";
import { Funnel, Save, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function EditCount({count_id}:{count_id:string}) {
    
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState<CountDetails | null>(null);
    const [details, setDetails] = useState<InventoryCountDetailUpdate[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSheetSearch, setShowSheetSearch] = useState(false);
    const t = useTranslations("EDIT-COUNT");
    const router = useRouter();
    // Filtros
    const [appliedFilters, setAppliedFilters] = useState<filters_Items>({
        category_id: "",
        item_type_id: "",
        storage_area_id: "",
        supplier: "",
    });

    const handleFilters = (filters: filters_Items) => {
        setAppliedFilters(filters);
    };

    /**REVISAR OBJETO Y MIRAR EL FILTRO */
    const applyFilters = useCallback((items:InventoryCountDetailUpdate[], filters: filters_Items) => {
        return items.filter((item) => {
            // category
            if (filters.category_id && item.item.category_id !== Number(filters.category_id)) {
                return false;
            }
            // type
            if (filters.item_type_id && item.item.item_type_id !== Number(filters.item_type_id)) {
                return false;
            }
            // storage area
            if (filters.storage_area_id && item.item.storage_area_id !== Number(filters.storage_area_id)) {
                return false;
            }
            // supplier (ojo: está anidado dentro de presentations -> suppliers_presentations)
            if (filters.supplier) {
            const hasSupplier = item.item.presentations.some((p) =>
                p.suppliers_presentations && p.suppliers_presentations.some(
                (sp) => Number(sp.suppliers.supplier_id) === Number(filters.supplier)
                )
            );
            if (!hasSupplier) return false;
            }
            // --- filtro por texto ---
            if (searchTerm) {
                const lower = searchTerm.toLowerCase();
                const matches = item.item.name.toLowerCase().includes(lower);
                if (!matches) return false;
            }
    
            return true;
        });
    },[searchTerm]);
    
    /**AGREGAR TRADUCCIONES */
    const filteredItems = useMemo(() => {
        return applyFilters(details, appliedFilters);
    }, [details, appliedFilters, applyFilters]);
    

    // Cargar conteo
    useEffect(() => {
        (async () => {
        setLoading(true);
        const data = await getInventoryCount(Number(count_id));
        if (data) {
            setCount(data.data);
            if(data.data){
                setDetails(data.data.inventory_counts_details);             
            }

        }
        setLoading(false);
        })();
    }, [count_id]);

    const handleDetailsChange = useCallback((updated: CountTableRow[]) => {
        setDetails((prev) =>
            prev.map((d) => {
                const u = updated.find((x) => x.item_id === d.item.item_id);
                return u 
                    ? { ...d, counted_quantity: u.counted_quantity ?? d.counted_quantity } 
                    : d;
            })
        );
    }, []);

    const handleSave = async () => {
        if (!count) return;

        try {
            const response = await updateInventoryCount(
                count.count_id,
                details.map((d) => ({
                    count_detail_id: d.count_detail_id,
                    item_id: d.item_id,
                    counted_quantity: d.counted_quantity,
                    system_quantity: d.system_quantity,
                })),
                count.counted_by
            );

            if(response.success){
                toast.success(t("SUCCESSFULLY-UPDATE"));
                router.push('/en/dashboard/inventory/count');
            }            
        } catch (err) {
        console.error(err);
        toast.error("Error al actualizar el conteo");
        }
       
    };

    if (loading) {
        return <div className="p-6">Cargando conteo...</div>;
    }

    if (!count) {
        return <div className="p-6">No se encontró el conteo</div>;
    }

    return (
        <div className="overflow-y-hidden space-y-4 mx-auto px-2 sm:px-4">
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight">
                    {t("TITLE")} {count.count_id}
                </h1>
                <p className="text-sm text-muted-foreground tracking-tight">
                    {t("DESCRIPTION")}
                </p>
                </div>
                <Button onClick={handleSave} className="w-fit md:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    {t("SAVE_DATA")}
                </Button>
            </div>

            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder={t("SEARCH")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="block lg:hidden">
                        <Sheet open={showSheetSearch} onOpenChange={setShowSheetSearch}>
                            <SheetTrigger asChild>
                            <Button size="icon" >
                                <Funnel className="h-4 w-4"/>
                            </Button>                    
                            </SheetTrigger>
                            <SheetContent side='bottom' className="h-auto">
                            <SheetHeader className="mb-2 sm:mb-0 lg:hidden">
                                <SheetTitle className="flex items-center gap-2 text-sm sm:text-xl">
                                    <Funnel className="h-4 w-4 sm:h-5 sm:w-5" />
                                    {t("FILTERS_TITLE")}
                                </SheetTitle>
                            </SheetHeader>
                            <FiltersInventory 
                                initialFilters={{category_id: "", item_type_id: "", storage_area_id: "", supplier: ""}}
                                onApplyFilters={handleFilters}
                            />
                            </SheetContent>                  
                        </Sheet>
                    </div>
                    <div className="hidden lg:block">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant='outline' size='icon'>
                            <Funnel className="h-4 w-4" />
                            {/* <span className='sr-only'>Dimensions</span> */}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-72'>
                        <div className="mb-2 sm:mb-0">
                            <h1 className="text-foreground font-semibold flex items-center gap-2 text-sm sm:text-xl lg:text-sm">
                                <Funnel className="h-4 w-4 sm:h-5 sm:w-5" />
                                {t("FILTERS_TITLE")}
                            </h1>
                        </div>
                        <FiltersInventory 
                            initialFilters={{category_id: "", item_type_id: "", storage_area_id: "", supplier: ""}}
                            onApplyFilters={handleFilters}
                        />
                        </PopoverContent>
                    </Popover>
                    </div>
                </div>
                <div className="space-y-3">
                    {
                        filteredItems.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchTerm ? "No se encontraron items" : "No hay items"}
                            </div>
                        ): (
                            <CountInventoryTable
                            data={filteredItems.map((d) => ({
                                item_id: d.item.item_id,
                                name: d.item.name,
                                base_unit: d.item.base_unit,
                                system_quantity: d.system_quantity,
                                counted_quantity: d.counted_quantity,
                                presentation: d.item.presentations[0]
                            }))}
                            onChange={handleDetailsChange}
                            mode="EDIT"
                            /> 
                        )
                    }
                </div>
            </div>
        </div>
    );
}