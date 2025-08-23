import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is already authenticated and redirect to arcade
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/arcade");
  } else {
    redirect("/auth/login");
  }
}
