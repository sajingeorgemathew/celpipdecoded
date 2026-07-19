import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ReadingInstructions } from "@/components/mock-tests/reading/ReadingInstructions";
import { ReadingExamShell } from "@/components/mock-tests/reading/ReadingExamShell";
import { loadActiveReadingTest } from "@/features/mock-tests/reading/reading-loader";
import {
  READING_MODULE_TYPE,
  sessionHasExpired,
  toSessionSummary,
  type SessionRow,
} from "@/features/mock-tests/reading/reading-session";
import { nowMs } from "@/features/mock-tests/reading/reading-timer";
import { submitReadingSession } from "@/features/mock-tests/reading/reading-grading";
import { isValidMockTestSlug } from "@/features/mock-tests/mock-test-utils";
import type { AnswerMap } from "@/features/mock-tests/reading/reading-types";

export const metadata: Metadata = {
  title: "Reading test",
  description: "Timed CELPIP Decoded Reading practice test.",
};

// Reading instructions plus the active exam. When a live session exists it
// mounts the exam shell; when the live session has expired it is graded and
// the student is sent to the result; otherwise the instructions are shown.
export default async function ReadingTestPage({
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
    .select("*")
    .eq("user_id", user.id)
    .eq("mock_test_id", test.id)
    .eq("module_type", READING_MODULE_TYPE)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestSession = (latest as SessionRow | null) ?? null;
  const resultsBase = `/dashboard/mock-tests/${testSlug}/reading/results`;

  if (latestSession && latestSession.status === "in_progress") {
    if (sessionHasExpired(latestSession, nowMs())) {
      // The clock ran out while the student was away. Grade and show results.
      const admin = getSupabaseAdmin();
      await submitReadingSession(admin, latestSession, { timedOut: true });
      redirect(`${resultsBase}/${latestSession.id}`);
    }

    // Resume the live session with the answers already saved.
    const { data: answerRows } = await supabase
      .from("mock_test_answers")
      .select("question_id, selected_option_key")
      .eq("session_id", latestSession.id);

    const initialAnswers: AnswerMap = {};
    for (const row of (answerRows ?? []) as Array<{
      question_id: string;
      selected_option_key: string | null;
    }>) {
      initialAnswers[row.question_id] = row.selected_option_key;
    }

    return (
      <ReadingExamShell
        test={test}
        session={toSessionSummary(latestSession)}
        initialAnswers={initialAnswers}
        testSlug={testSlug}
      />
    );
  }

  const completedSessionId =
    latestSession && latestSession.status === "submitted"
      ? latestSession.id
      : null;

  return (
    <ReadingInstructions
      testSlug={testSlug}
      testTitle={test.title}
      readingMinutes={Math.round(test.readingTimeSeconds / 60)}
      totalQuestions={test.totalQuestions}
      sectionCount={test.sections.length}
      instructionVideoUrl={test.instructionVideoUrl}
      completedSessionId={completedSessionId}
    />
  );
}
