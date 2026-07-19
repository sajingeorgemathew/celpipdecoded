"use client";

import Link from "next/link";
import { ReadingTimer } from "./ReadingTimer";
import { ReadingSaveStatus, type SaveState } from "./ReadingSaveStatus";

// Compact exam header: test and current section title on the left, timer on
// the right. Kept dark and slim so the timed viewport keeps as much room as
// possible for the test itself. The exit link is the clear way out.
export function ReadingExamHeader({
  testTitle,
  sectionTitle,
  sectionIndex,
  sectionCount,
  remainingSeconds,
  warning,
  expired,
  saveState,
  onRetrySave,
  exitHref,
  answeredTotal,
  totalQuestions,
}: {
  testTitle: string;
  sectionTitle: string;
  sectionIndex: number;
  sectionCount: number;
  remainingSeconds: number;
  warning: boolean;
  expired: boolean;
  saveState: SaveState;
  onRetrySave: () => void;
  exitHref: string;
  answeredTotal: number;
  totalQuestions: number;
}) {
  return (
    <header className="sticky top-0 z-20 bg-ink text-white shadow-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={exitHref}
              className="rounded-full border border-white/20 px-2.5 py-1 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10"
            >
              Exit
            </Link>
            <p className="truncate text-xs font-semibold uppercase tracking-[0.15em] text-white/60">
              {testTitle} reading
            </p>
          </div>
          <h1 className="mt-1 truncate text-base font-semibold sm:text-lg">
            Part {sectionIndex + 1} of {sectionCount}: {sectionTitle}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs text-white/60">
              {answeredTotal} of {totalQuestions} answered
            </span>
            <ReadingSaveStatus state={saveState} onRetry={onRetrySave} />
          </div>
        </div>

        <ReadingTimer
          remainingSeconds={remainingSeconds}
          warning={warning}
          expired={expired}
        />
      </div>
    </header>
  );
}
