"use client"

import { createUnit, deleteUnit, getUnits, updateUnit } from "@/actions/units";
import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UnitFormValues, Units as Unit, UnitSchema } from "@/types/units";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Units(){
    const [searchTerm, setSearchTerm] = useState("");
    const [selectUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const t = useTranslations("UNITS"); 
    const [units, setUnits] = useState<Unit[]>([]);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        } = useForm<UnitFormValues>({
        resolver: zodResolver(UnitSchema),
        defaultValues: {
            name: "",
            abbreviation: ""
        },
    });

    async function loadUnits() {
        const {data, error} = await getUnits();
        if(data) {
            setUnits(data);
        }else{
            toast.error(error);
        }
    }

    useEffect(() => {
        loadUnits();
    }, [])

    useEffect(() => {
        if(selectUnit){
            reset({
                name: selectUnit.name,
                abbreviation: selectUnit.abbreviation,
            });
        }
    }, [selectUnit, reset])

    const filteredUnits = units.filter(
        (type) =>
            type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleSave = async (formData: UnitFormValues) => {
        if (selectUnit) {
            const response = await updateUnit(selectUnit, formData);
            if(response.success){
                toast.success(t("SUCCESS-EDIT"));
            }else{
                toast.error(t("ERROR-EDIT"));
            }
        } else {
            // Create new 
            const response = await createUnit(formData);

            if (response.success){ 
                toast.success(t("SUCCESS-CREATE"));
                loadUnits();
            } else{ 
                toast.error(t("ERROR-CREATE"));
            }
        }
        setShowForm(false);
        setSelectedUnit(null); 
    }

    const handleCancel = () => {
        setSelectedUnit(null);
        setShowForm(false);
    }

    const handleEdit = (type: Unit) => {
        setSelectedUnit(type);
        setShowForm(true);
    }

    const handleDelete = async (id: string) => {
        const response = await deleteUnit(id);
        if (response.success){ 
            toast.success(t("SUCCESS-DELETE"));
        } else{ 
            toast.error(t("ERROR-DELETE"));
        }
        setSelectedUnit(null);
        loadUnits();
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
                <Sheet open={showForm} onOpenChange={(open) => {
                    setShowForm(open);
                    if (!open) {
                    setSelectedUnit(null);
                    reset({
                        name: "",
                        abbreviation: "",
                    });
                    }
                }} >
                    <SheetTrigger asChild>
                        <Button className="w-full md:w-fit">
                            <Plus className="mr-2 h-4 w-4" />
                            {t("ADD")}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg lg:max-w-xl overflow-y-auto p-4 sm:p-6">
                        <div>
                            <SheetTitle>
                                <div className="p-1">
                                    <h3 className="text-lg font-bold sm:text-xl">{selectUnit ?  t("EDIT-UNITS") : t("CREATE-UNITS")}</h3>
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
                                        placeholder="Libras"
                                        className={`text-sm ${errors.name ? "border-destructive" : ""}`}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm">
                                        {t("T-ABBREVIATION")} *
                                    </Label>
                                    <Input
                                        id="name"
                                        {...register("abbreviation")}
                                        placeholder="lb"
                                        className={`text-sm ${errors.name ? "border-destructive" : ""}`}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>
                                {/* Actions */}
                                <div className="flex gap-2 sm:gap-3 pt-4 border-t">
                                    <Button type="submit" className="flex-1 text-sm">
                                        <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        { selectUnit ? t("UPDATE") : t("SAVE") }
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
                <div className="block sm:hidden space-y-4 w-full">
                    {
                        filteredUnits.length === 0 ? (
                            <div className="text-center py-2 text-muted-foreground">
                                {searchTerm ? t("NO-FOUND-UNITS") : t("NO-UNITS")}
                            </div>
                        ):(
                        filteredUnits.map((unit) => (
                            <div 
                                key={unit.unit_id} 
                                className="border rounded-lg p-4 space-y-3 bg-muted hover:bg-accent cursor-pointer flex justify-between">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <h3 className="font-bold text-sm">{unit.name}</h3>
                                        <p className="text-xs text-foreground">{unit.abbreviation}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleEdit(unit)}
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
                                            onConfirm={() => {handleDelete(unit.unit_id)}}
                                    />
                                </div>
                            </div>
                        ))                    
                    )}
                </div>
                {/* Desktop Table View */}
                <div className="hidden sm:block rounded-md border overflow-x-auto">
                    <Table className="bg-card">
                    <TableHeader>
                        <TableRow className="bg-secondary">
                            <TableHead className="min-w-[150px]">{t("T-NAME")}</TableHead>
                            <TableHead className="min-w-[120px]">{t("T-ABBREVIATION")}</TableHead>
                            <TableHead className="w-[140px]">{t("T-ACTIONS")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUnits.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {searchTerm ?  t("NO-FOUND-UNITS") : t("NO-UNITS")}
                            </TableCell>
                        </TableRow>
                        ) : (
                        filteredUnits.map((unit) => (
                            <TableRow
                            key={unit.unit_id}
                            className="hover:bg-muted/50 cursor-pointer"
                            >
                            <TableCell>
                                <div className="space-y-1">
                                <div className="font-medium text-sm">{unit.name}</div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-1">
                                <div className="font-medium text-sm">{unit.abbreviation}</div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEdit(unit)}
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
                                    onConfirm={() => handleDelete(unit.unit_id)}
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
        </div>
    )
}