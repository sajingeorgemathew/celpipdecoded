// Pure timer helpers for the Reading engine. The authoritative deadline is the
// server-created expires_at value, so refreshing or leaving the page never
// resets the countdown. These helpers only turn timestamps into display
// values and never create time on their own.

// Fallback time limit if a mock test has no stored reading_time_seconds.
export const DEFAULT_READING_TIME_SECONDS = 3300;

// Show a visible warning when this many seconds or fewer remain.
export const READING_WARNING_THRESHOLD_SECONDS = 300;

// Current wall-clock time in milliseconds. Wrapping Date.now keeps the clock
// behind a named seam, so components read time through one helper instead of
// calling the impure global directly during render.
export function nowMs(): number {
  return Date.now();
}

// Clamp to a safe non-negative whole number of seconds.
export function clampSeconds(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.floor(value);
}

// Format seconds as minutes and seconds, for example "54:09" or "0:07".
// Always shows minutes so the display never changes width mid-countdown.
export function formatClock(totalSeconds: number): string {
  const safe = clampSeconds(totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Whole seconds left until the deadline, never below zero. Uses ceil so the
// display shows "1" until the final second has fully elapsed.
export function getRemainingSeconds(
  expiresAtMs: number,
  nowMs: number,
): number {
  return Math.max(0, Math.ceil((expiresAtMs - nowMs) / 1000));
}

// True once the deadline has passed.
export function isExpired(expiresAtMs: number, nowMs: number): boolean {
  return nowMs >= expiresAtMs;
}

// True while the countdown is in its final warning window but not yet expired.
export function isInWarningWindow(remainingSeconds: number): boolean {
  return (
    remainingSeconds > 0 &&
    remainingSeconds <= READING_WARNING_THRESHOLD_SECONDS
  );
}

// Parse an ISO timestamp to milliseconds, returning null when invalid.
export function toMillis(iso: string | null | undefined): number | null {
  if (!iso) {
    return null;
  }
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}
