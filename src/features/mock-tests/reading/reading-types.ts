// Structured content and state types for the Reading mock-test engine.
//
// All passage and question content is stored as structured data in Supabase
// and rendered with plain React. No executable HTML is stored or rendered, so
// the cloze renderer never needs dangerouslySetInnerHTML.

// A single selectable option for a question.
export type QuestionOption = {
  key: string;
  label: string;
};

// A block of passage content shown in the left panel.
export type PassageBlock =
  | { type: "paragraph"; text: string }
  | { type: "labeled"; label: string; text: string };

// A segment of a cloze block. Text and question references interleave, with
// paragraph breaks between them. A question segment renders the select control
// for that question number inline.
export type ClozeSegment =
  | { type: "text"; text: string }
  | { type: "break" }
  | { type: "question"; number: number };

// A group of questions on the right panel. A standalone group renders numbered
// questions with their own prompts. A cloze group renders a message, email, or
// comment with inline blanks.
export type RightBlock =
  | {
      kind: "standalone";
      intro: string;
      questionNumbers: number[];
    }
  | {
      kind: "cloze";
      intro: string;
      heading?: string | null;
      headerLines?: string[];
      segments: ClozeSegment[];
      signature?: string[];
      questionNumbers: number[];
    };

// The full structured content for one Reading section.
export type SectionContent = {
  layout: "correspondence" | "diagram" | "information" | "viewpoints";
  passage: {
    kind: string;
    instruction?: string;
    imageAlt?: string;
    blocks: PassageBlock[];
  };
  rightBlocks: RightBlock[];
};

// A question as delivered to the client. It never carries the correct answer.
export type ReadingQuestion = {
  id: string;
  sectionNumber: number;
  questionNumber: number;
  groupKey: string;
  prompt: string;
  responseType: "dropdown" | "paragraph_match";
  options: QuestionOption[];
};

// A fully hydrated Reading section, content plus its questions.
export type ReadingSection = {
  id: string;
  sectionNumber: number;
  slug: string;
  title: string;
  instructions: string | null;
  assetUrl: string | null;
  content: SectionContent;
  questions: ReadingQuestion[];
};

// A whole Reading test ready to render.
export type ReadingTest = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  readingTimeSeconds: number;
  instructionVideoUrl: string | null;
  totalQuestions: number;
  sections: ReadingSection[];
};

// Session lifecycle.
export type SessionStatus = "in_progress" | "submitted" | "expired";

// A safe view of a session for the client. Timing comes from the server.
export type ReadingSessionSummary = {
  id: string;
  status: SessionStatus;
  currentSectionNumber: number;
  timeLimitSeconds: number;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
};

// Map of question id to the selected option key, or null when unanswered.
export type AnswerMap = Record<string, string | null>;

// A per-question result row, only available after submission.
export type ResultQuestion = {
  questionId: string;
  sectionNumber: number;
  questionNumber: number;
  correctKey: string;
  selectedKey: string | null;
  isCorrect: boolean;
};

// Per-part correct counts.
export type PerPartScore = {
  sectionNumber: number;
  title: string;
  correct: number;
  total: number;
};

// The graded summary stored on the session after submission. Correct answers
// only appear here, which is why it is written by the server and read only
// once the session is submitted.
export type ReadingResultSummary = {
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  rawScore: number;
  percentage: number;
  perPart: PerPartScore[];
  questions: ResultQuestion[];
};
