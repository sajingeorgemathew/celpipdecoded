import Link from "next/link";

export type MockTestCardData = {
  slug: string;
  title: string;
  description: string | null;
};

// Library card for a single mock test. Links into the test overview, where the
// student picks a skill to practice.
export function MockTestCard({ test }: { test: MockTestCardData }) {
  return (
    <article className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-xl font-semibold tracking-tight text-ink">
          {test.title}
        </h3>
        <span className="shrink-0 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          Reading ready
        </span>
      </div>

      {test.description ? (
        <p className="mt-3 text-sm leading-6 text-ink/70">{test.description}</p>
      ) : null}

      <div className="mt-auto pt-5">
        <Link
          href={`/dashboard/mock-tests/${test.slug}`}
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
        >
          Open mock test
        </Link>
      </div>
    </article>
  );
}
