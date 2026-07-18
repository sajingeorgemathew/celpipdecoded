import { Container, Eyebrow } from "./primitives";

const values = [
  {
    step: "01",
    title: "Understand the task",
    body: "Know what each CELPIP task is asking before you begin.",
  },
  {
    step: "02",
    title: "Structure your answer",
    body: "Build responses with a clearer beginning, development, and conclusion.",
  },
  {
    step: "03",
    title: "Improve with feedback",
    body: "Review transcripts, practice estimates, strengths, and next steps.",
  },
];

export function CoreValuesSection() {
  return (
    <section className="bg-cream text-foreground">
      <Container className="py-20 sm:py-24">
        <div className="max-w-2xl">
          <Eyebrow className="text-brand">Why it works</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Decode the test, one answer at a time
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-ink/5"
            >
              <span className="font-mono text-sm font-semibold text-brand">
                {value.step}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-ink">
                {value.title}
              </h3>
              <p className="mt-3 leading-7 text-foreground/70">{value.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
