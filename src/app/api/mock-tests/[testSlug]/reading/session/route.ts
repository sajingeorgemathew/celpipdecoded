import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { readingCopy } from "@/features/mock-tests/reading/reading-copy";
import { startSessionSchema } from "@/features/mock-tests/reading/reading-validation";
import {
  READING_MODULE_TYPE,
  sessionHasExpired,
  computeExpiresAt,
  toSessionSummary,
  type SessionRow,
} from "@/features/mock-tests/reading/reading-session";
import { submitReadingSession } from "@/features/mock-tests/reading/reading-grading";
import { isValidMockTestSlug } from "@/features/mock-tests/mock-test-utils";
import { DEFAULT_READING_TIME_SECONDS } from "@/features/mock-tests/reading/reading-timer";

export const runtime = "nodejs";

// Start or resume the Reading session for a mock test. A user may hold only
// one active Reading session per test. Timing is created here on the server
// with a fixed expires_at so refresh and revisit never reset the clock.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ testSlug: string }> },
) {
  const { testSlug } = await params;

  if (!isValidMockTestSlug(testSlug)) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.notFound },
      { status: 404 },
    );
  }

  let payload: unknown = {};
  try {
    const text = await request.text();
    payload = text ? JSON.parse(text) : {};
  } catch {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.invalidRequest },
      { status: 400 },
    );
  }

  const parsed = startSessionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.invalidRequest },
      { status: 400 },
    );
  }
  const { restart } = parsed.data;

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

  const { data: test, error: testError } = await supabase
    .from("mock_tests")
    .select("id, content_version, reading_time_seconds, status")
    .eq("slug", testSlug)
    .eq("status", "active")
    .maybeSingle();

  if (testError) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.startFailed },
      { status: 500 },
    );
  }
  if (!test) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.notFound },
      { status: 404 },
    );
  }

  const timeLimitSeconds =
    test.reading_time_seconds ?? DEFAULT_READING_TIME_SECONDS;

  // Most recent session for this user, test, and module.
  const { data: latest, error: latestError } = await supabase
    .from("mock_test_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("mock_test_id", test.id)
    .eq("module_type", READING_MODULE_TYPE)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.startFailed },
      { status: 500 },
    );
  }

  const nowMs = Date.now();
  const latestSession = latest as SessionRow | null;

  if (latestSession && latestSession.status === "in_progress") {
    if (sessionHasExpired(latestSession, nowMs)) {
      // The clock ran out while the student was away. Grade and close it.
      const admin = getSupabaseAdmin();
      await submitReadingSession(admin, latestSession, { timedOut: true });
      return NextResponse.json({
        ok: true,
        state: "auto_submitted",
        sessionId: latestSession.id,
      });
    }
    // A live session exists. Resume it rather than starting a second one.
    return NextResponse.json({
      ok: true,
      state: "resumed",
      session: toSessionSummary(latestSession),
    });
  }

  if (latestSession && latestSession.status === "submitted" && !restart) {
    // Already finished and no new attempt requested.
    return NextResponse.json({
      ok: true,
      state: "completed",
      sessionId: latestSession.id,
    });
  }

  // Create a fresh session with a server-authored deadline.
  const startedAt = new Date(nowMs).toISOString();
  const expiresAt = computeExpiresAt(nowMs, timeLimitSeconds);

  const { data: created, error: createError } = await supabase
    .from("mock_test_sessions")
    .insert({
      user_id: user.id,
      mock_test_id: test.id,
      module_type: READING_MODULE_TYPE,
      content_version: test.content_version ?? 1,
      status: "in_progress",
      current_section_number: 1,
      time_limit_seconds: timeLimitSeconds,
      started_at: startedAt,
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (createError || !created) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.startFailed },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    state: "created",
    session: toSessionSummary(created as SessionRow),
  });
}
