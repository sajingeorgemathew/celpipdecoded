"use client";

import { readingCopy } from "@/features/mock-tests/reading/reading-copy";

export type SaveState = "idle" | "saving" | "saved" | "error";

// Subtle but visible save indicator. On error it shows a retry button so an
// answer is never silently lost.
export function ReadingSaveStatus({
  state,
  onRetry,
}: {
  state: SaveState;
  onRetry: () => void;
}) {
  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-200">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full bg-amber-300"
        />
        {readingCopy.saveError}
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-amber-200/60 px-2 py-0.5 text-xs font-semibold text-amber-100 hover:bg-white/10"
        >
          Retry
        </button>
      </span>
    );
  }

  const label =
    state === "saving"
      ? readingCopy.saving
      : state === "saved"
        ? readingCopy.saved
        : readingCopy.savingIdle;

  const dotClass =
    state === "saving"
      ? "bg-amber-300"
      : state === "saved"
        ? "bg-emerald-300"
        : "bg-white/40";

  return (
    <span
      className="inline-flex items-center gap-2 text-xs font-medium text-white/70"
      aria-live="polite"
    >
      <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
