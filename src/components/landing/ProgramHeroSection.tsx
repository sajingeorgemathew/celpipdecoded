import Image from "next/image";
import Link from "next/link";
import { Container, Eyebrow } from "./primitives";

export function ProgramHeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-cream">
      {/* Soft brand glow behind the collage side. */}
      <div
        aria-hidden
        className="absolute -right-40 top-1/3 -z-10 h-[32rem] w-[32rem] rounded-full bg-brand/20 blur-3xl"
      />

      <Container className="grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-28">
        <div>
          <Eyebrow className="text-brand">CELPIP Preparation Program</Eyebrow>

          <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl">
            Prepare for CELPIP with Toronto Academy of Education.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-cream/80">
            Build confidence with live classes, guided practice, and
            AI-supported speaking feedback designed for CELPIP test-takers.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#inquiry"
              className="inline-flex h-13 items-center justify-center rounded-full bg-brand px-7 text-base font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
            >
              Get CELPIP program information
            </a>
            <Link
              href="/signup"
              className="inline-flex h-13 items-center justify-center rounded-full px-7 text-base font-semibold text-cream ring-1 ring-cream/30 transition-colors hover:bg-cream/10"
            >
              Try AI speaking practice
            </Link>
          </div>

          <p className="mt-8 max-w-md text-sm leading-6 text-cream/60">
            Live class options, practice reports, and AI-supported practice
            feedback, all in one CELPIP preparation program.
          </p>
        </div>

        {/* Floating photo collage. */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div className="relative aspect-[3/4] -rotate-1 overflow-hidden rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-cream/10">
              <Image
                src="/img2.jpg"
                alt="A student giving a thumbs up beside a Toronto Academy of Education banner"
                fill
                priority
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 220px, 320px"
                className="object-cover"
              />
            </div>
            <div className="relative mt-10 aspect-[3/4] rotate-1 overflow-hidden rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-cream/10">
              <Image
                src="/img3.jpg"
                alt="Two students standing beside a Toronto Academy of Education banner"
                fill
                priority
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 220px, 320px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
