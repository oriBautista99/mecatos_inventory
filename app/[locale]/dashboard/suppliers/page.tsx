"use client"

import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from "@/actions/suppliers";
import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { SupplierForm } from "@/components/dashboard/suppliers/supplier-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Supplier, SupplierFormValues } from "@/types/suppliers";
import { Edit, Mail, MapPin, Phone, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const t = useTranslations("SUPPLIERS"); 
  

  async function loadSuppliers() {
    const {data, error} = await getSuppliers();
    if(data) {
      setSuppliers(data);
    }else{
      toast.error(error);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, [])

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  
  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  }

  const handleDeleteSupplier = async (id: string) => {
    const response = await deleteSupplier(id);
    if (response.success){ 
      toast.success(t("SUCCESS-DELETE"));
    } else{ 
      toast.error(t("ERROR-DELETE"));
    }
    await loadSuppliers();
    setSelectedSupplier(null);
  }

  const handleSaveSupplier = async (supplierData: SupplierFormValues) => {

    if (selectedSupplier) {
      // Edit existing
      const response = await updateSupplier(selectedSupplier, supplierData);
      if(response.success){
        toast.success(t("SUCCESS-EDIT"));
      }else{
        toast.error(t("ERROR-EDIT"));
      }
    } else {
      // Create new 
      const response = await createSupplier(supplierData);
      if (response.success){ 
        toast.success(t("SUCCESS-CREATE"));
      } else{ 
        toast.error(t("ERROR-CREATE"));
      }
    }
    await loadSuppliers();
    setIsModalOpen(false);
    setSelectedSupplier(null);
  }

  const handleCancel = () => {
    setSelectedSupplier(null);
    setIsModalOpen(false);
  }


  const formatFrequency = (frequency: string[]) => {
    if (frequency.length === 0) return "No definido"
    if (frequency.length === 7) return "Diario"
    return frequency.join(", ")
  }

  return (
    <div  className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div  className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
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
                  {t("NEW-SUPPLIER")}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg lg:max-w-xl overflow-y-auto p-4 sm:p-6">
                <SupplierForm
                onClose={handleCancel}
                onSave={handleSaveSupplier}
                supplier={selectedSupplier}
                ></SupplierForm>
              </SheetContent>
          </Sheet>
        </div>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">{t("LIST-SUPPLIERS")}</CardTitle>
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
                {filteredSuppliers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? t("NO-FOUND-SUPPLIERS") : t("NO-SUPPLIERS")}
                  </div>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <div
                      key={supplier.supplier_id}
                      className="border rounded-lg p-4 space-y-3 bg-card hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-medium text-sm">{supplier.company_name}</h3>
                          <p className="text-xs text-muted-foreground">{supplier.contact_name}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{supplier.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">{supplier.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditSupplier(supplier)}
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
                              onConfirm={() => handleDeleteSupplier(supplier.supplier_id)}
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
                      <TableHead className="min-w-[150px]">{t("T-COMPANY")}</TableHead>
                      <TableHead className="min-w-[120px]">{t("T-CONTACT")}</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[200px]">{t("T-INFORMATION")}</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[120px]">{t("T-FRECUENCY")}</TableHead>
                      <TableHead className="w-[140px]">{t("T-ACTIONS")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm ?  t("NO-FOUND-SUPPLIERS") : t("NO-SUPPLIERS")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSuppliers.map((supplier) => (
                        <TableRow
                          key={supplier.supplier_id}
                          className="hover:bg-muted/50 cursor-pointer"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{supplier.company_name}</div>
                              <div className="text-xs text-muted-foreground">ID: {supplier.supplier_id}</div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{supplier.contact_name}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground md:hidden">
                                <Phone className="h-3 w-3" />
                                {supplier.phone}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {supplier.phone}
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate max-w-[150px]">{supplier.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate max-w-[150px]">{supplier.address}</span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden lg:table-cell">
                            <div className="text-xs">{formatFrequency(supplier.frecuency)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditSupplier(supplier)}
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
                                onConfirm={() => handleDeleteSupplier(supplier.supplier_id)}
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