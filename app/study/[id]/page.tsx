import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuestionPage } from "@/components/study/question-page";

export default async function StudySessionPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const sessionId = parseInt(params.id);
  
  if (isNaN(sessionId)) {
    redirect("/protected");
  }

  return (
    <div className="flex-1 w-full flex flex-col max-w-4xl mx-auto">
      <QuestionPage sessionId={sessionId} />
    </div>
  );
}