// Requests AI evaluation for a saved writing attempt from the browser.
// The route runs with the caller's session cookies, so ownership is
// enforced server side. Never import the admin client or any secret
// keys here.

import { writingEvaluationCopy } from "./task-copy";

export type EvaluateWritingAttemptResult =
  | { ok: true; attemptId: string; resultPath: string }
  | { ok: false; message: string };

export async function evaluateWritingAttempt(
  attemptId: string,
): Promise<EvaluateWritingAttemptResult> {
  try {
    const response = await fetch("/api/writing/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId }),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      attemptId?: string;
      resultPath?: string;
      error?: string;
    };

    if (!response.ok || !payload.ok || !payload.attemptId || !payload.resultPath) {
      return {
        ok: false,
        message:
          payload.error ?? writingEvaluationCopy.errors.evaluationFailed,
      };
    }

    return {
      ok: true,
      attemptId: payload.attemptId,
      resultPath: payload.resultPath,
    };
  } catch {
    return {
      ok: false,
      message: writingEvaluationCopy.errors.requestFailed,
    };
  }
}
