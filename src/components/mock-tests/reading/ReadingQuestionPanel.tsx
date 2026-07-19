"use client";

import type {
  AnswerMap,
  ReadingQuestion,
  ReadingSection,
} from "@/features/mock-tests/reading/reading-types";
import { questionsByNumber } from "@/features/mock-tests/reading/reading-content";
import { ReadingQuestionSelect } from "./ReadingQuestionSelect";
import { ReadingClozePassage } from "./ReadingClozePassage";

// Right panel of the exam: the ordered question groups for a section. A
// standalone group is a numbered list of questions; a cloze group is a passage
// with inline blanks. Ordering follows the stored rightBlocks so each part
// reads the way the source intends.
export function ReadingQuestionPanel({
  section,
  answers,
  onAnswerChange,
  disabled = false,
}: {
  section: ReadingSection;
  answers: AnswerMap;
  onAnswerChange: (question: ReadingQuestion, key: string | null) => void;
  disabled?: boolean;
}) {
  const byNumber = questionsByNumber(section);

  return (
    <div className="space-y-6">
      {section.content.rightBlocks.map((block, blockIndex) => {
        if (block.kind === "cloze") {
          return (
            <ReadingClozePassage
              key={blockIndex}
              block={block}
              questionsByNumber={byNumber}
              answers={answers}
              onAnswerChange={onAnswerChange}
              disabled={disabled}
            />
          );
        }

        return (
          <div key={blockIndex} className="space-y-4">
            {block.intro ? (
              <p className="text-sm leading-6 text-ink/70">{block.intro}</p>
            ) : null}
            <ol className="space-y-4">
              {block.questionNumbers.map((number) => {
                const question = byNumber.get(number);
                if (!question) {
                  return null;
                }
                const answered =
                  answers[question.id] !== null &&
                  answers[question.id] !== undefined &&
                  answers[question.id] !== "";
                return (
                  <li
                    key={question.id}
                    className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand"
                        aria-hidden
                      >
                        {question.questionNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        {question.prompt ? (
                          <p className="mb-3 text-sm leading-6 text-ink">
                            {question.prompt}
                          </p>
                        ) : null}
                        <ReadingQuestionSelect
                          question={question}
                          value={answers[question.id] ?? null}
                          onChange={onAnswerChange}
                          disabled={disabled}
                        />
                        <p
                          className={`mt-2 text-xs font-medium ${
                            answered ? "text-brand" : "text-ink/40"
                          }`}
                        >
                          {answered ? "Answered" : "Not answered yet"}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
