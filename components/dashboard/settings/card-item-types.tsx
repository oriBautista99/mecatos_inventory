"use client"

import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Item_types, ItemTypeSchema, ItemTypesFormValues } from "@/types/itemTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@/components/ui/separator";
import { Edit, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createItemType, deleteItemType, updateItemType } from "@/actions/item_types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { revalidateItemTypes, useItemTypesSWR } from "@/hooks/useItemTypesSWR";

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
        <Card>
            <CardHeader className="px-6 sm:p-6">
                <CardTitle className="text-lg font-bold sm:text-xl">{selectType ?  t("EDIT-ITEM-TYPES") : t("CREATE-ITEM-TYPES")}</CardTitle>
                <CardDescription className="text-sm">{selectType ?  t("EDIT-DESCRIPTION") : t("CREATE-DESCRIPTION")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
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
                <div className="block sm:hidden space-y-4 w-full">
                    {filteredTypes.length === 0 ? (
                        <div className="text-center py-2 text-muted-foreground">
                            {searchTerm ? t("NO-FOUND-TYPES") : t("NO-TYPES")}
                        </div>
                    ):(
                        filteredTypes.map((type) => (
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
              <div className="hidden sm:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">{t("T-NAME")}</TableHead>
                      <TableHead className="min-w-[120px]">{t("T-DESCRIPTION")}</TableHead>
                      <TableHead className="w-[140px]">{t("T-ACTIONS")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm ?  t("NO-FOUND-TYPES") : t("NO-TYPES")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTypes.map((type) => (
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
                
                    {showForm && 
                        <div className="">
                            <div className="p-1">
                                <h3 className="text-lg font-bold sm:text-xl">Agregar un tipo de Producto</h3>
                            </div>
                            <Separator />
                            <form onSubmit={handleSubmit(handleSave)} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm">
                                        Nombre *
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
                                        Descripcion *
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
                                        { selectType ? "Actualizar" : "Guardar"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleCancel()}
                                        className="flex-1 sm:flex-none text-sm bg-transparent"
                                        >
                                        <X className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        Cancelar 
                                    </Button>
                                </div>
                            </form>
                        </div>
                    }
                    {
                        !showForm &&
                        <div className="flex flex-col w-full">
                            <Button onClick={() => {setShowForm(!showForm)}}>
                                <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4"/>
                                Añadir
                            </Button>
                        </div>                        
                    }

                
            </CardContent>
        </Card>
    )
}