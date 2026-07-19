"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readingCopy } from "@/features/mock-tests/reading/reading-copy";

// Pre-test instructions and the start action. Starting posts to the session
// route, which creates or resumes a server session, then the page refreshes
// into the exam shell. When a completed session exists the student can view
// the last result or start a new attempt.
export function ReadingInstructions({
  testSlug,
  testTitle,
  readingMinutes,
  totalQuestions,
  sectionCount,
  instructionVideoUrl,
  completedSessionId,
}: {
  testSlug: string;
  testTitle: string;
  readingMinutes: number;
  totalQuestions: number;
  sectionCount: number;
  instructionVideoUrl: string | null;
  completedSessionId: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultsHref = completedSessionId
    ? `/dashboard/mock-tests/${testSlug}/reading/results/${completedSessionId}`
    : null;

  async function startSession(restart: boolean) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/mock-tests/${testSlug}/reading/session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restart }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        setError(data.error ?? readingCopy.errors.startFailed);
        setBusy(false);
        return;
      }
      if (data.state === "auto_submitted" || data.state === "completed") {
        router.push(
          `/dashboard/mock-tests/${testSlug}/reading/results/${data.sessionId}`,
        );
        return;
      }
      // created or resumed: reload so the page mounts the exam shell.
      router.refresh();
    } catch {
      setError(readingCopy.errors.startFailed);
      setBusy(false);
    }
  }

  const primaryLabel = completedSessionId
    ? "Start a new attempt"
    : "Start reading test";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
          {testTitle}
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Reading test instructions
        </h1>
        <ol className="mt-5 space-y-3 text-sm leading-6 text-ink/80">
          <li>
            1. This is a practice test. You can move back to a previous part and
            change your answers before you submit.
          </li>
          <li>
            2. Watch the timer in the top right corner so you finish the Reading
            test before time runs out.
          </li>
          <li>
            3. The Reading test has {sectionCount} parts and {totalQuestions}{" "}
            questions. You have about {readingMinutes} minutes for this practice
            configuration.
          </li>
          <li>
            4. When time reaches zero, the test is submitted automatically and
            your saved answers are graded.
          </li>
        </ol>

        {instructionVideoUrl ? (
          <div className="mt-6">
            <a
              href={instructionVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand underline"
            >
              Watch the reading instructions video
            </a>
          </div>
        ) : null}

        <p className="mt-6 rounded-xl bg-cream-soft/70 px-4 py-3 text-xs leading-5 text-ink/60">
          {readingCopy.disclaimer}
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void startSession(Boolean(completedSessionId))}
          disabled={busy}
          className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Starting" : primaryLabel}
        </button>

        {resultsHref ? (
          <Link
            href={resultsHref}
            className="inline-flex h-12 items-center justify-center rounded-full border border-ink/15 px-6 text-sm font-semibold text-ink transition-colors hover:bg-cream-soft"
          >
            View last result
          </Link>
        ) : null}

        <Link
          href={`/dashboard/mock-tests/${testSlug}`}
          className="inline-flex h-12 items-center justify-center rounded-full px-4 text-sm font-semibold text-ink/60 transition-colors hover:text-ink"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
