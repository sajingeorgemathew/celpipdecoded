import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  MockTestOverview,
  type OverviewSessionState,
} from "@/components/mock-tests/MockTestOverview";
import { loadActiveReadingTest } from "@/features/mock-tests/reading/reading-loader";
import { READING_MODULE_TYPE } from "@/features/mock-tests/reading/reading-session";
import { isValidMockTestSlug } from "@/features/mock-tests/mock-test-utils";

export const metadata: Metadata = {
  title: "Mock test overview",
  description: "Choose a skill to practice in this CELPIP Decoded mock test.",
};

// Mock test overview. Shows Reading as available and Writing as coming next,
// with a start, resume, or view-result action depending on the student's most
// recent Reading session.
export default async function MockTestOverviewPage({
  params,
}: {
  params: Promise<{ testSlug: string }>;
}) {
  const { testSlug } = await params;

  if (!isValidMockTestSlug(testSlug)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const test = await loadActiveReadingTest(supabase, testSlug);
  if (!test) {
    notFound();
  }

  const { data: latest } = await supabase
    .from("mock_test_sessions")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("mock_test_id", test.id)
    .eq("module_type", READING_MODULE_TYPE)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sessionState: OverviewSessionState = { kind: "none" };
  if (latest) {
    if (latest.status === "in_progress") {
      sessionState = { kind: "in_progress" };
    } else if (latest.status === "submitted") {
      sessionState = { kind: "submitted", sessionId: latest.id };
    }
  }

  return (
    <MockTestOverview
      testSlug={test.slug}
      title={test.title}
      description={test.description}
      readingMinutes={Math.round(test.readingTimeSeconds / 60)}
      totalQuestions={test.totalQuestions}
      sectionCount={test.sections.length}
      sessionState={sessionState}
    />
  );
}
