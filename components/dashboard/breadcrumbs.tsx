"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations("ROUTES");

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];
  const routeSegments = segments.slice(1);
  
  return (
    <Breadcrumb>
      <BreadcrumbList>
    {routeSegments.map((segment, index) => {
      const href = `/${locale}/` + routeSegments.slice(0, index+1).join("/");
      const isLast = index === routeSegments.length - 1;
      return (
        <React.Fragment key={href}>
          <BreadcrumbItem>
            {!isLast ? (
              <BreadcrumbLink asChild>
                <Link href={href}>{t(segment) || segment}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{t(segment) || segment}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {!isLast && <BreadcrumbSeparator />}
        </React.Fragment>
      );
    })}
  </BreadcrumbList>
    </Breadcrumb>
  );
}