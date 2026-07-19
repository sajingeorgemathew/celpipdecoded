"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AnswerMap,
  ReadingQuestion,
  ReadingSessionSummary,
  ReadingTest,
} from "@/features/mock-tests/reading/reading-types";
import {
  countAnswered,
  flattenQuestions,
} from "@/features/mock-tests/reading/reading-content";
import {
  getRemainingSeconds,
  isInWarningWindow,
  nowMs,
  toMillis,
} from "@/features/mock-tests/reading/reading-timer";
import { readingCopy } from "@/features/mock-tests/reading/reading-copy";
import { ReadingExamHeader } from "./ReadingExamHeader";
import { ReadingPassagePanel } from "./ReadingPassagePanel";
import { ReadingQuestionPanel } from "./ReadingQuestionPanel";
import { ReadingNavigation } from "./ReadingNavigation";
import type { SaveState } from "./ReadingSaveStatus";

const SAVE_DEBOUNCE_MS = 400;

// The active Reading exam. Owns answer state, autosave, the countdown, section
// navigation, and submission. The countdown is derived from the server
// expires_at, so refresh and revisit never reset it. The final submitted time
// is decided by the server, never by this browser countdown.
export function ReadingExamShell({
  test,
  session,
  initialAnswers,
  testSlug,
}: {
  test: ReadingTest;
  session: ReadingSessionSummary;
  initialAnswers: AnswerMap;
  testSlug: string;
}) {
  const router = useRouter();

  const exitHref = `/dashboard/mock-tests/${testSlug}`;
  const resultsHref = `/dashboard/mock-tests/${testSlug}/reading/results/${session.id}`;

  const expiresAtMs = toMillis(session.expiresAt) ?? nowMs();
  const sectionCount = test.sections.length;
  const allQuestions = flattenQuestions(test);
  const totalQuestions = test.totalQuestions;

  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [sectionIndex, setSectionIndex] = useState(() => {
    const fromSession = session.currentSectionNumber - 1;
    if (fromSession < 0) return 0;
    if (fromSession > sectionCount - 1) return sectionCount - 1;
    return fromSession;
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingSeconds(expiresAtMs, nowMs()),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const pendingRef = useRef<Map<string, string | null>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittingRef = useRef(false);
  const savedResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitFnRef = useRef<() => void>(() => {});

  const section = test.sections[sectionIndex];

  // Send any queued answers to the server. Failed writes stay queued so the
  // student can retry, and are never dropped. Function declarations are
  // hoisted, which keeps the mutual reference with handleSubmit clean.
  async function flushSaves() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const entries = Array.from(pendingRef.current.entries());
    if (entries.length === 0) {
      return;
    }
    setSaveState("saving");

    let expired = false;
    let failed = false;
    for (const [questionId, key] of entries) {
      try {
        const response = await fetch(
          `/api/mock-tests/reading/sessions/${session.id}/answers`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionId, selectedOptionKey: key }),
          },
        );
        if (response.ok) {
          if (pendingRef.current.get(questionId) === key) {
            pendingRef.current.delete(questionId);
          }
        } else {
          const data = await response.json().catch(() => ({}));
          if (data && data.code === "expired") {
            expired = true;
          }
          failed = true;
        }
      } catch {
        failed = true;
      }
    }

    if (expired) {
      submitFnRef.current();
      return;
    }
    if (failed) {
      setSaveState("error");
      return;
    }
    setSaveState("saved");
    if (savedResetRef.current) clearTimeout(savedResetRef.current);
    savedResetRef.current = setTimeout(() => setSaveState("idle"), 1500);
  }

  function scheduleFlush() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void flushSaves();
    }, SAVE_DEBOUNCE_MS);
  }

  function handleAnswerChange(question: ReadingQuestion, key: string | null) {
    setAnswers((current) => ({ ...current, [question.id]: key }));
    pendingRef.current.set(question.id, key);
    scheduleFlush();
  }

  function persistSection(nextIndex: number) {
    // Best effort: a failed section save only affects where a resume lands.
    void fetch(`/api/mock-tests/reading/sessions/${session.id}/section`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionNumber: nextIndex + 1 }),
    }).catch(() => undefined);
  }

  function goToSection(nextIndex: number) {
    const clamped = Math.max(0, Math.min(sectionCount - 1, nextIndex));
    setSectionIndex(clamped);
    persistSection(clamped);
    if (typeof document !== "undefined") {
      const scroller = document.getElementById("reading-question-scroll");
      scroller?.scrollTo({ top: 0 });
      window.scrollTo({ top: 0 });
    }
  }

  async function handleSubmit() {
    if (submittingRef.current) {
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    // Save anything still queued before grading.
    await flushSaves();

    try {
      const response = await fetch(
        `/api/mock-tests/reading/sessions/${session.id}/submit`,
        { method: "POST" },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setSubmitError(data.error ?? readingCopy.errors.submitFailed);
        submittingRef.current = false;
        setSubmitting(false);
        return;
      }
      router.push(resultsHref);
    } catch {
      setSubmitError(readingCopy.errors.submitFailed);
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  // Keep the latest submit function reachable from flushSaves and the timer
  // without recreating those effects on every render.
  useEffect(() => {
    submitFnRef.current = () => {
      void handleSubmit();
    };
  });

  // Countdown tick from the server deadline. Auto-submits once at zero.
  useEffect(() => {
    const tick = () => {
      const remaining = getRemainingSeconds(expiresAtMs, nowMs());
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        submitFnRef.current();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAtMs]);

  // Clear pending timers on unmount so nothing fires after leaving the page.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedResetRef.current) clearTimeout(savedResetRef.current);
    };
  }, []);

  const answeredTotal = countAnswered(allQuestions, answers);
  const answeredInSection = countAnswered(section.questions, answers);
  const warning = isInWarningWindow(remainingSeconds);
  const expired = remainingSeconds <= 0;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-cream">
      <ReadingExamHeader
        testTitle={test.title}
        sectionTitle={section.title}
        sectionIndex={sectionIndex}
        sectionCount={sectionCount}
        remainingSeconds={remainingSeconds}
        warning={warning}
        expired={expired}
        saveState={saveState}
        onRetrySave={() => void flushSaves()}
        exitHref={exitHref}
        answeredTotal={answeredTotal}
        totalQuestions={totalQuestions}
      />

      {submitError ? (
        <div
          role="alert"
          className="bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-700"
        >
          {submitError}
        </div>
      ) : null}

      <main className="flex-1 overflow-y-auto lg:overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 lg:h-full lg:grid-cols-2">
          <section
            aria-label={`${section.title} passage`}
            className="px-4 py-5 sm:px-6 lg:h-full lg:overflow-y-auto lg:border-r lg:border-ink/10"
          >
            <ReadingPassagePanel section={section} />
          </section>

          <section
            id="reading-question-scroll"
            aria-label={`${section.title} questions`}
            className="px-4 py-5 sm:px-6 lg:h-full lg:overflow-y-auto"
          >
            <ReadingQuestionPanel
              section={section}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              disabled={submitting}
            />
          </section>
        </div>
      </main>

      <ReadingNavigation
        sectionIndex={sectionIndex}
        sectionCount={sectionCount}
        answeredInSection={answeredInSection}
        questionsInSection={section.questions.length}
        onBack={() => goToSection(sectionIndex - 1)}
        onNext={() => goToSection(sectionIndex + 1)}
        onSubmit={() => void handleSubmit()}
        submitting={submitting}
      />
    </div>
  );
}
