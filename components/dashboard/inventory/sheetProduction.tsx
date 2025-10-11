'use client'

import { SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ProductionSheetForm, { FormValues } from "./production-sheet-form";
import ProductionItemsTable, { RowValues } from "./production-item-table";
import { useItemsSWR } from "@/hooks/useItems";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Save, X } from "lucide-react";
import { createProduction, getProductionById, updateProductioEvent, updateProductionDetails } from "@/actions/production";
import { TYPE_PRODUCTION } from "@/types/constants";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ProductionEvent, ProductionEventDetail } from "@/types/production";
import { Separator } from "@/components/ui/separator";

type Props = {
  type?: typeof TYPE_PRODUCTION[keyof typeof TYPE_PRODUCTION] | null;
  eventId?: number | null;
  onClose: () => void;
};

export function SheetProduction({ type, eventId, onClose }: Props){

    const { items=[] } = useItemsSWR();
    const [allDetails, setAllDetails] = useState<Partial<ProductionEventDetail>[]>([]);
    const [tableData, setTableData] = useState<RowValues[]>([]);
    const [initTableData, setInitTableData] = useState<RowValues[] | null>(null);
    const [formData, setFormDate] = useState<FormValues | null>(null);
    const [initformData, setInitFormDate] = useState<Partial<FormValues> | null>(null);
    const t = useTranslations("SHEET-PRODUCTION");

    useEffect(() => {
        if (eventId) {
            (async () => {
                const { data } = await getProductionById(eventId); 
                if (data) {
                // rellenar formulario
                setInitFormDate({
                    user: data.profile_id ?? "",
                    date: new Date(data.event_date),
                    time: new Date(data.event_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    notes: data.notes ?? "",
                });
                // rellenar tabla
                setAllDetails((data.production_event_details ?? [] ) as Partial<ProductionEventDetail>[]);
                if(data.production_event_details){
                    setInitTableData(
                        data.production_event_details.map((i) => ({
                            item_id: Number(i.item_id ?? 0), // asegura número
                            item: i.items[0]?.name ?? "",       // asegura string
                            quantity: String(i.quantity_produced) ?? 0,
                            hour: i.hour ?? "",
                            current_quantity: String(i.current_quantity) ?? 0,
                        }))
                    );  
                }

                }
            })();
        }
    }, [eventId]);

    if (!type && !eventId) return null;

    let itemsSelected;
    if(type) {
        itemsSelected =  items.filter(item => item.production_type === type);
    }
    
    const handleSave = async () => {
        if(tableData && formData && !eventId){
            const dataEvent = {
                profileId: formData?.user,
                notes: formData?.notes,
                typeProduction: type,
                items: tableData.map(item => {
                    if(item.quantity){
                        return({
                            "item_id": item.item_id,
                            "quantity": Number(item.quantity),
                            "current_quantity": item.current_quantity ? item.current_quantity : 0,
                            "hour": item.hour,
                            "shelf_life_days": null
                        })                        
                    }
                    return null;
                }).filter(Boolean)
            }   

            const response = await createProduction(dataEvent);   
            
            if(response.success) {
                toast.success("SUCCESS-CREATE");
                onClose();
            }
            if(response.error){
                toast.success("ERROR-CREATE");
            }
        }
        if(tableData && formData && eventId){
            const newDataForm : Partial<ProductionEvent> = {
                profile_id: formData.user,
                event_date: type != 'BREAD' ? new Date(formData.time).toISOString() : undefined,
                notes: formData.notes
            }
            const responseUpdEvent = await updateProductioEvent(eventId, newDataForm);
            
            if(responseUpdEvent.success){
                const updateDetails = tableData.map( det => {
                    const update = allDetails?.find(du => Number(du.item_id) === det.item_id);
                    if( update ){
                        return {
                            item_id: update.item_id,
                            production_event_detail_id: update.production_event_detail_id,
                            quantity: Number(det.quantity),
                            current_quantity: det.current_quantity ? det.current_quantity : 0,
                            hour: det.hour,
                            shelf_life_days: update.shelf_life_days
                        }
                    }else{
                        if(det.quantity){
                            return {
                                item_id: det.item_id,
                                production_event_id: eventId,
                                quantity: Number(det.quantity),
                                current_quantity: det.current_quantity ? det.current_quantity : 0,
                                hour: det.hour,
                                shelf_life_days: null
                            }                            
                        }
                        return null; 
                    }

                }).filter(Boolean);
                const responseUpdDetails = await updateProductionDetails(updateDetails);     
                
                if(responseUpdDetails.success){
                    toast.success("SUCCESS-UPDATE");
                    onClose();
                }
            }            
        }
    }


    if(type && itemsSelected){
        return (
            <SheetContent className="w-full md:max-w-xl lg:max-w-2xl overflow-y-auto p-4 sm:p-6 space-y-4" onInteractOutside={onClose} onEscapeKeyDown={onClose}>
                <SheetHeader className="space-y-2 sm:space-y-3 mb-3">
                    <SheetTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <ChefHat className="h-4 w-4 sm:h-5 sm:w-5"/>
                        {t(`${type}_TITLE`)}
                    </SheetTitle>
                </SheetHeader>
                <Separator />
                <ProductionSheetForm type={type} onSubmit={setFormDate} initialData={initformData}></ProductionSheetForm>
                <ProductionItemsTable type={type} data={itemsSelected} typeTable={eventId ? 'EDIT' : 'CREATE'} onChange={setTableData} initialRows={initTableData}></ProductionItemsTable>
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
            </SheetContent>
        );        
    }

}