import { AuthButton } from "@/components/auth-button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Gamepad2, Play, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  // Check if user is already authenticated and redirect to arcade
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  
  if (data?.claims) {
    redirect("/arcade");
  }

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"} className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Encyclopedia of Counseling - Arcade Mode
              </Link>
            </div>
            <AuthButton />
          </div>
        </nav>
        
        <div className="flex-1 flex flex-col justify-center items-center max-w-4xl p-8 text-center">
          <div className="mb-8">
            <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Arcade Mode Study</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Fast-paced learning with instant feedback and progress tracking
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12 w-full max-w-2xl">
            <div className="p-6 border rounded-lg">
              <Play className="h-8 w-8 mb-3 text-green-500" />
              <h3 className="font-semibold mb-2">Quick Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Jump right into studying with minimal setup
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <BookOpen className="h-8 w-8 mb-3 text-blue-500" />
              <h3 className="font-semibold mb-2">Smart Questions</h3>
              <p className="text-sm text-muted-foreground">
                Adaptive question selection based on your progress
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <Gamepad2 className="h-8 w-8 mb-3 text-purple-500" />
              <h3 className="font-semibold mb-2">Gamified Learning</h3>
              <p className="text-sm text-muted-foreground">
                Streaks, achievements, and progress tracking
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
