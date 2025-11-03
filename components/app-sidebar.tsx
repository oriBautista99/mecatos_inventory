"use client"

import type * as React from "react"
import {
  ChartArea,
  ClipboardList,
  FolderCog,
  GalleryVerticalEnd,
  ShoppingCart,
  Truck,
  UsersRound,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { useProfileLoginSWR } from "@/hooks/useUserLogin"

// This is sample data.
const data = {
  teams: [
    {
      name: "Mecatos Bakery & Cafe",
      logo: GalleryVerticalEnd,
      plan: "Hoffner",
    }
  ],
  navMain: [
    {
      title: "ORDERS",
      url: "orders",
      icon: ShoppingCart,
      isActive: true,
      items: [
        {
          title: "PURCHASE_ORDERS",
          url: "purchase",
        },
        {
          title: "ORDER_RECEIVING",
          url: "receiving",
        }
      ],
    },
    {
      title: "INVENTORY",
      url: "inventory",
      icon: ClipboardList,
      items: [
        {
          title: "INVENTORY_ITEMS",
          url: "items",
        },        
        {
          title: "STORAGE_AREAS",
          url: "storage_areas",
        },
        {
          title: "INVENTORY_COUNT",
          url: "count",
        },
        {
          title: "WASTE",
          url: "waste",
        },
        {
          title: "CATEGORIES",
          url: "categories",
        },
        {
          title: "EXPIRATION ALERTS",
          url: "alerts",
        },
        {
          title: "AUDIT",
          url: "audit",
        },
        // {
        //   title: "MENU",
        //   url: "menu",
        // },
        {
          title: "PRODUCTION_EVENTS",
          url: "production_event",
        },
        // {
        //   title: "SALESINVENTORY",
        //   url: "sales",
        // },
      ],
    },
    {
      title: "REPORTS",
      url: "reports",
      icon: ChartArea,
      items: [
        // {
        //   title: "SALES",
        //   url: "sales",
        // },
        {
          title: "PRODUCTION",
          url: "production",
        },
        {
          title: "WASTE",
          url: "waste",
        }
      ],
    },
    {
      title: "SUPPLIERS",
      url: "suppliers",
      icon: Truck,
    },
  ],
  projects: [
    {
      name: "USERS",
      url: "users",
      icon: UsersRound,
    },
    {
      name: "SETTINGS",
      url: "settings",
      icon: FolderCog,
    },
  ],
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterMenuByPermissions(menu: any[], userPermissions: string[]) {
  return menu
    .map((section) => {
      if (section.items) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filteredItems = section.items.filter((item:any) =>
          userPermissions.includes(item.title)
        )

        if (userPermissions.includes(section.title) || filteredItems.length > 0) {
          return { ...section, items: filteredItems }
        }

        return null
      }

      // Si es un ítem sin submenú
      return userPermissions.includes(section.title) ? section : null
    })
    .filter(Boolean)
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const {profile, isLoading} = useProfileLoginSWR(); 

  if (isLoading) return null

   const userPermissions =
   
    profile?.roles?.role_permissions?.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rp: any) => rp.permissions?.name
    ) || []

  const isAdmin = profile?.roles?.name === "Administrador"

  const filteredNavMain = isAdmin
    ? data.navMain
    : filterMenuByPermissions(data.navMain, userPermissions)

  const filteredProjects = isAdmin
    ? data.projects
    : filterMenuByPermissions(data.projects, userPermissions)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-4">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        {
          filteredProjects.length > 0 &&
          <NavProjects projects={filteredProjects} />
        }
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export const userData = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}
