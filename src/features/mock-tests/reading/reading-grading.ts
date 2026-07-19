// Server-only grading for the Reading engine. This module uses the Supabase
// service role client and must only be called from a server route after the
// caller's ownership of the session has been verified. It never trusts a
// client-supplied score: correctness comes from the answer-key table.
// It is only imported by server route handlers, which pass in the service
// role client; it never touches a browser bundle.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReadingResultSummary } from "./reading-types";
import type { SessionRow } from "./reading-session";
import { gradeReading, type GradableQuestion } from "./reading-scoring";

type QuestionKeyRow = {
  id: string;
  question_number: number;
  mock_test_sections: { section_number: number; title: string } | null;
  mock_test_answer_keys: { correct_option_key: string } | null;
};

type AnswerRow = {
  question_id: string;
  selected_option_key: string | null;
};

export type SubmitResult = {
  summary: ReadingResultSummary;
  alreadySubmitted: boolean;
};

// Rebuild a stored summary from a session that has already been submitted, so
// a repeated submit returns the same result without regrading.
function existingSummary(session: SessionRow): ReadingResultSummary | null {
  if (session.result_summary && typeof session.result_summary === "object") {
    return session.result_summary as ReadingResultSummary;
  }
  return null;
}

// Grade and close a session. Idempotent: if the session is already submitted,
// the stored summary is returned unchanged. Uses a conditional status update
// so two concurrent submits cannot both write a score.
export async function submitReadingSession(
  admin: SupabaseClient,
  session: SessionRow,
  options: { timedOut: boolean },
): Promise<SubmitResult> {
  if (session.status !== "in_progress") {
    const summary = existingSummary(session);
    if (summary) {
      return { summary, alreadySubmitted: true };
    }
  }

  // Load every question for this test with its correct answer key.
  const { data: questionRows, error: questionError } = await admin
    .from("mock_test_questions")
    .select(
      "id, question_number, mock_test_sections!inner(section_number, title, mock_test_id), mock_test_answer_keys!inner(correct_option_key)",
    )
    .eq("mock_test_sections.mock_test_id", session.mock_test_id);

  if (questionError) {
    throw new Error("Could not load questions for grading.");
  }

  const rows = (questionRows ?? []) as unknown as QuestionKeyRow[];

  const gradable: GradableQuestion[] = [];
  const sectionTitles: Record<number, string> = {};
  for (const row of rows) {
    const section = row.mock_test_sections;
    const key = row.mock_test_answer_keys;
    if (!section || !key) {
      continue;
    }
    sectionTitles[section.section_number] = section.title;
    gradable.push({
      questionId: row.id,
      sectionNumber: section.section_number,
      questionNumber: row.question_number,
      correctKey: key.correct_option_key,
    });
  }

  // Load the answers the student saved during the session.
  const { data: answerRows, error: answerError } = await admin
    .from("mock_test_answers")
    .select("question_id, selected_option_key")
    .eq("session_id", session.id);

  if (answerError) {
    throw new Error("Could not load saved answers for grading.");
  }

  const answersByQuestionId: Record<string, string | null> = {};
  for (const answer of (answerRows ?? []) as AnswerRow[]) {
    answersByQuestionId[answer.question_id] = answer.selected_option_key;
  }

  const summary = gradeReading(gradable, answersByQuestionId, sectionTitles);

  // Attempt to close the session. The status guard makes this a no-op if a
  // concurrent request already submitted it.
  const submittedAt = new Date().toISOString();
  const { data: updated, error: updateError } = await admin
    .from("mock_test_sessions")
    .update({
      status: "submitted",
      submitted_at: submittedAt,
      raw_score: summary.rawScore,
      total_questions: summary.totalQuestions,
      result_summary: { ...summary, timedOut: options.timedOut },
      updated_at: submittedAt,
    })
    .eq("id", session.id)
    .eq("status", "in_progress")
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error("Could not save the graded result.");
  }

  if (!updated) {
    // Another request won the race. Return the already-stored summary.
    const { data: fresh } = await admin
      .from("mock_test_sessions")
      .select("result_summary")
      .eq("id", session.id)
      .maybeSingle();
    const stored =
      fresh && fresh.result_summary && typeof fresh.result_summary === "object"
        ? (fresh.result_summary as ReadingResultSummary)
        : summary;
    return { summary: stored, alreadySubmitted: true };
  }

  // Save correctness snapshots on the answered rows. This runs after the
  // session is closed so the stored answers reflect the final grading.
  const byQuestion = new Map(summary.questions.map((q) => [q.questionId, q]));
  await Promise.all(
    ((answerRows ?? []) as AnswerRow[]).map((answer) => {
      const graded = byQuestion.get(answer.question_id);
      if (!graded) {
        return Promise.resolve();
      }
      return admin
        .from("mock_test_answers")
        .update({
          is_correct: graded.isCorrect,
          correct_option_key_snapshot: graded.correctKey,
          updated_at: submittedAt,
        })
        .eq("session_id", session.id)
        .eq("question_id", answer.question_id)
        .then(() => undefined);
    }),
  );

  return { summary, alreadySubmitted: false };
}
