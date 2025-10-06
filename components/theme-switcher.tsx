"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";


type Props = {
  trigger: ReactNode
  align?: 'start' | 'center' | 'end'
}

const ThemeSwitcher = ({ align, trigger }: Props) => {

  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <Popover  open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align || "end"}
        className="w-40 p-2"
        onClick={(e) => e.stopPropagation()} // 🔹 evita que se cierre al hacer clic dentro
        onInteractOutside={(e) => e.preventDefault()}
      >
        <button
          onClick={() => {setTheme("light"); setOpen(false)}}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
        >
          <Sun size={ICON_SIZE} className="text-muted-foreground" />
          <span className="text-sm">Light</span>
        </button>

        <button
          onClick={() => {setTheme("dark"); setOpen(false)}}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
        >
          <Moon size={ICON_SIZE} className="text-muted-foreground" />
          <span className="text-sm">Dark</span>
        </button>

        <button
          onClick={() => {setTheme("system"); setOpen(false)}}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
        >
          <Laptop size={ICON_SIZE} className="text-muted-foreground" />
          <span className="text-sm">System</span>
        </button>
      </PopoverContent>
    </Popover>
  );
};

export { ThemeSwitcher };
