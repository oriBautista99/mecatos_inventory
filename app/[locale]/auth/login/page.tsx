import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <main className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10 relative">
      <div className="absolute top-2 right-2 flex justify-between items-center">
      </div>
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </main>  
  );
}
