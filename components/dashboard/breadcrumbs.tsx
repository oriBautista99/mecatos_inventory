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
      <BreadcrumbList  className="gap-2 text-sm text-muted-foreground">
        {routeSegments.map((segment, index) => {
          const href = `/${locale}/` + routeSegments.slice(0, index+1).join("/");
          const isLast = index === routeSegments.length - 1;
          const label = t.has(segment) ? t(segment) : segment;
          return (
            <React.Fragment key={href}>
              <BreadcrumbItem className="hidden md:block">
                {!isLast ? (
                  <BreadcrumbLink asChild className="hover:text-primary transition-colors group">
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-semibold text-foreground" >{label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast &&  <BreadcrumbSeparator className="mx-2 opacity-50 hidden md:block">/</BreadcrumbSeparator>}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}