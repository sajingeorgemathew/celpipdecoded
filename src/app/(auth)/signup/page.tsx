import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignupForm } from "@/components/auth/SignupForm";
import { BrandMark } from "@/components/brand/BrandMark";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your CELPIP Decoded account and start practising.",
};

export default async function SignupPage() {
  // Already signed in users go straight to the dashboard.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex flex-col items-center gap-3"
            aria-label="CELPIP Decoded home"
          >
            <BrandMark size={48} className="rounded-xl" />
            <span className="text-lg font-semibold tracking-tight text-ink">
              CELPIP <span className="font-bold text-brand">Decoded</span>
            </span>
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Start practicing for CELPIP in minutes.
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-ink/70">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand transition-colors hover:text-brand-dark"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
