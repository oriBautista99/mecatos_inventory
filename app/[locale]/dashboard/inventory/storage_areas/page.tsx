"use client"

import { createArea, deleteArea, getAreas, updateArea } from "@/actions/storage_areas";
import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { StorageAreasForm } from "@/components/dashboard/inventory/storage-areas-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaStorageFormValues, Storage_area } from "@/types/storage_area";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {

  const t = useTranslations("STORAGE-AREAS"); 
  const [areas, setAreas] = useState<Storage_area[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Storage_area | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  async function loadStorageAreas() {
    const {data, error} = await getAreas();
    if(data) {
      setAreas(data);
    }else{
      toast.error(error);
    }
  }
  
  useEffect(() => {
    loadStorageAreas();
  }, [])

  const filteredAreas = areas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveSupplier = async (areaData: AreaStorageFormValues) => {
      if (selectedArea) {
        // Edit existing 
        const response = await updateArea(selectedArea, areaData);
        if(response.success){
          toast.success(t("SUCCESS-EDIT"));
        }else{
          toast.error(t("ERROR-EDIT"));
        }
      } else {
        // Create new 
        const response = await createArea(areaData);
        if (response.success){ 
          toast.success(t("SUCCESS-CREATE"));
        } else{ 
          toast.error(t("ERROR-CREATE"));
        }
      }
      await loadStorageAreas();
      setIsModalOpen(false);
      setSelectedArea(null);
  }
  
  const handleCancel = () => {
    setSelectedArea(null);
    setIsModalOpen(false);
  }

  const handleEditArea = (area: Storage_area) => {
    setSelectedArea(area);
    setIsModalOpen(true);
  }
  
  const handleDeleteArea = async (id: string) => {
    const response = await deleteArea(id);
    if (response.success){ 
      toast.success(t("SUCCESS-DELETE"));
    } else{ 
      toast.error(t("ERROR-DELETE"));
    }
    await loadStorageAreas();
    setSelectedArea(null);
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
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
                  {t("NEW-AREA")}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg lg:max-w-xl overflow-y-auto p-4 sm:p-6">
                <StorageAreasForm
                onClose={handleCancel}
                onSave={handleSaveSupplier}
                area={selectedArea}
                ></StorageAreasForm>
              </SheetContent>
          </Sheet>
        </div>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">{t("LIST-AREAS")}</CardTitle>
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
                {filteredAreas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? t("NO-FOUND-AREAS") : t("NO-AREAS")}
                  </div>
                ) : (
                  filteredAreas.map((area) => (
                    <div
                      key={area.storage_area_id}
                      className="border rounded-lg p-4 space-y-3 bg-card hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-medium text-sm">{area.name}</h3>
                          <p className="text-xs text-muted-foreground">{area.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditArea(area)}
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
                                title={t("DELETE-AREA")}
                                description={t("DELETE-DESCRIPTION")}
                                confirmText={t("DELETE")}
                                cancelText={t("CANCEL")}
                                onConfirm={() => handleDeleteArea(area.storage_area_id)}
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
                    {filteredAreas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm ?  t("NO-FOUND-AREAS") : t("NO-AREAS")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAreas.map((area) => (
                        <TableRow
                          key={area.storage_area_id}
                          className="hover:bg-muted/50 cursor-pointer"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{area.name}</div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{area.description}</div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditArea(area)}
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
                                title={t("DELETE-AREA")}
                                description={t("DELETE-DESCRIPTION")}
                                confirmText={t("DELETE")}
                                cancelText={t("CANCEL")}
                                onConfirm={() => handleDeleteArea(area.storage_area_id)}
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