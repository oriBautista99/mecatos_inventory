"use client"

import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Item_types, ItemTypeSchema, ItemTypesFormValues } from "@/types/itemTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@/components/ui/separator";
import { Edit, Plus, Save, Search, SearchX, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createItemType, deleteItemType, updateItemType } from "@/actions/item_types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { revalidateItemTypes, useItemTypesSWR } from "@/hooks/useItemTypesSWR";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function CardItemTypes(){

    // const [itemTypes, setItemTypes] = useState<Item_types[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectType, setSelectedType] = useState<Item_types | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const t = useTranslations("ITEM-TYPES"); 
    const { itemTypes=[], error } = useItemTypesSWR();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        } = useForm<ItemTypesFormValues>({
        resolver: zodResolver(ItemTypeSchema),
        defaultValues: {
            name: "",
            description: ""
        },
    });

    if (error) {
        toast.error("Error cargando categorías");
    }

    useEffect(() => {
        if(selectType){
            reset({
                name: selectType.name,
                description: selectType.description
            });
        }
    }, [selectType, reset])

    const filteredTypes = itemTypes.filter(
        (type) =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    //   pagination
    const [page, setPage] = useState(1);
    const pageSize = 10; 
    const totalPages = Math.ceil(filteredTypes.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentData = filteredTypes.slice(startIndex, startIndex + pageSize);

    const handleSave = async (typeData: ItemTypesFormValues) => {
        if (selectType) {
        // Edit existing 
        const response = await updateItemType(selectType, typeData);
        if(response.success){
            toast.success(t("SUCCESS-EDIT"));
        }else{
            toast.error(t("ERROR-EDIT"));
        }
        } else {
        // Create new 
        const response = await createItemType(typeData);

        if (response.success){ 
            toast.success(t("SUCCESS-CREATE"));
        } else{ 
            toast.error(t("ERROR-CREATE"));
        }
        }
        await revalidateItemTypes();
        setShowForm(false);
        setSelectedType(null);
    }

    const handleCancel = () => {
        setSelectedType(null);
        setShowForm(false);
    }

    const handleEdit = (type: Item_types) => {
        setSelectedType(type);
        setShowForm(true);
    }
    
    const handleDelete = async (id: string) => {
        const response = await deleteItemType(id);
        if (response.success){ 
            toast.success(t("SUCCESS-DELETE"));
        } else{ 
            toast.error(t("ERROR-DELETE"));
        }
        await revalidateItemTypes();
        setSelectedType(null);
    }

    return(
        <div className="overflow-y-hidden space-y-4 mx-auto ">
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                <div className="flex flex-col justify-start w-full">
                    <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                    <p className="text-sm text-muted-foreground tracking-tight">
                        {t("DESCRIPTION-TITLE")}
                    </p>
                </div>
                <Sheet open={showForm} onOpenChange={setShowForm} >
                    <SheetTrigger asChild>
                        <Button className="w-full md:w-fit">
                        <Plus className="mr-2 h-4 w-4" />
                            {t("ADD")}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg lg:max-w-xl overflow-y-auto p-4 sm:p-6">
                        <div className="">
                            <SheetTitle>
                                <div className="p-1">
                                    <h3 className="text-lg font-bold sm:text-xl">{selectType ?  t("EDIT-ITEM-TYPES") : t("CREATE-ITEM-TYPES")}</h3>
                                </div>                                    
                            </SheetTitle>
                            <Separator />
                            <form onSubmit={handleSubmit(handleSave)} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm">
                                        {t("T-NAME")} *
                                    </Label>
                                    <Input
                                        id="name"
                                        {...register("name")}
                                        placeholder="Recetas"
                                        className={`text-sm ${errors.name ? "border-destructive" : ""}`}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm">
                                        {t("T-DESCRIPTION")} *
                                    </Label>
                                    <Textarea
                                        id="description"
                                        {...register("description")}
                                        placeholder="Describe a que se refiere tu tipo de producto"
                                        className={`text-sm resize-none ${errors.description ? "border-destructive" : ""}`}
                                        rows={2}
                                    />
                                    {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                                </div>
                                {/* Actions */}
                                <div className="flex gap-2 sm:gap-3 pt-4 border-t">
                                    <Button type="submit" className="flex-1 text-sm">
                                        <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        { selectType ? t("UPDATE") : t("SAVE") }
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleCancel()}
                                        className="flex-1 sm:flex-none text-sm bg-transparent"
                                        >
                                        <X className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        {t("CANCEL")} 
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </SheetContent>
                </Sheet> 
            </div>
            <div className="flex flex-col space-y-4">
                <div className="flex md:flex-row gap-2 justify-start md:space-y-0 md:justify-between lg:space-x-4 2xl:justify-start">
                    <div className="relative flex-1 max-w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("SEARCH")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                {/* Mobile Cards View */}
                <div className="block sm:hidden space-y-4 w-full">
                    {currentData.length === 0 ? (
                        <div className="text-center py-12">
                            <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">{t("NO-TYPES")}</h3>
                            <p className="text-muted-foreground">
                                {searchTerm ? t("NO-FOUND-TYPES") : t("NO-TYPES")}
                            </p>
                        </div>
                    ):(
                        currentData.map((type) => (
                            <div 
                                key={type.item_type_id} 
                                className="border rounded-lg p-4 space-y-3 bg-muted hover:bg-accent cursor-pointer flex justify-between">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <h3 className="font-bold text-sm">{type.name}</h3>
                                        <p className="text-xs text-foreground">{type.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleEdit(type)}
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <ConfirmDialog
                                            trigger={
                                                <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                title={t("DELETE")}
                                                >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            }
                                            title={t("DELETE-TYPE")}
                                            description={t("DELETE-DESCRIPTION")}
                                            confirmText={t("DELETE")}
                                            cancelText={t("CANCEL")}
                                            onConfirm={() => {handleDelete(type.item_type_id)}}
                                    />
                                </div>
                            </div>
                        ))                    
                    )}
                </div>
                {/* Desktop Table View */}
                <div className="hidden sm:block rounded-md border overflow-x-auto max-h-[45vh]" >
                    <Table className="bg-card">
                    <TableHeader>
                        <TableRow className="bg-secondary">
                        <TableHead className="min-w-[150px]">{t("T-NAME")}</TableHead>
                        <TableHead className="min-w-[120px]">{t("T-DESCRIPTION")}</TableHead>
                        <TableHead className="w-[140px]">{t("T-ACTIONS")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            <div className="text-center py-12">
                                <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-2">{t("NO-TYPES")}</h3>
                                <p className="text-muted-foreground">
                                    {searchTerm ? t("NO-FOUND-TYPES") : t("NO-TYPES")}
                                </p>
                            </div>
                            </TableCell>
                        </TableRow>
                        ) : (
                        currentData.map((type) => (
                            <TableRow
                            key={type.item_type_id}
                            className="hover:bg-muted/50 cursor-pointer"
                            >
                            <TableCell>
                                <div className="space-y-1">
                                <div className="font-medium text-sm">{type.name}</div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-1">
                                <div className="font-medium text-sm">{type.description}</div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEdit(type)}
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
                                    title={t("DELETE-TYPE")}
                                    description={t("DELETE-DESCRIPTION")}
                                    confirmText={t("DELETE")}
                                    cancelText={t("CANCEL")}
                                    onConfirm={() => handleDelete(type.item_type_id)}
                                />

                                </div>
                            </TableCell>
                            </TableRow>
                        ))
                        )}
                    </TableBody>
                    </Table>
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

    )
}