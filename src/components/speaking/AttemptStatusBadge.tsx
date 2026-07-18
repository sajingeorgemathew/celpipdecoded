import {
  getAttemptStatusLabel,
  getAttemptStatusTone,
  type StatusTone,
} from "@/features/speaking/attempt-history";

// Pill colors per status tone. Ready uses the brand accent, working
// states stay warm, and failed states use a soft alert red.
const TONE_CLASSES: Record<StatusTone, string> = {
  ready: "bg-brand/10 text-brand",
  working: "bg-amber-100/70 text-amber-800",
  failed: "bg-red-100/70 text-red-700",
  neutral: "bg-ink/5 text-ink/60",
};

// Small status pill for an attempt, shown in history rows and cards.
export function AttemptStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[getAttemptStatusTone(status)]}`}
    >
      {getAttemptStatusLabel(status)}
    </span>
  );
}
