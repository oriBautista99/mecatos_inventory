"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Languages, Laptop, LogOut, Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useProfileLoginSWR } from "@/hooks/useUserLogin"
import { useTheme } from "next-themes"
import { ThemeSwitcher } from "./theme-switcher"
import LanguageSwitcher from "./ui/languageSwitcher"

export function HeaderUser() {

  const {profile, isLoading} = useProfileLoginSWR(); 
  const { theme } = useTheme();
  const ICON_SIZE = 16;

  const router = useRouter();
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();    
    router.push("/auth/login"); // Redirige al login
  };

  if(isLoading){ 
    return null;
  }

  if(!isLoading && profile){
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
                {/* <AvatarImage src={profile[0].avatar || "/placeholder.svg"} alt={profile[0].username} /> */}
                <AvatarFallback>
                              {profile && profile.username
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                  </AvatarFallback>
              </Avatar>
              
          </Button>       
        </DropdownMenuTrigger>
        <DropdownMenuContent  className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="p-0"
          >

            <ThemeSwitcher
              align="end"
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-2 py-1.5"
                >
                  {theme === "light" ? (
                    <Sun size={ICON_SIZE} />
                  ) : theme === "dark" ? (
                    <Moon size={ICON_SIZE} />
                  ) : (
                    <Laptop size={ICON_SIZE} />
                  )}
                  <span className="ml-2">Theme</span>
                </Button>
              }
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="p-0"
          >
            <LanguageSwitcher
              align="end"
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-2 py-1.5"
                >
                  <Languages className="h-4 w-4" />
                  <span className="ml-2">Languaje</span>
                </Button>
              }
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem  onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    );    
  }

}
