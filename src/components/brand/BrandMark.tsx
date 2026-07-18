import type { CSSProperties } from "react";
import { brandColors } from "@/config/brand";

// BrandMark is the compact CELPIP Decoded symbol: a rounded navy square with
// white code-style brackets and an emerald centre dot. It renders as inline
// SVG with no raster dependency so it scales cleanly at any size and works as
// a favicon, header mark, avatar, or loading indicator.

type BrandMarkProps = {
  // Rendered width and height in pixels. The mark is always square.
  size?: number;
  className?: string;
  style?: CSSProperties;
  // Accessible label. Pass an empty string when the mark is decorative and a
  // nearby text label already names the product.
  title?: string;
};

export function BrandMark({
  size = 32,
  className,
  style,
  title = "CELPIP Decoded",
}: BrandMarkProps) {
  const decorative = title.length === 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      style={style}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? true : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      {decorative ? null : <title>{title}</title>}
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        fill={brandColors.inkNavy}
      />
      <path
        d="M12 9.5 H9 V22.5 H12"
        fill="none"
        stroke={brandColors.white}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 9.5 H23 V22.5 H20"
        fill="none"
        stroke={brandColors.white}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2.6" fill={brandColors.emeraldTeal} />
    </svg>
  );
}
