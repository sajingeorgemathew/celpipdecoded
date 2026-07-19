// Normalizers that turn raw Supabase rows into the structured Reading types
// the UI renders, plus small progress helpers. Kept pure so they are easy to
// test and reuse on the server and the client.

import type { MockTestRow } from "../types";
import type {
  AnswerMap,
  QuestionOption,
  ReadingQuestion,
  ReadingResultSummary,
  ReadingSection,
  ReadingTest,
  SectionContent,
} from "./reading-types";
import { DEFAULT_READING_TIME_SECONDS } from "./reading-timer";

// Raw section row as selected from Supabase.
export type SectionRow = {
  id: string;
  section_number: number;
  slug: string;
  title: string;
  instructions: string | null;
  content_json: unknown;
  asset_url: string | null;
  sort_order: number;
};

// Raw question row as selected from Supabase. The answer key never appears
// here, so this shape is safe to send to the browser.
export type QuestionRow = {
  id: string;
  section_id: string;
  question_number: number;
  group_key: string;
  prompt: string;
  response_type: string;
  options_json: unknown;
  sort_order: number;
};

function toOptions(value: unknown): QuestionOption[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(
      (item): item is { key: unknown; label: unknown } =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      key: String((item as { key: unknown }).key ?? ""),
      label: String((item as { label: unknown }).label ?? ""),
    }))
    .filter((option) => option.key.length > 0);
}

function toResponseType(value: string): ReadingQuestion["responseType"] {
  return value === "paragraph_match" ? "paragraph_match" : "dropdown";
}

function normalizeQuestion(
  row: QuestionRow,
  sectionNumber: number,
): ReadingQuestion {
  return {
    id: row.id,
    sectionNumber,
    questionNumber: row.question_number,
    groupKey: row.group_key,
    prompt: row.prompt ?? "",
    responseType: toResponseType(row.response_type),
    options: toOptions(row.options_json),
  };
}

// Assemble a full Reading test from its rows. Sections and questions are
// sorted deterministically so navigation and numbering are stable.
export function normalizeReadingTest(
  test: MockTestRow,
  sectionRows: SectionRow[],
  questionRows: QuestionRow[],
): ReadingTest {
  const sections: ReadingSection[] = [...sectionRows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((sectionRow) => {
      const questions = questionRows
        .filter((q) => q.section_id === sectionRow.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((q) => normalizeQuestion(q, sectionRow.section_number));

      return {
        id: sectionRow.id,
        sectionNumber: sectionRow.section_number,
        slug: sectionRow.slug,
        title: sectionRow.title,
        instructions: sectionRow.instructions,
        assetUrl: sectionRow.asset_url,
        content: (sectionRow.content_json ?? {}) as SectionContent,
        questions,
      };
    });

  const totalQuestions = sections.reduce(
    (sum, section) => sum + section.questions.length,
    0,
  );

  return {
    id: test.id,
    slug: test.slug,
    title: test.title,
    description: test.description,
    readingTimeSeconds:
      test.reading_time_seconds ?? DEFAULT_READING_TIME_SECONDS,
    instructionVideoUrl: test.reading_instruction_video_url,
    totalQuestions,
    sections,
  };
}

// Flatten every question across the test in section then question order.
export function flattenQuestions(test: ReadingTest): ReadingQuestion[] {
  return test.sections.flatMap((section) => section.questions);
}

// Build a lookup of question number to question within a single section.
export function questionsByNumber(
  section: ReadingSection,
): Map<number, ReadingQuestion> {
  const map = new Map<number, ReadingQuestion>();
  for (const question of section.questions) {
    map.set(question.questionNumber, question);
  }
  return map;
}

// Human-readable label for an option key on a question. Paragraph-match
// questions are shown as "Paragraph A"; drop-down questions show the choice.
export function optionLabelFor(
  question: ReadingQuestion,
  key: string | null,
): string | null {
  if (key === null) {
    return null;
  }
  const option = question.options.find((o) => o.key === key);
  if (!option) {
    return key;
  }
  return question.responseType === "paragraph_match"
    ? `Paragraph ${option.label}`
    : option.label;
}

// A single row in the answer review, with resolved labels for display.
export type ReviewRow = {
  questionId: string;
  sectionNumber: number;
  questionNumber: number;
  prompt: string;
  correctLabel: string;
  studentLabel: string | null;
  isCorrect: boolean;
  answered: boolean;
};

// Combine a stored result summary with the test content to produce review
// rows. The summary carries the graded facts; the test supplies prompts and
// option labels. Missing questions are skipped defensively.
export function buildReviewRows(
  test: ReadingTest,
  summary: ReadingResultSummary,
): ReviewRow[] {
  const questionById = new Map<string, ReadingQuestion>();
  for (const section of test.sections) {
    for (const question of section.questions) {
      questionById.set(question.id, question);
    }
  }

  const rows: ReviewRow[] = [];
  for (const graded of summary.questions) {
    const question = questionById.get(graded.questionId);
    if (!question) {
      continue;
    }
    rows.push({
      questionId: graded.questionId,
      sectionNumber: graded.sectionNumber,
      questionNumber: graded.questionNumber,
      prompt: question.prompt,
      correctLabel:
        optionLabelFor(question, graded.correctKey) ?? graded.correctKey,
      studentLabel: optionLabelFor(question, graded.selectedKey),
      isCorrect: graded.isCorrect,
      answered: graded.selectedKey !== null,
    });
  }

  rows.sort((a, b) => {
    if (a.sectionNumber !== b.sectionNumber) {
      return a.sectionNumber - b.sectionNumber;
    }
    return a.questionNumber - b.questionNumber;
  });

  return rows;
}

// Count how many questions have a non-empty selected answer.
export function countAnswered(
  questions: ReadingQuestion[],
  answers: AnswerMap,
): number {
  let count = 0;
  for (const question of questions) {
    const value = answers[question.id];
    if (value !== null && value !== undefined && value !== "") {
      count += 1;
    }
  }
  return count;
}
