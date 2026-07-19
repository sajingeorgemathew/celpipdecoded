"use client";

import type { ReadingQuestion } from "@/features/mock-tests/reading/reading-types";

// Accessible drop-down for a single Reading question. Used inline in cloze
// blocks and in standalone question lists. The default option reads "Select an
// answer" so an unanswered question is obvious. Keyboard navigation is native
// to the select element.
export function ReadingQuestionSelect({
  question,
  value,
  onChange,
  disabled = false,
  compact = false,
}: {
  question: ReadingQuestion;
  value: string | null;
  onChange: (question: ReadingQuestion, key: string | null) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const selectId = `question-${question.id}`;
  const labelText = question.prompt
    ? `Question ${question.questionNumber}: ${question.prompt}`
    : `Question ${question.questionNumber}`;

  return (
    <span className={compact ? "inline-flex align-baseline" : "block"}>
      <label htmlFor={selectId} className="sr-only">
        {labelText}
      </label>
      <select
        id={selectId}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) =>
          onChange(question, event.target.value === "" ? null : event.target.value)
        }
        className={`rounded-lg border border-ink/20 bg-white text-ink shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:bg-cream-soft ${
          compact
            ? "mx-1 my-0.5 max-w-full px-2 py-1 text-sm"
            : "w-full px-3 py-2 text-sm"
        } ${value ? "" : "text-ink/60"}`}
      >
        <option value="">Select an answer</option>
        {question.options.map((option) => (
          <option key={option.key} value={option.key}>
            {question.responseType === "paragraph_match"
              ? `Paragraph ${option.label}`
              : option.label}
          </option>
        ))}
      </select>
    </span>
  );
}
