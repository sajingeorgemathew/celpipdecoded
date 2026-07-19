// Server-side loaders for the Reading engine. These run with a caller-scoped
// Supabase client so row level security still applies: only active tests,
// sections, and questions (without answer keys) are ever returned.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { MockTestRow } from "../types";
import type { ReadingTest } from "./reading-types";
import {
  normalizeReadingTest,
  type QuestionRow,
  type SectionRow,
} from "./reading-content";
import { READING_MODULE_TYPE } from "./reading-session";

// Load an active mock test and its Reading sections and questions. Returns
// null when the test does not exist or is not active. Never selects answer
// keys, so the payload is safe to hand to the client.
export async function loadActiveReadingTest(
  supabase: SupabaseClient,
  slug: string,
): Promise<ReadingTest | null> {
  const { data: test, error: testError } = await supabase
    .from("mock_tests")
    .select(
      "id, slug, title, description, status, content_version, reading_time_seconds, reading_instruction_video_url",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (testError) {
    throw new Error("Could not load this mock test. Please try again.");
  }
  if (!test) {
    return null;
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("mock_test_sections")
    .select(
      "id, section_number, slug, title, instructions, content_json, asset_url, sort_order",
    )
    .eq("mock_test_id", (test as MockTestRow).id)
    .eq("module_type", READING_MODULE_TYPE)
    .order("sort_order", { ascending: true });

  if (sectionsError) {
    throw new Error("Could not load the reading sections. Please try again.");
  }

  const sectionRows = (sections ?? []) as SectionRow[];
  const sectionIds = sectionRows.map((s) => s.id);

  let questionRows: QuestionRow[] = [];
  if (sectionIds.length > 0) {
    const { data: questions, error: questionsError } = await supabase
      .from("mock_test_questions")
      .select(
        "id, section_id, question_number, group_key, prompt, response_type, options_json, sort_order",
      )
      .in("section_id", sectionIds)
      .order("sort_order", { ascending: true });

    if (questionsError) {
      throw new Error("Could not load the reading questions. Please try again.");
    }
    questionRows = (questions ?? []) as QuestionRow[];
  }

  return normalizeReadingTest(test as MockTestRow, sectionRows, questionRows);
}
