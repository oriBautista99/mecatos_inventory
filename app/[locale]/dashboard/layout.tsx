import { AppSidebar } from "@/components/app-sidebar"
import { HeaderUser } from "@/components/header-user"
// import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import LanguageSwitcher from "@/components/ui/languageSwitcher";
import React from "react"
import Breadcrumbs from "@/components/dashboard/breadcrumbs"
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server"
// import { getUserById } from "@/actions/users"
import { redirect } from "next/navigation"

export default async function DashboardLayout({children} : Readonly<{children: React.ReactNode}>) {

  const supabase = await createClient();
  const { data: {user} } = await supabase.auth.getUser();

  if(!user) {
    redirect('/en/auth/login'); // o muestra un error
    return null;
  }
  
   
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4 hidden md:block" />
            <Breadcrumbs/>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            {/* <NotificationsDropdown /> */}
            <LanguageSwitcher />
            <ThemeSwitcher />
            <HeaderUser/>
          </div>
        </header>
        <div className="min-h-min bg-background ">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}