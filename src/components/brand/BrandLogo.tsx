import { BrandMark } from "./BrandMark";

// BrandLogo is the full horizontal lockup: the bracket mark on the left, then
// the wordmark with "CELPIP" in bold and "Decoded" in emerald-teal.
//
// Variants:
// - light (default): for warm off-white or white backgrounds, navy wordmark.
// - dark: reversed lockup for navy backgrounds, white wordmark.
// The compact prop tightens spacing and shrinks the mark for mobile headers.

type BrandLogoProps = {
  variant?: "light" | "dark";
  compact?: boolean;
  className?: string;
};

export function BrandLogo({
  variant = "light",
  compact = false,
  className = "",
}: BrandLogoProps) {
  const markSize = compact ? 28 : 34;
  const celpipColor = variant === "dark" ? "text-white" : "text-ink";
  const wordSize = compact ? "text-base" : "text-lg";

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="CELPIP Decoded"
    >
      <BrandMark size={markSize} title="" />
      <span
        className={`whitespace-nowrap font-semibold leading-none tracking-tight ${wordSize}`}
      >
        <span className={celpipColor}>CELPIP</span>{" "}
        <span className="font-bold text-brand">Decoded</span>
      </span>
    </span>
  );
}
