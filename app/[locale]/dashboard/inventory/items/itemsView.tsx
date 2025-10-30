"use client"
import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { filters_Items, Item, ItemFormValues } from "@/types/item";
import { Edit, Funnel, MapPin, Plus, Search, Tag, Trash2, Truck } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"
import { FiltersInventory } from "@/components/dashboard/inventory/filters-inventory";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslations } from "next-intl";
import { ItemsForm } from "@/components/dashboard/inventory/items-form";
import { createItem, deleteItem, updateItem } from "@/actions/items";
import { toast } from "sonner";
import { create_present_sup_pre, deletePresentations, updatePresentations } from "@/actions/presentations";
import { revalidateItems, useItemsSWR } from "@/hooks/useItems";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function ItemsView() {

    const [showSheetAdd, setShowSheetAdd] = useState(false);
    const [showSheetSearch, setShowSheetSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openRow, setOpenRow] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const t = useTranslations("ITEMS");
    const { items=[], error:errorItems } = useItemsSWR();
    const [appliedFilters, setAppliedFilters] = useState<filters_Items>({
        category_id: "",
        item_type_id: "",
        storage_area_id: "",
        supplier: ""
    });

    const applyFilters = useCallback((items:Item[], filters: filters_Items) => {
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
                const matches =
                item.name && item.name.toLowerCase().includes(lower) ||
                item.description && item.description.toLowerCase().includes(lower) ||
                item.categories.name && item.categories.name.toLowerCase().includes(lower) ||
                item.item_types.name && item.item_types.name.toLowerCase().includes(lower) ||
                item.storage_areas.name && item.storage_areas.name.toLowerCase().includes(lower);
                
                if (!matches) return false;
            }

            return true;
        });
    },[searchTerm]);

    const filteredItems = useMemo(() => {
        return applyFilters(items, appliedFilters);
    }, [items, appliedFilters, applyFilters]);

    //   pagination
    const [page, setPage] = useState(1);
    const pageSize = 50; 
    const totalPages = Math.ceil(filteredItems.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentData = filteredItems.slice(startIndex, startIndex + pageSize);

    // console.log(currentData)
    // console.log(currentData.filter(p => !p.item_presentations))

    if (errorItems) {
        toast.error("Error cargando inventario");
    }
    const handleFilters = (filters: filters_Items) => {
        setAppliedFilters(filters);
    };

    const handleCancel = () => {
        setSelectedItem(null);
        setShowSheetAdd(false);
    }

    const handleSaveItem = async (itemData: ItemFormValues) => {

        // console.log("FORM DATA",itemData)

        if (selectedItem) {
            // //Edit existing
            const response = await updateItem(selectedItem, itemData);  
            if(itemData.item_presentations.length == selectedItem.item_presentations.length && response){
                const responseP = await updatePresentations(itemData.item_presentations);
                if(responseP.success) toast.success(t("SUCCESS-EDIT"));
            }
            if(itemData.item_presentations.length > selectedItem.item_presentations.length && response){
                const newsPresentation = itemData.item_presentations.filter(p => !p.item_presentation_id);
                const presents = itemData.item_presentations.filter(p => p.item_presentation_id);
                let responsePresen;
                if(newsPresentation.length > 0){
                const newPresentations = newsPresentation.map( p => {
                    const { ...rest } = p;
                    return {
                        ...rest,
                        item_id: selectedItem.item_id
                    };
                });
                responsePresen = await create_present_sup_pre(newPresentations);   
                }
                const responseUp = await updatePresentations(presents);
                if(responseUp.success && responsePresen && responsePresen.success) toast.success(t("SUCCESS-EDIT"));
            }
            if(itemData.item_presentations.length < selectedItem.item_presentations.length && response){
                const idsDelete = new Set(itemData.item_presentations.map(pre => pre.item_presentation_id));
                const toDelete = selectedItem.item_presentations.filter(ps => !idsDelete.has(ps.item_presentation_id));
                const responseDelete =  await deletePresentations(toDelete.map(p => p.item_presentation_id));
                const responseUp = await updatePresentations(itemData.item_presentations);
                if(responseUp.success && responseDelete && responseDelete.success) toast.success(t("SUCCESS-EDIT"));
            }
        } else {
            // Create new 
            const {item_presentations} = itemData;
            const response = await createItem(itemData);
            if (response.success && response.data){ 
                if(itemData.item_presentations.length > 0){
                    const newPresentations = item_presentations.map( p => {
                        const { ...rest } = p;
                        return {
                            ...rest,
                            item_id: response.data.item_id
                        };
                    });
                    const responsePresen = await create_present_sup_pre(newPresentations);
                    if(responsePresen && responsePresen.success && responsePresen.data.length > 0){
                        toast.success(t("SUCCESS-CREATE"));
                    }          
                }
            } else { 
                toast.error(t("ERROR-CREATE"));
            }
        }
        // revalidad ITEMS
        revalidateItems();
        setShowSheetAdd(false);
        setSelectedItem(null);
    }

    const handleEditItem =  (item: Item) => {
        setSelectedItem(item);
        setShowSheetAdd(true);
    }

    const handleDeleteItem = async (id: string) => {
        const response = await deleteItem(id);
        if (response.success){ 
        toast.success(t("SUCCESS-DELETE"));
        } else{ 
        toast.error(t("ERROR-DELETE"));
        }
        await revalidateItems();
        setSelectedItem(null);
    }

  return (
    <div className="overflow-y-hidden space-y-4 mx-auto p-2 sm:px-4">
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
            <div className="flex flex-col justify-start w-full">
                <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                <p className="text-sm text-muted-foreground tracking-tight">{t("DESCRIPTION-TITLE")}</p>
            </div>
            <Sheet open={showSheetAdd} onOpenChange={setShowSheetAdd}>
                <SheetTrigger asChild>
                <Button className="w-full md:w-fit">
                    <Plus className="mr-2 h-4 w-4"></Plus>
                    {t("NEW-ITEM")}
                </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg lg:max-w-5xl overflow-y-auto p-4 sm:p-6">
                <ItemsForm
                    onClose={handleCancel}
                    onSave={handleSaveItem}
                    item={selectedItem}
                ></ItemsForm>
                </SheetContent>
            </Sheet>            
        </div>
        
        <div className="flex flex-col space-y-4">
            <div className="flex md:flex-row gap-2 justify-start md:space-y-0 md:justify-between lg:space-x-4 2xl:justify-start">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder={t("SEARCH")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="block lg:hidden">
                <Sheet  open={showSheetSearch} onOpenChange={setShowSheetSearch}>
                    <SheetTrigger asChild>
                    <Button size="icon">
                        <Funnel className="h-4 w-4"/>
                    </Button>                    
                    </SheetTrigger>
                    <SheetContent side='bottom' className="h-auto">
                    <SheetHeader className="mb-2 sm:mb-0 lg:hidden">
                        <SheetTitle className="flex items-center gap-2 text-sm sm:text-xl">
                            <Funnel className="h-4 w-4 sm:h-5 sm:w-5" />
                            {t("FILTER-TITLE")}
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
                    <Button variant='default' size='icon'>
                        <Funnel className="h-4 w-4" />
                        {/* <span className='sr-only'>Dimensions</span> */}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-72'>
                    <div className="mb-2 sm:mb-0">
                        <h1 className="text-foreground font-semibold flex items-center gap-2 text-sm sm:text-xl lg:text-sm">
                            <Funnel className="h-4 w-4 sm:h-5 sm:w-5" />
                            {t("FILTER-TITLE")}
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
            {/* Cards Mobile */}
            <div className="block md:hidden space-y-3">
            {
                currentData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No se encontraron items" : "No hay items"}
                </div>
                ) : (
                currentData.map((item) => (
                    <div key={item.item_id}
                    className='border-primary border max-w-full gap-0 bg-transparent shadow-md rounded-md flex flex-col space-y-3'
                    >
                    <div className="flex justify-between items-start p-3 pb-0">
                        <div className="flex flex-col">
                        <h1 className="text-lg font-bold tracking-tight text-foreground">{item.name}</h1>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        </div>
                        <div className="flex items-center space-x-1">
                        <ConfirmDialog
                            trigger={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                title="Eliminar"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                            }
                            title={t("DELETE-ITEM")}
                            description={t("DELETE-DESCRIPTION")}
                            confirmText={t("DELETE")}
                            cancelText={t("CANCEL")}
                            onConfirm={() => handleDeleteItem(item.item_id)}
                        />
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-between py-1 px-3 bg-secondary">
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-secondary-foreground" />
                            <span className="text-sm  text-secondary-foreground">{item.item_presentations.map(p => p.suppliers_presentations?.map(sp => sp.suppliers.company_name)).join(',')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-secondary-foreground" />
                            <span className="text-sm text-secondary-foreground">{item.categories.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-secondary-foreground" />
                            <span className="text-sm text-secondary-foreground">{item.storage_areas.name}</span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full space-y-3">
                        <div className="flex w-full justify-between items-end space-x-1 px-3">
                            <span className="text-sm text-muted-foreground tracking-tight">{t("QU-MIN")}</span>
                            <span className="text-sm">{item.min_quantity} {item.units.abbreviation}</span>
                        </div>
                        <div className="w-full flex  justify-between items-end  space-x-1 px-3">
                            <span className="text-sm text-muted-foreground tracking-tight">{t("QU-TARGET")}</span>
                            <span className="text-sm">{item.target_quantity} {item.units.abbreviation}</span>
                        </div>
                        <div className="w-full flex  justify-between items-end space-x-1 py-1 px-3 bg-secondary rounded-bl-md rounded-br-md">
                            <span className="text-sm text-muted-foreground font-bold tracking-tight">{t("QU-NOW")}</span>
                            <span className="text-sm font-bold">{item.system_quantity} {item.units.abbreviation}</span>
                        </div>
                    </div>
                    </div>
                ))
                )
            }
            </div>
            {/* Desktop and Tablets  */}
            <div className="hidden md:block overflow-x-auto space-y-2">
                <div className="md:rounded-xl md:border md:border-border shadow">
                    <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[60vh]">
                        <Table className="bg-card">
                            <TableHeader>
                            <TableRow className="bg-secondary">
                                <TableHead className="text-foreground font-semibold">{t("T-NAME")}</TableHead>
                                <TableHead className="text-foreground font-semibold hidden lg:table-cell">{t("T-DESCRIPTION")}</TableHead>
                                <TableHead className="text-foreground font-semibold hidden lg:table-cell">{t("T-TYPE")}</TableHead>
                                <TableHead className="text-foreground font-semibold">
                                <div className="flex items-center gap-1">
                                    <Truck className="h-4 w-4" />
                                    <p>{t("T-SUPPLIER")}</p>
                                </div>
                                </TableHead> 
                                <TableHead className="text-foreground font-semibold">
                                <div className="flex items-center gap-1">
                                    <Tag className="h-4 w-4" /> 
                                    <p>{t("T-CATEGORY")}</p>
                                </div>
                                </TableHead>
                                <TableHead className="text-foreground font-semibold hidden xl:table-cell">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" /> 
                                    <p>{t("T-AREA")}</p>
                                </div>
                                </TableHead>
                                <TableHead className="text-foreground font-semibold">{t("T-UNIT")}</TableHead>
                                <TableHead className="hidden text-foreground font-semibold xl:table-cell">{t("QU-MIN")}</TableHead>
                                <TableHead className="hidden text-foreground font-semibold lg:table-cell">{t("QU-TARGET")}</TableHead>
                                <TableHead className="text-foreground font-semibold">{t("QU-NOW")}</TableHead>
                                <TableHead className="text-foreground font-semibold">{t("T-ACCTIONS")}</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {currentData.map((item) => (
                                <React.Fragment key={item.item_id}>
                                <TableRow
                                    className={`${openRow === item.item_id && 'bg-muted/50'} md:cursor-pointer lg:cursor-auto hover:bg-muted/50`}
                                    onClick={() => setOpenRow(openRow === item.item_id ? null : item.item_id)}
                                >
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{item.description}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{item.item_types.name}</TableCell>
                                    <TableCell>{item.item_presentations.map(p => p.suppliers_presentations?.map(sp => sp.suppliers.company_name)).join(',')}</TableCell>
                                    <TableCell>{item.categories.name}</TableCell>
                                    <TableCell className="hidden xl:table-cell">{item.storage_areas.name}</TableCell>
                                    <TableCell>{item.units.abbreviation}</TableCell>
                                    <TableCell className="hidden xl:table-cell">{item.min_quantity}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{item.target_quantity}</TableCell>
                                    <TableCell>{item.system_quantity}</TableCell>
                                    <TableCell>
                                    <div className="flex gap-1">
                                        <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleEditItem(item)}
                                        title="Editar"
                                        >
                                        <Edit className="h-4 w-4" />
                                        </Button>
                                        <ConfirmDialog
                                        trigger={
                                            <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            title="Eliminar"
                                            >
                                            <Trash2 className="h-4 w-4" />
                                            </Button>
                                        }
                                        title={t("DELETE-ITEM")}
                                        description={t("DELETE-DESCRIPTION")}
                                        confirmText={t("DELETE")}
                                        cancelText={t("CANCEL")}
                                        onConfirm={() => handleDeleteItem(item.item_id)}
                                        />
                                    </div>
                                    </TableCell>
                                </TableRow>
                                {/* expandible */}
                                <TableRow>
                                    <TableCell colSpan={6} className="p-0 boerder-0">
                                    <AnimatePresence>
                                        {openRow === item.item_id && (
                                        <motion.div
                                            initial={{ scaleY: 0, opacity: 0 }}
                                            animate={{ scaleY: 1, opacity: 1 }}
                                            exit={{ scaleY: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeInOut" }}
                                            style={{ originY: 0 }}
                                            className="overflow-hidden p-4 bg-muted/30 rounded-md lg:hidden"
                                        >
                                            <div className="grid grid-cols-2 grid-rows-4">
                                            <div className="flex flex-col">
                                                <h1 className="text-lg font-bold tracking-tight text-foreground">{item.name}</h1>
                                                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                                            </div>
                                            <div className="flex items-center justify-end">
                                                <Badge variant="secondary">{item.item_types.name}</Badge>
                                            </div>
                                                <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                <Truck className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">{t("T-SUPPLIER")}</span>
                                                </div>
                                                <p className="text-sm font-bold">{item.item_presentations.map(p => p.suppliers_presentations?.map(sp => sp.suppliers.company_name)).join(',')}</p>
                                            </div> 
                                            <div className="flex w-full items-center justify-end gap-4">
                                                <span className="text-sm text-muted-foreground tracking-tight">{t("QU-MIN")}</span>
                                                <span className="text-sm font-bold">{item.min_quantity} {item.units.abbreviation}</span>
                                            </div> 
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm  text-muted-foreground">{t("T-CATEGORY")}</span>
                                                </div>
                                                <p className="text-sm font-bold">{item.categories.name}</p>
                                            </div> 
                                            <div className="w-full flex  justify-end items-center gap-4">
                                                <span className="text-sm text-muted-foreground tracking-tight">{t("QU-TARGET")}</span>
                                                <span className="text-sm font-bold">{item.target_quantity} {item.units.abbreviation}</span>
                                            </div>  
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm  text-muted-foreground">{t("T-AREA")}</span>
                                                </div>
                                                <p className="text-sm font-bold">{item.storage_areas.name}</p>
                                            </div> 
                                            <div className="w-full flex justify-end items-center gap-4">
                                                <span className="text-sm text-muted-foreground tracking-tight">{t("QU-NOW")}</span>
                                                <span className="text-sm font-bold">{item.system_quantity} {item.units.abbreviation}</span>
                                            </div>               
                                            </div>
                                        </motion.div>
                                        )}
                                    </AnimatePresence>
                                    </TableCell>
                                </TableRow>
                                </React.Fragment>
                            ))

                            }
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
        <Pagination>
            <PaginationContent>
            <PaginationItem>
                <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-disabled={page === 1}
                />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>
                    {i + 1}
                </PaginationLink>
                </PaginationItem>
            ))}
            <PaginationItem>
                <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-disabled={page === totalPages}
                />
            </PaginationItem>
            </PaginationContent>
        </Pagination>
        )}

    </div>
  );
}