import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StatisticsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Statistics & Analytics</h1>
        <p className="text-muted-foreground">
          Detailed analysis of your study performance and progress over time
        </p>
      </div>
      
      <div className="text-center py-20">
        <h3 className="text-xl font-medium mb-4">Statistics Coming Soon</h3>
        <p className="text-muted-foreground">
          We're working on comprehensive analytics to help you track your progress and identify areas for improvement.
        </p>
      </div>
    </div>
  );
}