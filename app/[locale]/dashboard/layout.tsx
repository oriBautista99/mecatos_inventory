import { AppSidebar, userData } from "@/components/app-sidebar"
import { HeaderUser } from "@/components/header-user"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import LanguageSwitcher from "@/components/ui/languageSwitcher";
import React from "react"
import Breadcrumbs from "@/components/dashboard/breadcrumbs"
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function DashboardLayout({children} : Readonly<{children: React.ReactNode}>) {
 
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumbs />
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <NotificationsDropdown />
            <LanguageSwitcher />
            <ThemeSwitcher />
            <HeaderUser user={userData} />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}