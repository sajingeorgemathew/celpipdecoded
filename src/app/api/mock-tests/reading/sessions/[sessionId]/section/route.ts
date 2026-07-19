import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readingCopy } from "@/features/mock-tests/reading/reading-copy";
import { setSectionSchema } from "@/features/mock-tests/reading/reading-validation";
import {
  clampSectionNumber,
  type SessionRow,
} from "@/features/mock-tests/reading/reading-session";
import { isUuid } from "@/features/mock-tests/mock-test-utils";

export const runtime = "nodejs";

// Persist which Reading section the student is currently viewing, so a resume
// returns to the same place. Runs through the caller's own session client.
export async function POST(
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

  const parsed = setSectionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.invalidRequest },
      { status: 400 },
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

  const { data: session, error: sessionError } = await supabase
    .from("mock_test_sessions")
    .select("id, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.saveFailed },
      { status: 500 },
    );
  }
  if (!session) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.sessionNotFound },
      { status: 404 },
    );
  }
  if ((session as SessionRow).status !== "in_progress") {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.sessionClosed },
      { status: 409 },
    );
  }

  const sectionNumber = clampSectionNumber(parsed.data.sectionNumber, 4);

  const { error: updateError } = await supabase
    .from("mock_test_sessions")
    .update({
      current_section_number: sectionNumber,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: readingCopy.errors.saveFailed },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, currentSectionNumber: sectionNumber });
}
