"use client";

import { useState } from "react";
import type { ReviewRow } from "@/features/mock-tests/reading/reading-content";

// Status shown per question. Meaning is carried by text and a symbol, never by
// colour alone, so the review stays accessible.
function statusMeta(row: ReviewRow): {
  label: string;
  symbol: string;
  className: string;
} {
  if (!row.answered) {
    return {
      label: "Unanswered",
      symbol: "–",
      className: "bg-cream-soft text-ink/70",
    };
  }
  if (row.isCorrect) {
    return {
      label: "Correct",
      symbol: "✓",
      className: "bg-emerald-100 text-emerald-800",
    };
  }
  return {
    label: "Incorrect",
    symbol: "✗",
    className: "bg-red-100 text-red-800",
  };
}

// Answer review with a per-part filter. Shows the student answer and the
// correct answer for every question, grouped and filterable by Reading part.
export function ReadingResultReview({
  rows,
  parts,
}: {
  rows: ReviewRow[];
  parts: { sectionNumber: number; title: string }[];
}) {
  const [activePart, setActivePart] = useState<number | "all">("all");

  const visibleRows =
    activePart === "all"
      ? rows
      : rows.filter((row) => row.sectionNumber === activePart);

  const partTitle = (sectionNumber: number) =>
    parts.find((p) => p.sectionNumber === sectionNumber)?.title ??
    `Part ${sectionNumber}`;

  return (
    <section
      aria-label="Answer review"
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8"
    >
      <h2 className="font-serif text-xl font-semibold text-ink">
        Answer review
      </h2>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by part">
        <button
          type="button"
          onClick={() => setActivePart("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            activePart === "all"
              ? "bg-ink text-white"
              : "border border-ink/15 text-ink/70 hover:bg-cream-soft"
          }`}
          aria-pressed={activePart === "all"}
        >
          All parts
        </button>
        {parts.map((part) => (
          <button
            key={part.sectionNumber}
            type="button"
            onClick={() => setActivePart(part.sectionNumber)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              activePart === part.sectionNumber
                ? "bg-ink text-white"
                : "border border-ink/15 text-ink/70 hover:bg-cream-soft"
            }`}
            aria-pressed={activePart === part.sectionNumber}
          >
            Part {part.sectionNumber}
          </button>
        ))}
      </div>

      <ul className="mt-5 space-y-3">
        {visibleRows.map((row) => {
          const status = statusMeta(row);
          return (
            <li
              key={row.questionId}
              className="rounded-2xl border border-ink/10 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {partTitle(row.sectionNumber)} · Question {row.questionNumber}
                </p>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                >
                  <span aria-hidden>{status.symbol}</span>
                  {status.label}
                </span>
              </div>

              {row.prompt ? (
                <p className="mt-2 text-sm leading-6 text-ink">{row.prompt}</p>
              ) : null}

              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-cream-soft/60 px-3 py-2">
                  <dt className="text-xs font-semibold text-ink/50">
                    Your answer
                  </dt>
                  <dd className="mt-0.5 text-sm text-ink">
                    {row.studentLabel ?? "Not answered"}
                  </dd>
                </div>
                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <dt className="text-xs font-semibold text-emerald-700">
                    Correct answer
                  </dt>
                  <dd className="mt-0.5 text-sm text-ink">{row.correctLabel}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
