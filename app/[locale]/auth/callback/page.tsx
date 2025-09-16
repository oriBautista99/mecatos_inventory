"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      router.replace("/auth/login");
      return;
    }

    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error(error);
        router.replace("/auth/login");
        return;
      }
      // 🚀 Sesión creada, redirige a donde quieras
      // Si usas [locale], respeta la ruta actual:
      const locale = window.location.pathname.split("/")[1] || "en";
      router.replace(`/${locale}/dashboard`);
    })();
  }, [params, router, supabase]);

  return <p className="p-6">Iniciando sesión…</p>;
}