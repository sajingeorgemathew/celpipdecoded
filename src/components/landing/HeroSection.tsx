import Link from "next/link";
import { Container, Eyebrow } from "./primitives";
import { brand } from "@/config/brand";

// First-pass CELPIP Decoded hero. The visual is a branded composition built
// from brackets, an emerald dot, a timer, and an answer-structure card. It does
// not depend on any photograph.

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-cream">
      {/* Soft emerald glow behind the preview. */}
      <div
        aria-hidden
        className="absolute -right-40 top-1/3 -z-10 h-[32rem] w-[32rem] rounded-full bg-brand/20 blur-3xl"
      />

      <Container className="grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <Eyebrow className="text-brand">{brand.heroEyebrow}</Eyebrow>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-cream sm:text-5xl lg:text-[3.4rem]">
            {brand.tagline}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-cream/80">
            Learn the response structure CELPIP rewards, practise under realistic
            time limits, and get clear feedback on what to improve next.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/signup"
              className="inline-flex h-13 items-center justify-center rounded-full bg-brand px-7 text-base font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
            >
              Start practising
            </Link>
            <Link
              href="/login"
              className="inline-flex h-13 items-center justify-center rounded-full px-7 text-base font-semibold text-cream ring-1 ring-cream/30 transition-colors hover:bg-cream/10"
            >
              Sign in
            </Link>
          </div>
        </div>

        <HeroPreview />
      </Container>
    </section>
  );
}

// Abstract preview of the practice interface, drawn entirely with layout and
// SVG so it needs no image assets.
function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="rounded-3xl border border-cream/10 bg-ink-soft/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
        {/* Timer row. */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
            Speaking Task 1
          </span>
          <span className="font-mono text-sm font-semibold text-cream/80">
            00:45
          </span>
        </div>

        {/* Bracket motif with centre dot. */}
        <div className="mt-6 flex items-center justify-center gap-3 py-4 text-cream/70">
          <span className="text-5xl font-bold leading-none text-cream/40">
            [
          </span>
          <span aria-hidden className="h-3 w-3 rounded-full bg-brand" />
          <span className="text-5xl font-bold leading-none text-cream/40">
            ]
          </span>
        </div>

        {/* Answer-structure card. */}
        <div className="mt-4 space-y-3">
          {[
            { label: "Opening", tone: "bg-brand/70" },
            { label: "Development", tone: "bg-brand/45" },
            { label: "Conclusion", tone: "bg-brand/25" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-3 rounded-xl bg-cream/5 px-3 py-2.5"
            >
              <span
                aria-hidden
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${row.tone}`}
              />
              <span className="text-sm font-medium text-cream/85">
                {row.label}
              </span>
            </div>
          ))}
        </div>

        {/* Feedback chip. */}
        <div className="mt-5 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Next step
          </p>
          <p className="mt-1 text-sm leading-6 text-cream/80">
            Add a clear closing sentence to signal you are finished.
          </p>
        </div>
      </div>
    </div>
  );
}
