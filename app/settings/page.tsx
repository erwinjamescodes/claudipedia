import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your study preferences and account settings
        </p>
      </div>
      
      <div className="text-center py-20">
        <h3 className="text-xl font-medium mb-4">Settings Coming Soon</h3>
        <p className="text-muted-foreground">
          We're working on comprehensive settings to customize your study experience.
        </p>
      </div>
    </div>
  );
}