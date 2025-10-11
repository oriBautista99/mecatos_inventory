import AuthBackgroundShape from "@/components/auth-background-shape";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div  className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 -z-10 overflow-hidden flex items-center justify-center">
        <AuthBackgroundShape
          className="text-primary"
          style={{
            stroke: "hsl(var(--primary))",
          }}
        />
      </div>

      {/* Contenedor principal */}
      <LoginForm />
    </div>  
  );
}
//  className={cn("text-primary", props.className)}