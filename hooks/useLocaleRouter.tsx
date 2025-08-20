"use client";

import { useRouter, usePathname } from "next/navigation";

export function useLocaleRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  return {
    locale,
    push: (path: string) => router.push(`/${locale}${path}`),
    replace: (path: string) => router.replace(`/${locale}${path}`)
  };
}