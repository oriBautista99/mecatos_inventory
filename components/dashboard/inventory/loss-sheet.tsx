"use client"
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useItemsSWR } from "@/hooks/useItems";
import { useProfileLoginSWR } from "@/hooks/useUserLogin";
import { filters_Items } from "@/types/item";
import { ItemForLoss, LossEventDetail } from "@/types/loss";
import { Funnel, Save, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import LossForm, { FormValues } from "./loss-form";
import LostItemsTable, { RowValuesLost } from "./loss-items-table";
import { Input } from "@/components/ui/input";
import { FiltersInventory } from "./filters-inventory";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { createLossEvent, getLossEventById, updateLossEvent } from "@/actions/loss";
import { Progress } from "@/components/ui/progress";
import { Item } from "@/types/item";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

type Props = {
  eventId?: number | null;
  onClose: () => void;
};

export default function LossSheet({eventId, onClose }: Props) {

    const { items=[] as ItemForLoss[] } = useItemsSWR();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSheetSearch, setShowSheetSearch] = useState(false);
    const {profile} = useProfileLoginSWR();
    const [profileEvent, setProfileEvent] = useState(0);
    const [appliedFilters, setAppliedFilters] = useState<filters_Items>({
        category_id: "",
        item_type_id: "",
        storage_area_id: "",
        supplier: ""
    });
    const [formData, setFormData] = useState<FormValues | null>(null);
    const [initformData, setInitFormData] = useState<Partial<FormValues> | null>(null);
    const [tableData, setTableData] = useState<RowValuesLost[]>([]);
    const [initTableData, setInitTableData] = useState<RowValuesLost[] | null>(null);
    const [allDetails, setAllDetails] = useState<Partial<LossEventDetail>[]>([]);
    const t = useTranslations("LOSS-SHEET");

    useEffect(() => {
        if(eventId){
            setLoading(true);
            (async () => {
                const { data } = await getLossEventById(eventId);
                if(data) {
                    setProfileEvent(data.profile_id);
                    setInitFormData({
                        loss_date: new Date(data.loss_date),
                        reason: data.reason,
                        notes: data.notes ?? "",
                    });
                    setAllDetails((data.loss_event_details ?? [] ) as Partial<LossEventDetail>[]);
                    if(data.loss_event_details){
                        setInitTableData(
                            data.loss_event_details.map((i) => ({
                                item_id: Number(i.item_id) ?? '',
                                quantity_lost: String(i.quantity_lost) ?? ''
                            }))
                        );  
                    }

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
                }
                
            })();
        }
    }, [eventId]);

    const handleFilters = (filters: filters_Items) => {
        setAppliedFilters(filters);
    };
    
    const applyFilters = useCallback((items:ItemForLoss[] | Item[], filters: filters_Items) => {
        return items.filter((item) => {
            if (filters.category_id && item.category_id !== Number(filters.category_id)) {
                return false;
            }
            if (filters.item_type_id && item.item_type_id !== Number(filters.item_type_id)) {
                return false;
            }
            if (filters.storage_area_id && item.storage_area_id !== Number(filters.storage_area_id)) {
                return false;
            }
            
            if (filters.supplier) {
                const hasSupplier = item.item_presentations.some((p) =>
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
        }) as Item[] | ItemForLoss[];
    },[searchTerm]);

    const handleSave = async () => {
        if(tableData && formData && !eventId){
            const dataLost = {
                profile_id: profile?.profile_id,
                loss_date: formData.loss_date,
                notes: formData?.notes,
                reason: formData.reason,
                items: tableData.map(item => {
                    if(item.quantity_lost){
                        return({
                            item_id: item.item_id,
                            quantity_lost: item.quantity_lost,
                            production_event_detail_id: null
                        })
                    }
                    return null;
                }).filter(Boolean)
            }
            const response = await createLossEvent(dataLost);   
                        
            if(response.success) {
                toast.success("SUCCESS-CREATE");
                onClose();
            }
            if(response.error){
                toast.success("ERROR-CREATE");
            }
        }
        if(tableData && formData && eventId){
            //editar
            const dataLost = {
                profile_id: profileEvent,
                loss_date: formData.loss_date,
                notes: formData?.notes,
                reason: formData.reason,
                items: tableData.map(item => {
                    const update = allDetails?.find(it => item.item_id === Number(it.item_id));
                    if(item.quantity_lost){
                        return({
                            loss_event_detail_id: update?.loss_event_detail_id,
                            item_id: item.item_id,
                            quantity_lost: item.quantity_lost,
                            production_event_detail_id: null
                        })
                    }
                    return null;
                }).filter(Boolean)
            }
            const responseUpd = await updateLossEvent(eventId, dataLost);

            if(responseUpd.success) {
                toast.success(t("SUCCESS-CREATE"));
                onClose();
            }
            if(responseUpd.error){
                toast.success(t("ERROR-CREATE"));
            }
        }
    };
        
    const filteredItems = useMemo(() => {
        return applyFilters(items, appliedFilters);
    }, [items, appliedFilters, applyFilters]);

    return(
        <SheetContent className="w-full h-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto p-4 sm:p-6 space-y-4">
            <SheetHeader className="space-y-2 sm:space-y-3 mb-3">
                <SheetTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t("TITLE")}
                </SheetTitle>
            </SheetHeader>
            <Separator />
            {
                loading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        <span className="text-muted-foreground">{t("LOADING")}</span>
                        <Progress value={progress} className="w-2/3 h-3" />
                    </div>
                ) : (
                    <div className="space-y-3 flex flex-col justify-between">
                        <LossForm onSubmit={setFormData} initialData={initformData}></LossForm>
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
                                            {t("FILTERS")}
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
                                        {t("FILTERS")}
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
                                        <LostItemsTable data={filteredItems} typeTable={eventId ? 'EDIT' : 'CREATE'} onChange={setTableData} initialRows={initTableData}></LostItemsTable>          
                                    </div>
                                </div>
                            )}
                        </div>
                        <SheetFooter>
                                <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <Button type="submit" className="flex-1 text-sm" onClick={handleSave}>
                                        <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        {t("SAVE")}
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
                        </SheetFooter>
                    </div>                    
                )
            }
        </SheetContent>
    )
}