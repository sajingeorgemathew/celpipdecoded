import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  MockTestCard,
  type MockTestCardData,
} from "@/components/mock-tests/MockTestCard";
import { readingCopy } from "@/features/mock-tests/reading/reading-copy";

export const metadata: Metadata = {
  title: "CELPIP mock tests",
  description:
    "Full-length CELPIP Decoded practice tests. Start with Mock Test 1 Reading.",
};

// Mock-test library. Lists the active mock tests a signed-in student can open.
export default async function MockTestsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tests, error } = await supabase
    .from("mock_tests")
    .select("id, slug, title, description, status")
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Could not load mock tests. Please try again.");
  }

  const testList = (tests ?? []) as (MockTestCardData & { id: string })[];

  return (
    <>
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          CELPIP mock tests
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">
          Practice with a full-length, test-style experience. Mock Test 1
          Reading is ready now, with more skills coming next.
        </p>
        <p className="mt-4 rounded-xl bg-cream-soft/70 px-4 py-3 text-xs leading-5 text-ink/60">
          {readingCopy.disclaimer}
        </p>
      </section>

      <section className="mt-8" aria-label="Available mock tests">
        {testList.length === 0 ? (
          <p className="text-sm text-ink/70">
            No mock tests are available yet. Please check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testList.map((test) => (
              <MockTestCard key={test.id} test={test} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
