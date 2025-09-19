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

// This is sample data.
const data = {
  teams: [
    {
      name: "Mecatos",
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
        },
        {
          title: "ORDER_HISTORY",
          url: "history",
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
          title: "SUB-RECIPES OR PREPARATION",
          url: "preparations",
        },
        {
          title: "MENU",
          url: "menu",
        },
        {
          title: "PRODUCTION_EVENTS",
          url: "production_event",
        },
        {
          title: "SALESINVENTORY",
          url: "sales",
        },
      ],
    },
    {
      title: "REPORTS",
      url: "reports",
      icon: ChartArea,
      items: [
        {
          title: "SALES",
          url: "sales",
        },
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
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
