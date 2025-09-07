"use client";

import { createUser, getUsers, updateUser } from "@/actions/users";
import { UserForm } from "@/components/dashboard/user-form";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Profile, UserFormData } from "@/types/user";
import { Avatar } from "@radix-ui/react-avatar";
import { Edit, Plus, Search, Trash2, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";


export default function Page() {

  const [users, setUsers] = useState<Profile[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const t = useTranslations("USERS"); 
  const [selectUser, setSelectedUser] = useState<Profile | null>(null);

  async function loadUsers() {
    const list = await getUsers();
    setUsers(list);
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
    //e.preventDefault();
    if(selectUser){
      await updateUser(selectUser, data);
    }else{
      await createUser(data);
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

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.profile_id !== userId))
  }

  const handleCancel = () => {
    setSelectedUser(null);
    setIsSheetOpen(false);
  }


  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('TITLE')}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">{t('DESCRIPTION-TITLE')}</p>
            </div>
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
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">{t('SUB-TITLE')}</CardTitle>
            <CardDescription className="text-sm">{t('DESCRIPTION-SUBTITLE')}</CardDescription>
          </CardHeader>
          <CardContent  className="p-0 sm:p-6 sm:pt-0">
            <div className="space-y-4 p-4 sm:p-0">
              {/* Search Bar */}
              <div  className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("SEARCH")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg">
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">{t('T-USER')}</TableHead>
                        <TableHead>{t('T-EMAIL')}</TableHead>
                        <TableHead>{t('T-ROL')}</TableHead>
                        <TableHead>{t('T-STATUS')}</TableHead>
                        <TableHead>{t('T-REGISTER')}</TableHead>
                        <TableHead className="text-right pr-6">{t('T-ACTIONS')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
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
                          <TableCell className="text-muted-foreground">{user.created_at}</TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.profile_id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden p-4 space-y-4">
                  {filteredUsers.map((user) => (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteUser(user.profile_id)
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">{t("NO-USERS")}</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? t("NO-USERS-MESSAGE") : t("CREATE-USERS")}
                    </p>
                  </div>
                )}
              </div>                
            </div>
          </CardContent>
        </Card>


      

      </div>    
    </div>
  );
}