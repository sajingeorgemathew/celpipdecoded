import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ReadingEndScreen } from "@/components/mock-tests/reading/ReadingEndScreen";
import { ReadingScoreSummary } from "@/components/mock-tests/reading/ReadingScoreSummary";
import { ReadingResultReview } from "@/components/mock-tests/reading/ReadingResultReview";
import { loadActiveReadingTest } from "@/features/mock-tests/reading/reading-loader";
import {
  sessionHasExpired,
  type SessionRow,
} from "@/features/mock-tests/reading/reading-session";
import { nowMs } from "@/features/mock-tests/reading/reading-timer";
import { submitReadingSession } from "@/features/mock-tests/reading/reading-grading";
import { buildReviewRows } from "@/features/mock-tests/reading/reading-content";
import { isUuid, isValidMockTestSlug } from "@/features/mock-tests/mock-test-utils";
import type { ReadingResultSummary } from "@/features/mock-tests/reading/reading-types";

export const metadata: Metadata = {
  title: "Reading result",
  description: "Your CELPIP Decoded Reading practice result and answer review.",
};

// Submitted answer review and score. Only the owner can read the session
// (enforced by RLS), and the correct answers appear only after submission.
export default async function ReadingResultPage({
  params,
}: {
  params: Promise<{ testSlug: string; sessionId: string }>;
}) {
  const { testSlug, sessionId } = await params;

  if (!isValidMockTestSlug(testSlug) || !isUuid(sessionId)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RLS returns the session only if it belongs to the caller.
  const { data: sessionData } = await supabase
    .from("mock_test_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (!sessionData) {
    notFound();
  }
  const session = sessionData as SessionRow;

  const test = await loadActiveReadingTest(supabase, testSlug);
  if (!test || test.id !== session.mock_test_id) {
    notFound();
  }

  let summary: ReadingResultSummary | null =
    session.result_summary && typeof session.result_summary === "object"
      ? (session.result_summary as ReadingResultSummary)
      : null;

  if (session.status === "in_progress") {
    if (sessionHasExpired(session, nowMs())) {
      // Grade an expired session that was never closed, then show the result.
      const admin = getSupabaseAdmin();
      const graded = await submitReadingSession(admin, session, {
        timedOut: true,
      });
      summary = graded.summary;
    } else {
      // Still live: send the student back to finish the test.
      redirect(`/dashboard/mock-tests/${testSlug}/reading`);
    }
  }

  if (!summary) {
    throw new Error("This result could not be loaded. Please try again.");
  }

  const timedOut = Boolean(
    (summary as ReadingResultSummary & { timedOut?: boolean }).timedOut,
  );
  const reviewRows = buildReviewRows(test, summary);
  const parts = test.sections.map((section) => ({
    sectionNumber: section.sectionNumber,
    title: section.title,
  }));

  return (
    <div className="space-y-8">
      <ReadingEndScreen testSlug={testSlug} timedOut={timedOut} />

      <div id="score-summary">
        <ReadingScoreSummary summary={summary} />
      </div>

      <div id="answer-review">
        <ReadingResultReview rows={reviewRows} parts={parts} />
      </div>
    </div>
  );
}
