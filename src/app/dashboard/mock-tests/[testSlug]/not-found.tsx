import Link from "next/link";

// Shown when a mock test, or a resource inside it, cannot be found or is not
// available. Every not-found state offers a clear next action.
export default function MockTestNotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
      <h1 className="font-serif text-2xl font-semibold text-ink">
        We could not find that mock test
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        The mock test may not be available yet, or the link may be incorrect.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard/mock-tests"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
        >
          Back to mock tests
        </Link>
      </div>
    </section>
  );
}
