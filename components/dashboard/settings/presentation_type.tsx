"use client"

import { getTypePresentation } from "@/actions/type_presentation";
import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TypePresentation } from "@/types/type_presentation";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PresentationType(){

    const [searchTerm, setSearchTerm] = useState("");
    // const t = useTranslations("TYPE_PRESENTATIONS"); 
    const [types, setTypes] = useState<TypePresentation[]>([]);
    // const {
    //     register,
    //     handleSubmit,
    //     formState: { errors },
    //     reset,
    //     } = useForm<TypePresentationFormValues>({
    //     resolver: zodResolver(TypePresentationSchema),
    //     defaultValues: {
    //         name: "",
    //         description: "",
    //         conversion_factor: 1,
    //         unit: ""
    //     },
    // });

    async function loadTypes() {
        const {data, error} = await getTypePresentation();
        console.log(data)
        if(data) {
            setTypes(data);
        }else{
            toast.error(error);
        }
    }

    useEffect(() => {
        loadTypes();
    }, [])

    const filteredUnits = types.filter(
        (type) =>
            type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );

     //   pagination
    const [page, setPage] = useState(1);
    const pageSize = 5; 
    const totalPages = Math.ceil(filteredUnits.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentData = filteredUnits.slice(startIndex, startIndex + pageSize);


    return(
        <div className="overflow-y-hidden space-y-4 mx-auto ">
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                <div className="flex flex-col justify-start w-full">
                    <h1 className="text-2xl font-bold tracking-tight">Tipos de Presentaciones</h1>
                    <p className="text-sm text-muted-foreground tracking-tight">
                        Gestion de tipos de presentación de los productos del inventario
                    </p>
                </div>
                <Button className="w-full md:w-fit">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo tipo
                </Button>
            </div>
            <div className="space-y-4 w-full">
                <div className="flex md:flex-row gap-2 justify-start md:space-y-0 md:justify-between lg:space-x-4 2xl:justify-start">
                    <div className="relative flex-1 max-w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={"Buscar tipo..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                {/* Desktop Table View */}
                <div className="hidden sm:block rounded-md border overflow-x-auto">
                    <Table className="bg-card">
                        <TableHeader>
                            <TableRow className="bg-secondary">
                                <TableHead className="min-w-[150px]">Nombre</TableHead>
                                <TableHead className="min-w-[120px]">Descripción</TableHead>
                                <TableHead className="min-w-[120px]">Factor de Converción</TableHead>
                                <TableHead className="min-w-[120px]">Unidad</TableHead>
                                <TableHead className="w-[140px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                
                                </TableCell>
                            </TableRow>
                            ) : (
                            currentData.map((unit) => (
                                <TableRow
                                key={unit.presentation_type_id}
                                className="hover:bg-muted/50 cursor-pointer"
                                >
                                <TableCell>
                                    <div className="space-y-1">
                                    <div className="font-medium text-sm">{unit.name}</div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1">
                                    <div className="font-medium text-sm">{unit.description}</div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1">
                                    <div className="font-medium text-sm">{unit.conversion_factor}</div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1">
                                    <div className="font-medium text-sm">{unit.unit}</div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => {}}
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
                                        title={""}
                                        description={""}
                                        confirmText={""}
                                        cancelText={""}
                                        onConfirm={() => {}}
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