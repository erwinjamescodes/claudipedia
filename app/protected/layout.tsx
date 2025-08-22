import { AuthButton } from "@/components/auth-button";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-8 items-center">
            <Link href="/protected" className="font-bold text-lg">
              Board Exam Prep
            </Link>
            <div className="hidden md:flex gap-6 items-center text-sm">
              <Link href="/protected" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/study/create" className="hover:underline">
                New Session
              </Link>
              <Link href="/statistics" className="hover:underline">
                Statistics
              </Link>
              <Link href="/settings" className="hover:underline">
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AuthButton />
          </div>
        </div>
      </nav>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-5">
        {children}
      </main>
    </div>
  );
}
