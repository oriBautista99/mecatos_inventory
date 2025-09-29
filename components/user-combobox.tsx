"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Profile } from "@/types/user";
import { useTranslations } from "next-intl";

type UserComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  users: Profile[];
};

export function UserCombobox({ value, onChange, users }: UserComboboxProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("USER-COMBOBOX");
  const selectedUser = users.find((u) => String(u.profile_id) === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedUser ? selectedUser.username : t("SELECT")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={t("SEARCH")} className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.profile_id}
                  value={String(user.profile_id)}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {user.username}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === String(user.profile_id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
