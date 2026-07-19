import Link from "next/link";

// End-of-Reading screen. Confirms the test is finished and offers the review,
// the score summary, and clear exits. Writing stays marked coming next.
export function ReadingEndScreen({
  testSlug,
  timedOut,
}: {
  testSlug: string;
  timedOut: boolean;
}) {
  return (
    <section className="rounded-3xl bg-ink p-6 text-white shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        Reading complete
      </p>
      <h1 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
        This is the end of the Reading test.
      </h1>
      {timedOut ? (
        <p className="mt-3 text-sm text-white/70">
          Time ran out, so your saved answers were submitted and graded
          automatically.
        </p>
      ) : (
        <p className="mt-3 text-sm text-white/70">
          Your answers have been submitted and graded. Review them below.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="#answer-review"
          className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-ink transition-colors hover:bg-white/90"
        >
          View answer review
        </a>
        <a
          href="#score-summary"
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          View score summary
        </a>
        <Link
          href={`/dashboard/mock-tests/${testSlug}`}
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Return to Mock Test 1
        </Link>
        <Link
          href="/dashboard/mock-tests"
          className="inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-white/70 transition-colors hover:text-white"
        >
          Return to Mock Tests
        </Link>
      </div>

      <p className="mt-6 text-xs text-white/50">
        Writing mock test: coming next.
      </p>
    </section>
  );
}
