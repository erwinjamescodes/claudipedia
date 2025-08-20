import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionCreationForm } from "@/components/study/session-creation-form";

export default async function CreateSessionPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create Study Session</h1>
        <p className="text-muted-foreground">
          Configure your study session settings and preferences
        </p>
      </div>
      
      <SessionCreationForm />
    </div>
  );
}