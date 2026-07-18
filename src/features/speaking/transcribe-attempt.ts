// Server-side transcription pipeline for a speaking attempt. Verifies
// that the attempt belongs to the given user, downloads the private
// audio from Supabase Storage, sends it to OpenAI transcription, and
// saves the transcript back onto the attempt row.
//
// This module uses the service role client and the OpenAI API key, so
// it must only run on the server. Never import it into client
// components; the browser talks to /api/speaking/transcribe instead.

import OpenAI, { toFile } from "openai";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ATTEMPT_AUDIO_BUCKET } from "./audio-utils";
import { transcriptCopy } from "./practice-flow";

const DEFAULT_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";

// Keeps the model focused on faithful transcription. The transcript
// must reflect what the student said, not what they should have said.
const TRANSCRIPTION_PROMPT =
  "This is a CELPIP speaking practice response from an English-language " +
  "test preparation student. Preserve the speaker's wording as accurately " +
  "as possible. Do not correct grammar. Do not rewrite the answer.";

type AttemptRow = {
  id: string;
  user_id: string;
  status: string;
  audio_path: string | null;
  transcript: string | null;
};

export type TranscribeAttemptInput = {
  attemptId: string;
  userId: string;
};

export type TranscribeAttemptResult =
  | { ok: true; attemptId: string; transcript: string }
  | { ok: false; status: number; message: string };

// Best effort failure marker so the attempt is retryable and never
// stuck in "transcribing". Keeps audio_path untouched.
async function markTranscriptionFailed(attemptId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("attempts")
    .update({ status: "transcription_failed" })
    .eq("id", attemptId);

  if (error) {
    console.error("Could not mark attempt as failed:", error.message);
  }
}

export async function transcribeAttempt(
  input: TranscribeAttemptInput,
): Promise<TranscribeAttemptResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Transcription is not configured: OPENAI_API_KEY is missing.");
    return {
      ok: false,
      status: 503,
      message: transcriptCopy.errors.notConfigured,
    };
  }

  const supabase = getSupabaseAdmin();

  // 1. Fetch the attempt and verify ownership before touching storage.
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select("id, user_id, status, audio_path, transcript")
    .eq("id", input.attemptId)
    .maybeSingle<AttemptRow>();

  if (attemptError) {
    console.error("Attempt lookup failed:", attemptError.message);
    return {
      ok: false,
      status: 500,
      message: transcriptCopy.errors.requestFailed,
    };
  }

  if (!attempt) {
    return {
      ok: false,
      status: 404,
      message: transcriptCopy.errors.attemptNotFound,
    };
  }

  if (attempt.user_id !== input.userId) {
    return {
      ok: false,
      status: 403,
      message: transcriptCopy.errors.attemptNotOwned,
    };
  }

  // A finished attempt returns its saved transcript, so a repeat click
  // never pays for a second OpenAI call.
  if (attempt.status === "transcribed" && attempt.transcript) {
    return { ok: true, attemptId: attempt.id, transcript: attempt.transcript };
  }

  if (!attempt.audio_path) {
    return {
      ok: false,
      status: 409,
      message: transcriptCopy.errors.audioMissing,
    };
  }

  // 2. Mark the attempt as in progress. A failure here is logged but
  // not fatal; the status is a progress marker, not a lock.
  const { error: markError } = await supabase
    .from("attempts")
    .update({ status: "transcribing" })
    .eq("id", attempt.id);

  if (markError) {
    console.error("Could not mark attempt as transcribing:", markError.message);
  }

  // 3. Download the private audio server side. No signed URL is created
  // and the file is never exposed publicly.
  const { data: audio, error: downloadError } = await supabase.storage
    .from(ATTEMPT_AUDIO_BUCKET)
    .download(attempt.audio_path);

  if (downloadError || !audio) {
    console.error(
      "Audio download failed:",
      downloadError?.message ?? "empty file",
    );
    await markTranscriptionFailed(attempt.id);
    return {
      ok: false,
      status: 502,
      message: transcriptCopy.errors.audioDownloadFailed,
    };
  }

  // 4. Send the audio to OpenAI. The blob is wrapped as a named file so
  // the API can detect the container format, for example webm or mp4.
  const fileName = attempt.audio_path.split("/").pop() || "answer.webm";
  let transcript = "";

  try {
    const openai = new OpenAI({ apiKey });
    const result = await openai.audio.transcriptions.create({
      file: await toFile(audio, fileName),
      model:
        process.env.OPENAI_TRANSCRIPTION_MODEL || DEFAULT_TRANSCRIPTION_MODEL,
      language: "en",
      response_format: "json",
      prompt: TRANSCRIPTION_PROMPT,
    });
    transcript = result.text?.trim() ?? "";
  } catch (err) {
    console.error("OpenAI transcription failed:", err);
    await markTranscriptionFailed(attempt.id);
    return {
      ok: false,
      status: 502,
      message: transcriptCopy.errors.transcriptionFailed,
    };
  }

  // An empty transcript usually means silence or an unreadable file.
  // Treat it as a failure so the student knows to retry or re-record.
  if (!transcript) {
    await markTranscriptionFailed(attempt.id);
    return {
      ok: false,
      status: 502,
      message: transcriptCopy.errors.transcriptionFailed,
    };
  }

  // 5. Save the transcript and finish. audio_path stays untouched.
  const { error: saveError } = await supabase
    .from("attempts")
    .update({ status: "transcribed", transcript })
    .eq("id", attempt.id);

  if (saveError) {
    console.error("Transcript save failed:", saveError.message);
    await markTranscriptionFailed(attempt.id);
    return {
      ok: false,
      status: 500,
      message: transcriptCopy.errors.transcriptSaveFailed,
    };
  }

  return { ok: true, attemptId: attempt.id, transcript };
}
