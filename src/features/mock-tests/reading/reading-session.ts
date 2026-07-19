// Session helpers for the Reading engine. Pure mapping and decision helpers
// used by the server routes and the exam shell. No database access here.

import type { ReadingSessionSummary, SessionStatus } from "./reading-types";
import { isExpired, toMillis } from "./reading-timer";

export const READING_MODULE_TYPE = "reading";

// Raw session row as selected from Supabase.
export type SessionRow = {
  id: string;
  user_id: string;
  mock_test_id: string;
  module_type: string;
  content_version: number;
  status: string;
  current_section_number: number;
  time_limit_seconds: number;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  raw_score: number | null;
  total_questions: number | null;
  result_summary: unknown;
  created_at: string;
  updated_at: string;
};

function toStatus(value: string): SessionStatus {
  if (value === "submitted" || value === "expired") {
    return value;
  }
  return "in_progress";
}

// A safe client view of a session. Timing values stay as ISO strings so the
// client always works from the server deadline.
export function toSessionSummary(row: SessionRow): ReadingSessionSummary {
  return {
    id: row.id,
    status: toStatus(row.status),
    currentSectionNumber: row.current_section_number,
    timeLimitSeconds: row.time_limit_seconds,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    submittedAt: row.submitted_at,
  };
}

// True when an in-progress session has passed its server deadline. Expired
// sessions are graded and closed rather than resumed.
export function sessionHasExpired(row: SessionRow, nowMs: number): boolean {
  if (row.status !== "in_progress") {
    return false;
  }
  const expiresMs = toMillis(row.expires_at);
  if (expiresMs === null) {
    return false;
  }
  return isExpired(expiresMs, nowMs);
}

// Clamp a requested section number into the valid range for the test.
export function clampSectionNumber(
  requested: number,
  sectionCount: number,
): number {
  if (!Number.isFinite(requested)) {
    return 1;
  }
  const rounded = Math.floor(requested);
  if (rounded < 1) {
    return 1;
  }
  if (rounded > sectionCount) {
    return sectionCount;
  }
  return rounded;
}

// Compute an ISO expires_at from a start time and a whole-second limit.
export function computeExpiresAt(
  startedAtMs: number,
  timeLimitSeconds: number,
): string {
  return new Date(startedAtMs + timeLimitSeconds * 1000).toISOString();
}
