"use client"
import { createCategory, deleteCategory, updateCategory } from "@/actions/categories";
import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { CategoriesForm } from "@/components/dashboard/inventory/categories-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Category, CategoryFormValues } from "@/types/category";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { revalidateCategories, useCategoriesSWR } from "@/hooks/useCategoriesSWR";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function CategoriesPage() {
    const t = useTranslations("CATEGORIES"); 
    // const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { categories = [], error } = useCategoriesSWR();

    if (error) {
        toast.error("Error cargando categorías");
    }

    const filteredCategories = categories.filter(
        (category) =>
        category.name && category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //   pagination
    const [page, setPage] = useState(1);
    const pageSize = 10; 
    const totalPages = Math.ceil(filteredCategories.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentData = filteredCategories.slice(startIndex, startIndex + pageSize);


  const handleSaveCategory = async (categoryData: CategoryFormValues) => {
      if (selectedCategory) {
        // Edit existing 
        const response = await updateCategory(selectedCategory, categoryData);
        if(response.success){
          toast.success(t("SUCCESS-EDIT"));
        }else{
          toast.error(t("ERROR-EDIT"));
        }
      } else {
        // Create new 
        const response = await createCategory(categoryData);
        if (response.success){ 
          toast.success(t("SUCCESS-CREATE"));
        } else{ 
          toast.error(t("ERROR-CREATE"));
        }
      }
      await revalidateCategories();
      setIsModalOpen(false);
      setSelectedCategory(null);
  }

  const handleCancel = () => {
    setSelectedCategory(null);
    setIsModalOpen(false);
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  }
  
  const handleDeleteCategory = async (id: string) => {
    const response = await deleteCategory(id);
    if (response.success){ 
      toast.success(t("SUCCESS-DELETE"));
    } else{ 
      toast.error(t("ERROR-DELETE"));
    }
    await revalidateCategories();
    setSelectedCategory(null);
  }

  return (
    <div className="overflow-y-hidden space-y-4 mx-auto px-2 sm:px-4">
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
          <div className="flex flex-col justify-start w-full">
            <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("DESCRIPTION-TITLE")}
            </p>
          </div>
          <Sheet open={isModalOpen} onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) {
                        setSelectedCategory(null);
                    }
                }}>
              <SheetTrigger asChild>
                <Button className="w-full md:w-fit">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("NEW-CATEGORY")}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg lg:max-w-xl overflow-y-auto p-4 sm:p-6">
                <CategoriesForm
                onClose={handleCancel}
                onSave={handleSaveCategory}
                category={selectedCategory}
                ></CategoriesForm>
              </SheetContent>
          </Sheet>
        </div>        

        <div className="flex flex-col space-y-4">
            <div className="flex md:flex-row gap-2 justify-start md:space-y-0 md:justify-between lg:space-x-4 2xl:justify-start">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
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
            <div className="block sm:hidden space-y-3">
                {currentData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? t("NO-FOUND-CATEGORIES") : t("NO-CATEGORIES")}
                </div>
                ) : (
                currentData.map((category) => (
                    <div
                    key={category.category_id}
                    className="border rounded-lg p-4 space-y-3 bg-card hover:bg-muted/50 cursor-pointer"
                    >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                        <h3 className="font-medium text-sm">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditCategory(category)}
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                        <ConfirmDialog
                                trigger={
                                    <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    title="Eliminar"
                                    >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                }
                                title={t("DELETE-CATEGORY")}
                                description={t("DELETE-DESCRIPTION")}
                                confirmText={t("DELETE")}
                                cancelText={t("CANCEL")}
                                onConfirm={() => handleDeleteCategory(category.category_id)}
                        />
                    </div>
                    </div>
                ))
                )}
            </div>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto space-y-2">
                <div className="md:rounded-xl md:border md:border-border shadow">
                    <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[60vh]">
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
                                    {searchTerm ?  t("NO-FOUND-CATEGORIES") : t("NO-CATEGORIES")}
                                    </TableCell>
                                </TableRow>
                                ) : (
                                currentData.map((category) => (
                                    <TableRow
                                    key={category.category_id}
                                    className="hover:bg-muted/50 cursor-pointer"
                                    >
                                    <TableCell>
                                        <div className="space-y-1">
                                        <div className="font-medium text-sm">{category.name}</div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1">
                                        <div className="font-medium text-sm">{category.description}</div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleEditCategory(category)}
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
                                            title={t("DELETE-CATEGORY")}
                                            description={t("DELETE-DESCRIPTION")}
                                            confirmText={t("DELETE")}
                                            cancelText={t("CANCEL")}
                                            onConfirm={() => handleDeleteCategory(category.category_id)}
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