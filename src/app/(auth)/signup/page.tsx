import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create account - Toronto Academy of Education",
  description:
    "Create your Toronto Academy CELPIP Preparation Program account and start practicing.",
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
            className="inline-flex flex-col items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand"
          >
            <Image
              src="/favicon.png"
              alt="Toronto Academy of Education logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl"
            />
            Toronto Academy of Education
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-ink">
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
