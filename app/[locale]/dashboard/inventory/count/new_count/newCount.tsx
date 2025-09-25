"use client"

import { getItemsWithStock, saveInventoryCount } from "@/actions/inventory";
import CountInventoryTable from "@/components/dashboard/inventory/count-inventory-table";
import { FiltersInventory } from "@/components/dashboard/inventory/filters-inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useProfileLoginSWR } from "@/hooks/useUserLogin";
import { CountTableRow, ItemForCount, ItemForCountTable } from "@/types/inventory";
import { filters_Items } from "@/types/item";
import { Funnel, Save, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function NewCount() {

    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSheetSearch, setShowSheetSearch] = useState(false);
    const {profile} = useProfileLoginSWR();
    const [appliedFilters, setAppliedFilters] = useState<filters_Items>({
        category_id: "",
        item_type_id: "",
        storage_area_id: "",
        supplier: ""
    });

    const [items, setItems] = useState<ItemForCount[]>([]);
    const [countedItems, setCountedItems] = useState<ItemForCount[]>([]);
    const t = useTranslations("NEW-COUNT");
    const router = useRouter();

    const handleFilters = (filters: filters_Items) => {
        setAppliedFilters(filters);
    };

    const applyFilters = useCallback((items:ItemForCount[], filters: filters_Items) => {
        return items.filter((item) => {
          // category
          if (filters.category_id && item.category_id !== Number(filters.category_id)) {
            return false;
          }
          // type
          if (filters.item_type_id && item.item_type_id !== Number(filters.item_type_id)) {
            return false;
          }
          // storage area
          if (filters.storage_area_id && item.storage_area_id !== Number(filters.storage_area_id)) {
            return false;
          }
          // supplier (ojo: está anidado dentro de presentations -> suppliers_presentations)
          if (filters.supplier) {
            const hasSupplier = item.presentations.some((p) =>
              p.suppliers_presentations && p.suppliers_presentations.some(
                (sp) => Number(sp.suppliers.supplier_id) === Number(filters.supplier)
              )
            );
            if (!hasSupplier) return false;
          }
          // --- filtro por texto ---
          if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            const matches = item.name.toLowerCase().includes(lower);
            if (!matches) return false;
          }
    
          return true;
        });
    },[searchTerm]);
    
    const filteredItems = useMemo(() => {
        return applyFilters(items, appliedFilters);
    }, [items, appliedFilters, applyFilters]);

    // conteo
    useEffect(() => {
        (async () => {
            const data: ItemForCount[]= await getItemsWithStock();
            setItems(data);
            const timer: NodeJS.Timeout = setInterval(() => {
                setProgress((old) => {
                        if (old >= 100) {
                            clearInterval(timer)
                            setLoading(false)
                            return 100
                        }
                        return old + 20
                    })
                }, 150)
                return () => clearInterval(timer) 
            })();
    }, []);

    const handleCountTableChange = useCallback((updated: CountTableRow[]) => {
        setCountedItems(() => {
            const allItemIds = items.map(item => item.item_id);
            const newCountedItems = updated
                .filter(u => allItemIds.includes(u.item_id) && u.counted_quantity !== undefined)
                .map(u => {
                    // Necesitas encontrar el ítem original para obtener el resto de sus propiedades
                    const originalItem = items.find(item => item.item_id === u.item_id);

                    if (!originalItem) {
                        return null;
                    }
                    return {
                        ...originalItem, // Copia las propiedades originales (system_quantity, etc.)
                        counted_quantity: u.counted_quantity, // Sobrescribe con el nuevo conteo
                    } as ItemForCount; // Ajusta el tipo según tu definición real si es necesario
                })
                .filter((item): item is ItemForCount => item !== null);
                return newCountedItems;
        });
    },[items]);

  const handleSave = async () => {
    if(profile)
        await saveInventoryCount(
            profile.profile_id,
            countedItems.map((it:ItemForCountTable) => ({
                item_id: it.item_id,
                counted_quantity: it.counted_quantity ?? 0,
                system_quantity: it.system_quantity,
            }))
        );
    toast.success(t("SUCCESSFULLY-SAVE"));
    router.push('/en/dashboard/inventory/count');
  };

    return(
        <div className="overflow-y-hidden space-y-4 mx-auto px-2 sm:px-4">
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                    <p className="text-sm text-muted-foreground tracking-tight">
                        {t("DESCRIPTION")}
                    </p>
                </div>
                <Button onClick={handleSave} className="w-fit md:w-auto">
                    <Save className="mr-2 h-4 w-4"></Save>
                    {t("SAVE")}
                </Button>        
            </div>
            {
                loading ? (
                <div className="flex flex-col items-center justify-center p-8 gap-4">
                    <span className="text-muted-foreground">{t("LOADING")}.</span>
                    <Progress value={progress} className="w-2/3 h-3" />
                </div>
                ) : (
                <div className="flex flex-col space-y-4">
                    <div className="space-y-4 p-4 sm:p-0">
                    {/* Search Bar Mobile */}
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
                        ) : (
                            <div className="md:rounded-xl md:border md:border-border shadow">
                                <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[70vh]">
                                    <CountInventoryTable
                                        data={filteredItems.map((it: ItemForCountTable) => ({
                                            item_id: it.item_id,
                                            name: it.name,
                                            base_unit: it.base_unit,
                                            system_quantity: it.system_quantity,
                                            counted_quantity: it.counted_quantity,
                                        }))}
                                        onChange={handleCountTableChange}
                                        mode="CREATE"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            )
            }
        </div>
    );
}