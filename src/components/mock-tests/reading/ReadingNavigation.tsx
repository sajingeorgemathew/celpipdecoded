"use client";

// Bottom navigation for the exam. Back and Next move between Reading parts. On
// the last part the primary action becomes Submit. All movement is allowed
// before submission, which matches the practice-test rule.
export function ReadingNavigation({
  sectionIndex,
  sectionCount,
  answeredInSection,
  questionsInSection,
  onBack,
  onNext,
  onSubmit,
  submitting,
}: {
  sectionIndex: number;
  sectionCount: number;
  answeredInSection: number;
  questionsInSection: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const isFirst = sectionIndex === 0;
  const isLast = sectionIndex === sectionCount - 1;

  return (
    <div className="flex flex-col gap-3 border-t border-ink/10 bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs font-medium text-ink/60">
        Part {sectionIndex + 1} of {sectionCount}
        <span className="mx-2 text-ink/30">|</span>
        {answeredInSection} of {questionsInSection} answered in this part
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className="inline-flex h-10 items-center justify-center rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink transition-colors hover:bg-cream-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting" : "Submit reading test"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex h-10 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
