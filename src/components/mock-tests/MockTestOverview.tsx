import Link from "next/link";
import { readingCopy } from "@/features/mock-tests/reading/reading-copy";

export type OverviewSessionState =
  | { kind: "none" }
  | { kind: "in_progress" }
  | { kind: "submitted"; sessionId: string };

// Mock Test 1 overview. Shows Reading as available with a start or resume
// action, and Writing as coming next. Listening and Speaking are intentionally
// not shown for this ticket.
export function MockTestOverview({
  testSlug,
  title,
  description,
  readingMinutes,
  totalQuestions,
  sectionCount,
  sessionState,
}: {
  testSlug: string;
  title: string;
  description: string | null;
  readingMinutes: number;
  totalQuestions: number;
  sectionCount: number;
  sessionState: OverviewSessionState;
}) {
  const readingHref = `/dashboard/mock-tests/${testSlug}/reading`;
  const startLabel =
    sessionState.kind === "in_progress" ? "Resume reading" : "Start reading";

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
          CELPIP mock tests
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">
            {description}
          </p>
        ) : null}
        <p className="mt-4 rounded-xl bg-cream-soft/70 px-4 py-3 text-xs leading-5 text-ink/60">
          {readingCopy.disclaimer}
        </p>
      </header>

      <section aria-label="Test sections" className="grid gap-5 sm:grid-cols-2">
        {/* Reading */}
        <article className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold text-ink">
              Reading
            </h2>
            <span className="shrink-0 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              Available
            </span>
          </div>

          <ul className="mt-4 space-y-1.5 text-sm text-ink/70">
            <li>{sectionCount} parts</li>
            <li>{totalQuestions} questions</li>
            <li>{readingMinutes}-minute practice configuration</li>
          </ul>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
            <Link
              href={readingHref}
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
            >
              {startLabel}
            </Link>
            {sessionState.kind === "submitted" ? (
              <Link
                href={`${readingHref}/results/${sessionState.sessionId}`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-ink/15 px-6 text-sm font-semibold text-ink transition-colors hover:bg-cream-soft"
              >
                View result
              </Link>
            ) : null}
          </div>
        </article>

        {/* Writing */}
        <article className="flex flex-col rounded-3xl bg-white p-6 opacity-80 shadow-sm ring-1 ring-ink/5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold text-ink">
              Writing
            </h2>
            <span className="shrink-0 rounded-full bg-cream-soft px-3 py-1 text-xs font-semibold text-ink/60">
              Coming next
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-ink/70">
            The Writing mock test is being prepared and will follow the same
            practice format as Reading.
          </p>

          <div className="mt-auto pt-6">
            <span
              aria-disabled
              className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-full border border-ink/10 bg-cream-soft px-6 text-sm font-semibold text-ink/40"
            >
              Coming next
            </span>
          </div>
        </article>
      </section>
    </div>
  );
}
