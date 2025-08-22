import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  // Check if user is already authenticated and redirect to arcade
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  
  if (data?.claims) {
    redirect("/arcade");
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
