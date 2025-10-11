"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { capitalize } from "@/utils/text";
import { useLocaleRouter } from "@/hooks/useLocaleRouter";
import Image from "next/image";

export function LoginForm() {

  const [loginMode, setLoginMode] = useState <"pin"|"email">("pin");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0,6);
    setPin(value);
  }

  const t = useTranslations("Home");
  const { push } = useLocaleRouter();

  async function loginUser(credentialsUser: {email: string, password:string}) {
      try {
          const supabase = createClient();
          const { error } = await supabase.auth.signInWithPassword({
            email: credentialsUser.email,
            password: credentialsUser.password
          });
          if (error) throw error;
          // Update this route to redirect to an authenticated route. The user already has an active session.
          push("/dashboard");
          
      } catch (error: unknown) {
          setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
          setIsLoading(false);
      }   
  }

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    setIsLoading(true);
    setError(null); 

    if(loginMode === 'email'){
      loginUser({
        email: email,
        password: password
      });

    }else{

      try{
        const res = await fetch("/api/pin-login", {
          method: "POST",
          body: JSON.stringify({ pin })
        });
        const data = await res.json();
        if(!res.ok){
          setError(data.error || "Error en login");
          return;
        }
        loginUser({
          email: data,
          password: pin
        });

      }catch (e) {
        console.log(e)
        setError(e instanceof Error ? e.message : "An error occurred");
      }
        
    }

  };

  return (
    <Card className="relative z-10 w-full border border-border/30 shadow-xl backdrop-blur-sm bg-card/80 sm:max-w-md">
      <CardHeader className="flex flex-row items-center gap-2 w-full pb-2">
        <div className="relative w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" /> {/* halo suave */}
          <Image
            src="/mecatos-logo.png"
            alt="Mecatos Logo"
            fill
            className="object-contain relative drop-shadow-md"
            sizes="96px"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Mecatos Hoffner
          </h1>
          <p className="text-sm text-muted-foreground">
            Inventory App
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-8 pt-4">
        <form onSubmit={handleLogin} className="md:col-span-3 lg:col-span-1">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                {t("welcome")}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {loginMode === "pin"
                  ? t("instructionsPIN")
                  : t("instructionsEmail")}
              </p>
            </div>             
            {loginMode === "pin" ? (
              <div className="grid gap-4 sm:gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="pin" className="text-center text-sm sm:text-base">
                    {t('inputPin')}
                  </Label>
                  <Input
                    id="pin"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="••••••"
                    value={pin}
                    onChange={handlePinChange}
                    className="text-center text-xl sm:text-2xl font-mono tracking-widest py-3 sm:py-4"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">{pin.length}/6 {t('digits')}</p>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full py-2 sm:py-3" disabled={pin.length !== 6}>
                  {isLoading ? t('logging') : t('login')}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label className="text-sm sm:text-base" htmlFor="email">{capitalize(t('email'))}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required 
                    value={email}
                    className="py-2 sm:py-3"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-sm sm:text-base">
                      {capitalize(t('password'))}
                    </Label>
                    {/* <a href="#" className="ml-auto text-xs sm:text-sm underline-offset-2 hover:underline">
                      Forgot your password?
                    </a> */}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <Button type="submit" className="w-full py-2 sm:py-3" disabled={!email || !password}>
                  {isLoading ? t('logging') : t('login')}
                </Button>
              </div>
            )}

            <div className="after:border-border relative text-center text-xs sm:text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-card text-muted-foreground relative z-10 px-2">{t('continue')}</span>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full bg-transparent py-2 sm:py-3"
              onClick={() => setLoginMode(loginMode === "pin" ? "email" : "pin")}
            >
              {loginMode === "pin" ? (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">{t('buttonEmail')}</span>
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">{t('buttonPin')}</span>
                </>
              )}
            </Button>
          </div>
        </form>
        {/* Imagen */}
        {/* <div className="bg-muted relative hidden md:block">
          <img
            src="/placeholder.svg"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div> */}
      </CardContent>
    </Card>
  );
}
