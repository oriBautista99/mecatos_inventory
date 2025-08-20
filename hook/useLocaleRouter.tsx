"use client";

import { useRouter, usePathname } from "next/navigation";

export function useLocaleRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1]; // primer segmento de la URL

  const push = (path: string) => {
    router.push(`/${locale}${path}`);
  };

  return { push, locale };
}