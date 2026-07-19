import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readingCopy } from "@/features/mock-tests/reading/reading-copy";
import { saveAnswerSchema } from "@/features/mock-tests/reading/reading-validation";
import {
  sessionHasExpired,
  type SessionRow,
} from "@/features/mock-tests/reading/reading-session";
import { isUuid } from "@/features/mock-tests/mock-test-utils";

export const runtime = "nodejs";

// Save one answer for a session. The insert and update run through the
// caller's own session client, so RLS guarantees the answer can only be
// written to a session the caller owns and that is still in progress. The
// correct answer is never touched here.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  if (!isUuid(sessionId)) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.sessionNotFound },
      { status: 404 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.invalidRequest },
      { status: 400 },
    );
  }

  const parsed = saveAnswerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.invalidRequest },
      { status: 400 },
    );
  }
  const { questionId, selectedOptionKey } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.sessionExpired },
      { status: 401 },
    );
  }

  const { data: session, error: sessionError } = await supabase
    .from("mock_test_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.saveFailed },
      { status: 500 },
    );
  }
  if (!session) {
    // RLS hides sessions the caller does not own, so this covers both a
    // missing session and one belonging to another user.
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.sessionNotFound },
      { status: 404 },
    );
  }

  const sessionRow = session as SessionRow;

  if (sessionRow.status !== "in_progress") {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.sessionClosed },
      { status: 409 },
    );
  }
  if (sessionHasExpired(sessionRow, Date.now())) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.timeUp, code: "expired" },
      { status: 409 },
    );
  }

  // Verify the question belongs to this test and the chosen key is a real
  // option for that question.
  const { data: question, error: questionError } = await supabase
    .from("mock_test_questions")
    .select("id, options_json, mock_test_sections!inner(mock_test_id)")
    .eq("id", questionId)
    .eq("mock_test_sections.mock_test_id", sessionRow.mock_test_id)
    .maybeSingle();

  if (questionError) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.saveFailed },
      { status: 500 },
    );
  }
  if (!question) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.invalidAnswer },
      { status: 404 },
    );
  }

  const optionKeys = Array.isArray(question.options_json)
    ? (question.options_json as Array<{ key?: unknown }>).map((o) =>
        String(o.key ?? ""),
      )
    : [];

  if (selectedOptionKey !== null && !optionKeys.includes(selectedOptionKey)) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.invalidAnswer },
      { status: 422 },
    );
  }

  const answeredAt = new Date().toISOString();

  const { error: upsertError } = await supabase
    .from("mock_test_answers")
    .upsert(
      {
        session_id: sessionId,
        question_id: questionId,
        selected_option_key: selectedOptionKey,
        answered_at: answeredAt,
        updated_at: answeredAt,
      },
      { onConflict: "session_id,question_id" },
    );

  if (upsertError) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.saveFailed },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, savedAt: answeredAt });
}
