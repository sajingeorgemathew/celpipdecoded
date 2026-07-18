// Central brand configuration for CELPIP Decoded.
//
// Keep long brand strings, colours, and metadata defaults here so individual
// components do not repeat them. Import from this file instead of hardcoding
// the product name, tagline, or palette in unrelated components.

export const brand = {
  productName: "CELPIP Decoded",
  shortName: "CELPIP Decoded",

  // Primary brand statement used on the landing hero.
  tagline:
    "You're not bad at English. You just don't know how CELPIP wants you to answer.",

  // Short label used above the hero headline.
  heroEyebrow: "CELPIP practice, decoded.",

  description:
    "Practice CELPIP speaking and writing with guided test-style tasks, timed sessions, transcripts, and AI-supported feedback.",

  // Independent-practice disclaimer used in footers and result screens.
  disclaimer:
    "CELPIP Decoded is not affiliated with or endorsed by CELPIP and does not provide official CELPIP scores.",

  // Short version of the disclaimer for compact spaces.
  disclaimerShort:
    "Practice estimates and AI feedback are for preparation only and are not official CELPIP scores.",

  // Support or contact placeholder. No real address is claimed yet.
  supportEmail: "",
} as const;

// Brand colour palette. These mirror the CSS custom properties in
// src/app/globals.css so code that needs a raw hex value stays consistent.
export const brandColors = {
  inkNavy: "#12314F",
  emeraldTeal: "#0E9F6E",
  warmOffWhite: "#F4F1EA",
  white: "#FFFFFF",
} as const;

// Metadata defaults shared by the root layout.
export const brandMetadata = {
  title: "CELPIP Decoded - Understand the Test. Structure Better Answers.",
  titleTemplate: "%s - CELPIP Decoded",
  themeColor: brandColors.inkNavy,
} as const;
