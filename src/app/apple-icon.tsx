import { ImageResponse } from "next/og";

// Code-generated Apple touch icon: the CELPIP Decoded bracket mark on a navy
// tile. Kept in sync with src/app/icon.svg and the BrandMark component.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#12314F",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 96,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: -4,
          }}
        >
          <span>[</span>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#0E9F6E",
              margin: "0 6px",
            }}
          />
          <span>]</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
