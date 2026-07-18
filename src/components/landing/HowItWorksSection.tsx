import { Container, Eyebrow } from "./primitives";

const steps = [
  {
    step: "1",
    title: "Choose a task",
    body: "Pick a CELPIP speaking or writing task to work on.",
  },
  {
    step: "2",
    title: "Complete a timed response",
    body: "Answer under realistic CELPIP time limits.",
  },
  {
    step: "3",
    title: "Review feedback",
    body: "Read your transcript, practice estimate, strengths, and next steps.",
  },
  {
    step: "4",
    title: "Practise again",
    body: "Return with a clearer strategy and build a steady habit.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-ink text-cream">
      <Container className="py-20 sm:py-24">
        <div className="max-w-2xl">
          <Eyebrow className="text-brand">How it works</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-cream sm:text-4xl">
            A simple loop you can repeat
          </h2>
        </div>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li
              key={step.step}
              className="rounded-3xl border border-cream/10 bg-cream/5 p-7"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
                {step.step}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-cream">
                {step.title}
              </h3>
              <p className="mt-2 leading-7 text-cream/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
