"use client"

import { useState } from "react";
import { SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { useTranslations } from "next-intl";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUserSchema, updateUserSchema, UserFormData } from "@/types/user";
import { Role } from "@/types/roles";

interface UserFormProps {
  defaultValues ?: UserFormData;
  mode: "create" | "edit"
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
}

export function UserForm({ defaultValues, mode, onSubmit, onCancel }: UserFormProps){

    const [showPin, setShowPin] = useState(false)
    const t = useTranslations("USER-FORM"); 

    const { register, handleSubmit, formState:{errors}, control } = useForm<UserFormData>({
      resolver: zodResolver(mode === "create" ? createUserSchema : updateUserSchema),
      defaultValues: defaultValues ? {...defaultValues, pin_hash: undefined} : { username: "", email: "", pin_hash: "", role: 3 }
    });

    return(
        <div>
            <div className="p-6 border-b border-border">
                <SheetHeader>
                    <SheetTitle className="text-xl font-semibold">
                        {mode === "edit" ? t("EDIT-TITLE") : t("CREATE-TITLE")}
                    </SheetTitle>
                <SheetDescription className="text-base">
                    {mode === "edit"
                        ? t("DESCRIPTION-EDIT")
                        : t("DESCRIPTION-CREATE")}
                    </SheetDescription>
                </SheetHeader>
            </div>         
            <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)}  className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-medium">
                        {t("USERNAME-INPUT")}
                      </Label>
                      <Input
                        id="username"
                        {...register("username")}
                        placeholder={t("USERNAME-PLACEHOLDER")}
                        className="h-11"
                      />
                      {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-medium">
                        {t("EMAIL-INPUT")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")} 
                        placeholder={t("EMAIL-PLACEHOLDER")}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="pin" className="text-sm font-medium">
                        {t("PIN-INPUT")}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="role" className="text-sm font-medium">
                          {t("ROLE-INPUT")}
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
                                <SelectItem value={Role.employer.toString()}>{t("EMPLOYEE")}</SelectItem>
                                <SelectItem value={Role.manager.toString()}>{t("MANAGER")}</SelectItem>
                                <SelectItem value={Role.admin.toString()}>{t("ADMIN")}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                     <div className="flex gap-3 pt-6 border-t border-border">
                      <Button type="submit" className="flex-1 h-11">
                        {mode === "edit" ? t("UPDATE-USER") : t("CREATE-USER")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1 h-11"
                      >
                        {t("CANCEL")}
                      </Button>
                    </div>
                </form>
            </div>
        </div>

    );
}