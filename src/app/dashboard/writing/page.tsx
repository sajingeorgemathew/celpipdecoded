import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WritingEmptyState } from "@/components/writing/WritingEmptyState";
import { WritingHero } from "@/components/writing/WritingHero";
import { WritingTaskGrid } from "@/components/writing/WritingTaskGrid";
import type { WritingTaskRow } from "@/features/writing/task-types";
import { normalizeWritingTask } from "@/features/writing/task-utils";

export const metadata: Metadata = {
  title: "CELPIP Writing Practice",
  description:
    "Practice CELPIP writing tasks with CELPIP Decoded practice prompts, timing, and word targets.",
};

// Writing module overview: hero and the task library grouped by the two
// CELPIP writing task types.
export default async function WritingPage() {
  const supabase = await createSupabaseServerClient();

  // The dashboard layout already checks the session, but layouts do not
  // re-render on client navigation, so the page verifies it again close
  // to the data.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      "id, task_type, title, prompt, status, sort_order, modules!inner(slug), writing_task_details(task_number, time_seconds, word_min, word_max, evaluation_focus)",
    )
    .eq("modules.slug", "celpip-writing")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("Could not load writing tasks. Please try again.");
  }

  const taskList = ((tasks ?? []) as unknown as WritingTaskRow[]).map(
    normalizeWritingTask,
  );

  return (
    <>
      <WritingHero />

      {taskList.length === 0 ? (
        <WritingEmptyState />
      ) : (
        <WritingTaskGrid tasks={taskList} />
      )}
    </>
  );
}
