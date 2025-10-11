"use client";

import { createUser, deleteUser, getUsers, updateUser } from "@/actions/users";
import { ConfirmDialog } from "@/components/confirm-delete-dialog";
import { UserForm } from "@/components/dashboard/user-form";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Profile, UserFormData } from "@/types/user";
import { Avatar } from "@radix-ui/react-avatar";
import { Edit, Plus, Search, Trash2, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";


export default function UsersView() {

  const [users, setUsers] = useState<Profile[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const t = useTranslations("USERS"); 
  const [selectUser, setSelectedUser] = useState<Profile | null>(null);

  async function loadUsers() {
    const {data, error} = await getUsers();
    if(data) {
      setUsers(data);
    }else{
      toast.error(error);
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  
    //   pagination
    const [page, setPage] = useState(1);
    const pageSize = 10; 
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentData = filteredUsers.slice(startIndex, startIndex + pageSize);

  const getRoleColor = (role: Profile["role"]) => {
    switch (role) {
      case 1:
        return "bg-red-100 text-red-800"
      case 2:
        return "bg-yellow-100 text-yellow-800"
      case 3:
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSubmit = async (data: UserFormData) => {
    if(selectUser){
      const response = await updateUser(selectUser, data);
      if(response.success){
        toast.success(t("SUCCESS-EDIT"));
      }else{
        toast.error(t("ERROR-EDIT"));
      }
    }else{
      const response = await createUser(data);
      if (response.success){ 
        toast.success(t("SUCCESS-CREATE"));
      } else{ 
        toast.error(t("ERROR-CREATE"));
      }
    }
    await loadUsers();
    setIsSheetOpen(false);
    setSelectedUser(null);
  }

  const getStatusColor = (status: Profile["is_active"]) => {
    return status
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  }

  const handleDeleteUser = async (user: Profile) => {
    const response = await deleteUser(user);
    if (response.success){ 
      toast.success(t("SUCCESS-DELETE"));
    } else{ 
      toast.error(t("ERROR-DELETE"));
    }
    await loadUsers();
    setSelectedUser(null);
  }

  const handleCancel = () => {
    setSelectedUser(null);
    setIsSheetOpen(false);
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
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                <Button className="w-full sm:w-fit" onClick={() => setSelectedUser(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("NEW-USER")}
                </Button>              
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg lg:max-w-xl overflow-y-auto p-4 sm:p-6">
                    <UserForm
                        defaultValues={selectUser ?? undefined}
                        mode={selectUser ? "edit" : "create"}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    ></UserForm>
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
            <div className="md:hidden p-4 space-y-4">
                {currentData.map((user) => (
                <Card key={user.profile_id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEditUser(user)}>
                    <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                            {user.username
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{user.username}</h3>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                            <Badge className={getRoleColor(user.role)}>
                                {user.role ===  1 ? t("ADMIN"): user.role === 2 ? t("MANAGER") : t("EMPLOYEE")}
                            </Badge>
                            <Badge className={getStatusColor(user.is_active)}>
                                {user.is_active  ? t("ACTIVE"): t("INACTIVE")}
                            </Badge>
                            </div>
                        </div>
                        </div>
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
                            onConfirm={() => handleDeleteUser(user)}
                        />
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>  
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto space-y-2">
                <div className="md:rounded-xl md:border md:border-border shadow">
                    <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[60vh]">
                        <Table className="bg-card">
                            <TableHeader>
                            <TableRow className="bg-secondary">
                                <TableHead className="pl-6">{t('T-USER')}</TableHead>
                                <TableHead>{t('T-EMAIL')}</TableHead>
                                <TableHead>{t('T-ROL')}</TableHead>
                                <TableHead>{t('T-STATUS')}</TableHead>
                                <TableHead>{t('T-REGISTER')}</TableHead>
                                <TableHead className="text-right pr-6">{t('T-ACTIONS')}</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {currentData.map((user) => (
                                <TableRow key={user.username} className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="pl-6">
                                    <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                        <AvatarFallback>
                                        {user.username
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{user.username}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                <TableCell>
                                    <Badge className={getRoleColor(user.role)}>
                                    {user.role === 1 ? t("ADMIN") : user.role === 2 ? t("MANAGER") : t("EMPLOYEE")}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(user.is_active)}>
                                    {user.is_active ? t("ACTIVE") : t("INACTIVE")}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{user.created_at && new Date(user.created_at).toLocaleString()}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                        <Edit className="w-4 h-4" />
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
                                        onConfirm={() => handleDeleteUser(user)}
                                    />
                                    </div>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>                        
                    </div>
                </div>
            </div>          
            {currentData.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">{t("NO-USERS")}</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? t("NO-USERS-MESSAGE") : t("CREATE-USERS")}
                    </p>
                  </div>
            )}
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
    </div>
  );
}