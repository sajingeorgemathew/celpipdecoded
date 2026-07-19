"use client";

import { Fragment } from "react";
import type {
  AnswerMap,
  ReadingQuestion,
  RightBlock,
} from "@/features/mock-tests/reading/reading-types";
import { ReadingQuestionSelect } from "./ReadingQuestionSelect";

// Renders a cloze block (message, email, or comment) with inline drop-downs.
// Content is a structured segment list, so no HTML is ever injected. Each
// question segment renders the select control for that numbered blank.
export function ReadingClozePassage({
  block,
  questionsByNumber,
  answers,
  onAnswerChange,
  disabled = false,
}: {
  block: Extract<RightBlock, { kind: "cloze" }>;
  questionsByNumber: Map<number, ReadingQuestion>;
  answers: AnswerMap;
  onAnswerChange: (question: ReadingQuestion, key: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5">
      {block.intro ? (
        <p className="mb-4 text-sm leading-6 text-ink/70">{block.intro}</p>
      ) : null}

      {block.headerLines && block.headerLines.length > 0 ? (
        <div className="mb-4 rounded-lg bg-cream-soft/60 px-3 py-2 text-xs leading-5 text-ink/70">
          {block.headerLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      ) : null}

      {block.heading ? (
        <p className="mb-2 text-sm font-semibold text-ink">{block.heading}</p>
      ) : null}

      <p className="text-sm leading-8 text-ink">
        {block.segments.map((segment, index) => {
          if (segment.type === "break") {
            return <span key={index} className="block h-3" aria-hidden />;
          }
          if (segment.type === "text") {
            return <Fragment key={index}>{segment.text}</Fragment>;
          }
          const question = questionsByNumber.get(segment.number);
          if (!question) {
            return null;
          }
          return (
            <span
              key={index}
              className="mx-0.5 inline-flex items-baseline align-baseline"
            >
              <span
                aria-hidden
                className="mr-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink/10 px-1 text-xs font-semibold text-ink/70"
              >
                {question.questionNumber}
              </span>
              <ReadingQuestionSelect
                question={question}
                value={answers[question.id] ?? null}
                onChange={onAnswerChange}
                disabled={disabled}
                compact
              />
            </span>
          );
        })}
      </p>

      {block.signature && block.signature.length > 0 ? (
        <div className="mt-4 text-sm leading-6 text-ink">
          {block.signature.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
