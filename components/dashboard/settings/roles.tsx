"use client"

import { createRole, deleteRole, getPermissions, getRolePermissions, getRoles, updateRole } from "@/actions/roles";
import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Permission, RolesFormValues, RolesSchema, RolesUser } from "@/types/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Roles(){

    const [searchTerm, setSearchTerm] = useState("");
    const [selectRole, setSelectedRole] = useState<RolesUser | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const t = useTranslations("ROLES"); 
    const [roles, setRoles] = useState<RolesUser[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        } = useForm<RolesFormValues>({
        resolver: zodResolver(RolesSchema),
        defaultValues: {
            name: "",
            description: ""
        },
    });

    async function loadRoles() {
        const {data, error} = await getRoles();
        if(data) {
            setRoles(data);
        }else{
            toast.error(error);
        }
    }

    async function loadPermissions() {
        const { data, error } = await getPermissions();
        if (data) {
            setPermissions(data);
        } else {
            toast.error(error);
        }
    }

    useEffect(() => {
        loadRoles();
        loadPermissions();
    }, [])

    
    useEffect(() => {
        async function loadSelectedPermissions() {
            if (selectRole) {
            reset({
                name: selectRole.name,
                description: selectRole.description,
            });

            // cargar permisos del rol seleccionado
            const { data, error } = await getRolePermissions(Number(selectRole.role_id));
            if (data) {
                const permissionIds = data.map((d: { permission_id: number }) => d.permission_id);
                setSelectedPermissions(permissionIds);
            } else {
                toast.error(error);
            }
            } else {
            reset({
                name: "",
                description: "",
            });
            setSelectedPermissions([]);
            }
        }

        loadSelectedPermissions();
    }, [selectRole, reset])

    const filteredRoles = roles.filter(
        (type) =>
            type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleSave = async (formData: RolesFormValues) => {
        const payload = {
            ...formData,
            permissions: selectedPermissions,
        };

        if (selectRole) {
            const response = await updateRole(selectRole, payload);
            if(response.success){
                toast.success(t("SUCCESS-EDIT"));
            }else{
                toast.error(t("ERROR-EDIT"));
            }
        } else {
            // Create new 
            const response = await createRole(payload);

            if (response.success){ 
                toast.success(t("SUCCESS-CREATE"));
                loadRoles();
            } else{ 
                toast.error(t("ERROR-CREATE"));
            }
        }

        setShowForm(false);
        setSelectedRole(null); 
        setSelectedPermissions([]);
    }

    
    const handleCancel = () => {
        setSelectedRole(null);
        setShowForm(false);
        setSelectedPermissions([]);
    }

    const handleEdit = (type: RolesUser) => {
        setSelectedRole(type);
        setShowForm(true);
    }

    const handleDelete = async (id: string) => {
        const response = await deleteRole(id);
        if (response.success){ 
            toast.success(t("SUCCESS-DELETE"));
        } else{ 
            toast.error(t("ERROR-DELETE"));
        }
        setSelectedRole(null);
        loadRoles();
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
                    // Cuando se cierra, limpiar todo
                    setSelectedRole(null);
                    setSelectedPermissions([]);
                    reset({
                        name: "",
                        description: "",
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
                                    <h3 className="text-lg font-bold sm:text-xl">{selectRole ?  t("EDIT-ROLES") : t("CREATE-ROLES")}</h3>
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
                                <Separator />
                                <div className="space-y-2">
                                <Label className="text-sm">Permisos</Label>
                                <ul className="flex w-full flex-col divide-y rounded-md border">
                                    {permissions.map((perm) => (
                                    <li key={perm.permission_id}>
                                        <Label
                                        htmlFor={`perm-${perm.permission_id}`}
                                        className="flex items-center justify-between gap-2 px-5 py-3"
                                        >
                                        <span className="flex items-center gap-2 text-sm">
                                            {perm.name}
                                        </span>
                                        <Checkbox
                                            id={`perm-${perm.permission_id}`}
                                            checked={selectedPermissions.includes(Number(perm.permission_id))}
                                            onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedPermissions([...selectedPermissions, Number(perm.permission_id)]);
                                            } else {
                                                setSelectedPermissions(
                                                selectedPermissions.filter((id) => id !== Number(perm.permission_id))
                                                );
                                            }
                                            }}
                                        />
                                        </Label>
                                    </li>
                                    ))}
                                </ul>
                                </div>
                                {/* Actions */}
                                <div className="flex gap-2 sm:gap-3 pt-4 border-t">
                                    <Button type="submit" className="flex-1 text-sm">
                                        <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        { selectRole ? t("UPDATE") : t("SAVE") }
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
                        filteredRoles.length === 0 ? (
                            <div className="text-center py-2 text-muted-foreground">
                                {searchTerm ? t("NO-FOUND-TYPES") : t("NO-TYPES")}
                            </div>
                        ):(
                        filteredRoles.map((role) => (
                            <div 
                                key={role.role_id} 
                                className="border rounded-lg p-4 space-y-3 bg-muted hover:bg-accent cursor-pointer flex justify-between">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <h3 className="font-bold text-sm">{role.name}</h3>
                                        <p className="text-xs text-foreground">{role.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleEdit(role)}
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
                                            onConfirm={() => {handleDelete(role.role_id)}}
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
                            <TableHead className="min-w-[120px]">{t("T-DESCRIPTION")}</TableHead>
                            <TableHead className="w-[140px]">{t("T-ACTIONS")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRoles.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {searchTerm ?  t("NO-FOUND-TYPES") : t("NO-TYPES")}
                            </TableCell>
                        </TableRow>
                        ) : (
                        filteredRoles.map((role) => (
                            <TableRow
                            key={role.role_id}
                            className="hover:bg-muted/50 cursor-pointer"
                            >
                            <TableCell>
                                <div className="space-y-1">
                                <div className="font-medium text-sm">{role.name}</div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-1">
                                <div className="font-medium text-sm">{role.description}</div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEdit(role)}
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
                                    onConfirm={() => handleDelete(role.role_id)}
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
    );
}