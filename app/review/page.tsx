import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ReviewPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Review Questions</h1>
        <p className="text-muted-foreground">
          Review questions you got wrong or flagged for further study
        </p>
      </div>
      
      <div className="text-center py-20">
        <h3 className="text-xl font-medium mb-4">Review Mode Coming Soon</h3>
        <p className="text-muted-foreground">
          We're working on a comprehensive review system to help you focus on challenging questions.
        </p>
      </div>
    </div>
  );
}