import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { readingCopy } from "@/features/mock-tests/reading/reading-copy";
import {
  sessionHasExpired,
  type SessionRow,
} from "@/features/mock-tests/reading/reading-session";
import { submitReadingSession } from "@/features/mock-tests/reading/reading-grading";
import { isUuid } from "@/features/mock-tests/mock-test-utils";
import type { ReadingResultSummary } from "@/features/mock-tests/reading/reading-types";

export const runtime = "nodejs";

// Grade and submit a Reading session. Secure and idempotent:
// 1. Authenticate the user
// 2. Verify ownership through the caller's own session client
// 3. Grade only when the session is still in progress
// 4. Return the existing result when the session is already submitted
// All grading happens on the server with the service role after ownership is
// verified. The client score is never trusted.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  if (!isUuid(sessionId)) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.sessionNotFound },
      { status: 404 },
    );
  }

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

  // Ownership is enforced by RLS: this returns the session only if it belongs
  // to the caller.
  const { data: session, error: sessionError } = await supabase
    .from("mock_test_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.submitFailed },
      { status: 500 },
    );
  }
  if (!session) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.sessionNotFound },
      { status: 404 },
    );
  }

  const sessionRow = session as SessionRow;

  // Already submitted: return the stored result without regrading.
  if (sessionRow.status !== "in_progress") {
    const summary =
      sessionRow.result_summary &&
      typeof sessionRow.result_summary === "object"
        ? (sessionRow.result_summary as ReadingResultSummary)
        : null;
    return NextResponse.json({
      ok: true,
      sessionId: sessionRow.id,
      alreadySubmitted: true,
      summary,
    });
  }

  const timedOut = sessionHasExpired(sessionRow, Date.now());

  try {
    const admin = getSupabaseAdmin();
    const { summary, alreadySubmitted } = await submitReadingSession(
      admin,
      sessionRow,
      { timedOut },
    );
    return NextResponse.json({
      ok: true,
      sessionId: sessionRow.id,
      alreadySubmitted,
      summary,
    });
  } catch (error) {
    console.error("Reading submit error:", error);
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.submitFailed },
      { status: 500 },
    );
  }
}
