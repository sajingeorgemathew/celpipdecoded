// Zod schemas for Reading API request payloads. Keeping them here lets both
// the routes and any tests share one definition of a valid request.

import { z } from "zod";

// Start or resume a session. An optional restart flag asks for a brand new
// attempt when the most recent session is already submitted.
export const startSessionSchema = z.object({
  restart: z.boolean().optional().default(false),
});

// Save one answer. A null selected key clears the answer (unanswered). Option
// keys are short, so the length is capped defensively; the server still checks
// the key against the question's real options.
export const saveAnswerSchema = z.object({
  questionId: z.uuid(),
  selectedOptionKey: z.string().trim().min(1).max(8).nullable(),
});

// Persist the current section the student is viewing, for resume.
export const setSectionSchema = z.object({
  sectionNumber: z.number().int().min(1).max(20),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;
export type SetSectionInput = z.infer<typeof setSectionSchema>;
