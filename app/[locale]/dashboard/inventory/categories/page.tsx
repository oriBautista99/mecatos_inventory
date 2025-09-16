"use client"
import { createCategory, deleteCategory, updateCategory } from "@/actions/categories";
import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { CategoriesForm } from "@/components/dashboard/inventory/categories-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Category, CategoryFormValues } from "@/types/category";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { revalidateCategories, useCategoriesSWR } from "@/hooks/useCategoriesSWR";

export default function Page() {

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
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t("TITLE")}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("DESCRIPTION-TITLE")}
            </p>
          </div>
          <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
              <SheetTrigger asChild>
                <Button className="w-full sm:w-fit">
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
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">{t("LIST-CATEGORIES")}</CardTitle>
            <CardDescription className="text-sm">
              {t("DESCRIPTION-LIST")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="space-y-4 p-4 sm:p-0">
              {/* Search Bar */}
              <div className="flex items-center space-x-2">
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
              <div className="block sm:hidden space-y-3">
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? t("NO-FOUND-CATEGORIES") : t("NO-CATEGORIES")}
                  </div>
                ) : (
                  filteredCategories.map((category) => (
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
                    {filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm ?  t("NO-FOUND-CATEGORIES") : t("NO-CATEGORIES")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}