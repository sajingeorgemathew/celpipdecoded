"use client";

import { formatClock } from "@/features/mock-tests/reading/reading-timer";
import { readingCopy } from "@/features/mock-tests/reading/reading-copy";

// Compact countdown for the exam header. The visible value updates every
// second, but the screen-reader announcement only changes when the warning
// state changes, so assistive tech is not interrupted every second.
export function ReadingTimer({
  remainingSeconds,
  warning,
  expired,
}: {
  remainingSeconds: number;
  warning: boolean;
  expired: boolean;
}) {
  return (
    <div className="text-right">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-white/60">
        {readingCopy.timerLabel}
      </p>
      <p
        aria-hidden
        className={`font-semibold tabular-nums leading-none ${
          warning || expired ? "text-amber-300" : "text-white"
        } text-2xl sm:text-3xl`}
      >
        {formatClock(remainingSeconds)}
      </p>
      {/* Announced only when the warning window opens, not every second. */}
      <span role="status" aria-live="polite" className="sr-only">
        {expired
          ? "Time is up."
          : warning
            ? "Fewer than five minutes remain in the reading test."
            : ""}
      </span>
      {warning && !expired ? (
        <p className="mt-0.5 text-[0.65rem] font-semibold text-amber-300">
          Under 5 minutes
        </p>
      ) : null}
    </div>
  );
}
