"use client"

import { useEffect, useState } from "react";
import { SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { useTranslations } from "next-intl";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Eye, EyeOff, Mail, Save, User, X } from "lucide-react";
import { Button } from "../ui/button";
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUserSchema, updateUserSchema, UserFormData } from "@/types/user";
import { Separator } from "@/components/ui/separator";
import { RolesUser } from "@/types/roles";
import { toast } from "sonner";
import { getRoles } from "@/actions/roles";

interface UserFormProps {
  defaultValues ?: UserFormData;
  mode: "create" | "edit"
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
}

export function UserForm({ defaultValues, mode, onSubmit, onCancel }: UserFormProps){

    const [showPin, setShowPin] = useState(false)
    const t = useTranslations("USER-FORM"); 
    const [roles, setRoles] = useState<RolesUser[]>([]);

    const { register, handleSubmit, formState:{errors}, control } = useForm<UserFormData>({
      resolver: zodResolver(mode === "create" ? createUserSchema : updateUserSchema),
      defaultValues: defaultValues ? {...defaultValues, pin_hash: undefined} : { username: "", email: "", pin_hash: "", role: 3 }
    });

    async function loadRoles() {
      const {data, error} = await getRoles();
      if(data) {
          setRoles(data);
      }else{
          toast.error(error);
      }
    }

    useEffect(() => {
        loadRoles();
    }, [])

    return(
        <div>
            <SheetHeader className="space-y-2 sm:space-y-3 mb-3">
              <SheetTitle  className="flex items-center gap-2 text-lg sm:text-xl">
                  <User className="h-4 w-4 sm:h-5 sm:w-5"/>
                  {mode === "edit" ? t("EDIT-TITLE") : t("CREATE-TITLE")}
              </SheetTitle>
              <SheetDescription className="text-sm">
                  {mode === "edit"
                      ? t("DESCRIPTION-EDIT")
                      : t("DESCRIPTION-CREATE")}
                  </SheetDescription>
              </SheetHeader>
            <Separator />
              
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">
                  {t("USERNAME-INPUT")} *
                </Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder={t("USERNAME-PLACEHOLDER")}
                  className={`text-sm ${errors.username ? "border-destructive" : ""}`}
                />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  {t("EMAIL-INPUT")} *
                </Label>
                <div className="relative">
                  <Mail  className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground"/>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")} 
                    placeholder={t("EMAIL-PLACEHOLDER")}
                    className={`pl-9 sm:pl-10 text-sm ${errors.email ? "border-destructive" : ""}`}
                  />                
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm">
                  {t("PIN-INPUT")} *
                </Label>
                <div className="relative">
                  <Input
                    id="pin_hash"
                    type={showPin ? "text" : "password"}
                    {...register("pin_hash")}
                    placeholder={t("PIN-PLACEHOLDER")}
                    className="h-11 pr-10"
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  {t("ROLE-INPUT")} *
                </Label>
                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={t("ROLE-PLACEHOLDER")} />
                        </SelectTrigger>
                        <SelectContent>
                          {
                            roles.map((rol) => (
                              <SelectItem key={rol.role_id} value={String(rol.role_id)}>
                                {rol.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                <Button type="submit" className="flex-1 text-sm">
                  <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {mode === "edit" ? t("UPDATE-USER") : t("CREATE-USER")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 sm:flex-none text-sm bg-transparent"
                >
                  <X className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {t("CANCEL")}
                </Button>
              </div>
          </form>
        </div>

    );
}