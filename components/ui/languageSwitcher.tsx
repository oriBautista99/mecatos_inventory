'use client'

import {useRouter, usePathname} from "next/navigation";
import {routing} from "@/i18n/routing";
import { ReactNode, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import Image from "next/image";

type Props = {
  trigger: ReactNode
  align?: 'start' | 'center' | 'end'
}

export default function LanguageSwitcher({ align, trigger }: Props) {

  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const switchLanguage = (locale: string) => {
    const segments = pathname.split("/");
    segments[1] = locale; 
    router.push(segments.join("/"));
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align || "end"}
        className="w-32 p-2"
        onClick={(e) => e.stopPropagation()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col space-y-2">
          {routing.locales.map((locale) => (
            <button
              key={locale}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
              onClick={() => {switchLanguage(locale); setOpen(false)}}
            >
              {locale == 'es' && <Image src={'/colombia.png'} alt="Español" width={16} height={16}/>}
              {locale == 'en' && <Image src={'/states-unites.png'} alt="Español" width={16} height={16}/>}
              {locale.toUpperCase()}
            </button>
          ))}
        </div>

      </PopoverContent>
    </Popover>
  );
}