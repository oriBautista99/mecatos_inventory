"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {

  const t = useTranslations("DASHBOARD");

  const pathname = usePathname(); 
  const basePath = pathname.split("/").slice(0, 3).join("/"); 
  const router = useRouter();

  //redirect for row
  const handleRowClick = (route:string) => {
    router.push(`${basePath}/${route}`);
  };

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu className="space-y-2">
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          return hasSubItems ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={t(item.title)}>
                    {item.icon && <item.icon onClick={() => handleRowClick(item.url)} />}
                    <span>{t(item.title)}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={basePath+'/'+item.url+'/'+subItem.url}
                            key={basePath+'/'+item.url+'/'+subItem.url}
                            className={cn(
                              pathname === basePath+'/'+item.url+'/'+subItem.url && "bg-primary/90 text-primary-foreground"
                            )}
                          >
                            <span>{t(subItem.title)}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>            
          ): (
            <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={t(item.title)}>
              <Link key={basePath+'/'+item.url} 
                href={basePath+'/'+item.url}
                className={cn(
                  pathname === basePath+'/'+item.url && "bg-primary/90  text-primary-foreground"
                )}
              >
                {item.icon && <item.icon />}
                <span>{t(item.title)}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
