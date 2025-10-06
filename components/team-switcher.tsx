"use client"

import type * as React from "react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const activeTeam = teams[0]
  const pathname = usePathname(); 
  const basePath = pathname.split("/").slice(0, 3).join("/"); 
  const router = useRouter();

  //redirect for row
  const handleRowClick = () => {
    router.push(`${basePath}`);
  };

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-pointer" onClick={() => handleRowClick()}>
          <div className="flex aspect-square size-8 items-center justify-center rounded-full">
            <Image width={30} height={30} src="/mecatos-logo.png" alt="logo-mecatos" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{activeTeam.name}</span>
            <span className="truncate text-xs">{activeTeam.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
