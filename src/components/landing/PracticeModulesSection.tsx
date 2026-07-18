import Link from "next/link";
import { Container, Eyebrow } from "./primitives";

// Practice modules mirror the real product status and routing. Speaking and
// writing are live; reading and listening are marked as coming later. Do not
// advertise functionality that is not implemented.

const modules = [
  {
    name: "CELPIP Speaking Practice",
    body: "Record timed answers in the browser, get a transcript, and receive AI-supported feedback.",
    href: "/dashboard/speaking",
    status: "Available",
    available: true,
  },
  {
    name: "CELPIP Writing Practice",
    body: "Draft responses under realistic time limits with word targets and structured feedback.",
    href: "/dashboard/writing",
    status: "Available",
    available: true,
  },
  {
    name: "CELPIP Reading Practice",
    body: "Guided reading tasks are on the way.",
    href: null,
    status: "Coming later",
    available: false,
  },
  {
    name: "CELPIP Listening Practice",
    body: "Guided listening tasks are on the way.",
    href: null,
    status: "Coming later",
    available: false,
  },
];

export function PracticeModulesSection() {
  return (
    <section id="modules" className="scroll-mt-20 bg-cream-soft text-foreground">
      <Container className="py-20 sm:py-24">
        <div className="max-w-2xl">
          <Eyebrow className="text-brand">Practice modules</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Focus on the skills that need the most work
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {modules.map((module) => (
            <div
              key={module.name}
              className="flex flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-ink/5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-ink">
                  {module.name}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    module.available
                      ? "bg-brand/12 text-brand"
                      : "bg-ink/8 text-ink/55"
                  }`}
                >
                  {module.status}
                </span>
              </div>
              <p className="mt-3 flex-1 leading-7 text-foreground/70">
                {module.body}
              </p>
              {module.available && module.href ? (
                <Link
                  href={module.href}
                  className="mt-6 inline-flex h-11 w-fit items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-cream transition-colors hover:bg-ink-soft"
                >
                  Start practising
                </Link>
              ) : (
                <span className="mt-6 inline-flex h-11 w-fit items-center justify-center rounded-full bg-ink/5 px-6 text-sm font-semibold text-ink/45">
                  Coming later
                </span>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
