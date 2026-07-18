import Link from "next/link";
import { historyCopy } from "@/features/speaking/attempt-history";

// Shown on the attempt history page when the user has no attempts yet.
export function EmptyAttemptsState() {
  return (
    <section className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
      <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
        {historyCopy.emptyHeading}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/70">
        {historyCopy.emptyText}
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard/speaking"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
        >
          {historyCopy.emptyButton}
        </Link>
      </div>
    </section>
  );
}
