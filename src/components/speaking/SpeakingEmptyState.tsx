import Link from "next/link";
import { speakingCopy } from "@/features/speaking/task-copy";

// Shown on /dashboard/speaking when no active speaking tasks exist yet,
// for example before the seed migration has been run.
export function SpeakingEmptyState() {
  return (
    <section className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
      <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
        {speakingCopy.emptyStateMessage}
      </h2>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        Please check back soon. Practice tasks are on the way.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
        >
          {speakingCopy.backToDashboard}
        </Link>
      </div>
    </section>
  );
}
