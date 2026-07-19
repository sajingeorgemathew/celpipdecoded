// Pure scoring helpers for the Reading engine. Grading always runs on the
// server, but the maths lives here as pure functions so it is easy to test and
// reason about. Nothing here reads the database or trusts a client score.

import type {
  PerPartScore,
  ReadingResultSummary,
  ResultQuestion,
} from "./reading-types";

// A minimal question shape needed to grade, plus its correct key.
export type GradableQuestion = {
  questionId: string;
  sectionNumber: number;
  questionNumber: number;
  correctKey: string;
};

// Normalize a selected option key. Blank, whitespace, or missing values become
// null, which counts as unanswered. Everything else is trimmed and uppercased,
// since option keys are stored as single uppercase letters.
export function normalizeOptionKey(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = String(value).trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed.toUpperCase();
}

// Compute a percentage rounded to a whole number.
export function toPercentage(correct: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((correct / total) * 100);
}

// Grade a set of answers against the answer keys. Returns a full result
// summary including per-question correctness for review and per-part totals.
// answersByQuestionId maps a question id to the raw selected key or null.
export function gradeReading(
  questions: GradableQuestion[],
  answersByQuestionId: Record<string, string | null>,
  sectionTitles: Record<number, string>,
): ReadingResultSummary {
  const resultQuestions: ResultQuestion[] = [];
  const perPartMap = new Map<number, PerPartScore>();

  let correct = 0;
  let unanswered = 0;

  for (const question of questions) {
    const selectedKey = normalizeOptionKey(
      answersByQuestionId[question.questionId],
    );
    const correctKey = normalizeOptionKey(question.correctKey) ?? "";
    const isCorrect = selectedKey !== null && selectedKey === correctKey;

    if (selectedKey === null) {
      unanswered += 1;
    }
    if (isCorrect) {
      correct += 1;
    }

    resultQuestions.push({
      questionId: question.questionId,
      sectionNumber: question.sectionNumber,
      questionNumber: question.questionNumber,
      correctKey,
      selectedKey,
      isCorrect,
    });

    const part = perPartMap.get(question.sectionNumber) ?? {
      sectionNumber: question.sectionNumber,
      title: sectionTitles[question.sectionNumber] ?? `Part ${question.sectionNumber}`,
      correct: 0,
      total: 0,
    };
    part.total += 1;
    if (isCorrect) {
      part.correct += 1;
    }
    perPartMap.set(question.sectionNumber, part);
  }

  const total = questions.length;
  const incorrect = total - correct - unanswered;

  const perPart = Array.from(perPartMap.values()).sort(
    (a, b) => a.sectionNumber - b.sectionNumber,
  );

  resultQuestions.sort((a, b) => {
    if (a.sectionNumber !== b.sectionNumber) {
      return a.sectionNumber - b.sectionNumber;
    }
    return a.questionNumber - b.questionNumber;
  });

  return {
    totalQuestions: total,
    correct,
    incorrect,
    unanswered,
    rawScore: correct,
    percentage: toPercentage(correct, total),
    perPart,
    questions: resultQuestions,
  };
}
