import { readingCopy } from "@/features/mock-tests/reading/reading-copy";
import type { ReadingResultSummary } from "@/features/mock-tests/reading/reading-types";

// Raw score summary. Shows totals, the raw score out of the number of
// questions, a percentage, and per-part correct counts. No official CELPIP
// level is generated here.
export function ReadingScoreSummary({
  summary,
}: {
  summary: ReadingResultSummary;
}) {
  const stats = [
    { label: "Questions", value: summary.totalQuestions },
    { label: "Correct", value: summary.correct },
    { label: "Incorrect", value: summary.incorrect },
    { label: "Unanswered", value: summary.unanswered },
  ];

  return (
    <section
      aria-label="Score summary"
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <h2 className="font-serif text-xl font-semibold text-ink">
        Raw score summary
      </h2>

      <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
        <div>
          <p className="text-4xl font-bold tabular-nums text-ink">
            {summary.rawScore}
            <span className="text-xl font-semibold text-ink/50">
              {" "}
              / {summary.totalQuestions}
            </span>
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
            Raw score
          </p>
        </div>
        <div>
          <p className="text-4xl font-bold tabular-nums text-brand">
            {summary.percentage}%
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
            Percentage
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-cream-soft/60 px-4 py-3 text-center"
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              {stat.label}
            </dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-ink">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-ink">Correct by part</h3>
        <ul className="mt-3 space-y-2">
          {summary.perPart.map((part) => (
            <li
              key={part.sectionNumber}
              className="flex items-center justify-between rounded-xl border border-ink/10 px-4 py-2 text-sm"
            >
              <span className="text-ink/80">
                Part {part.sectionNumber}: {part.title}
              </span>
              <span className="font-semibold tabular-nums text-ink">
                {part.correct} / {part.total}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 rounded-xl bg-cream-soft/70 px-4 py-3 text-xs leading-5 text-ink/60">
        {readingCopy.rawScoreNote}
      </p>
    </section>
  );
}
