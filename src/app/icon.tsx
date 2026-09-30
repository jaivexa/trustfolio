import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Neutral favicon (a kolam-style loop). Upload a logo in Settings for branding. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, background: "#1f4e4a" }}>
        <svg width="44" height="44" viewBox="0 0 48 48">
          <path d="M24 5 Q43 5 43 24 Q43 43 24 43 Q5 43 5 24 Q5 5 24 5Z" fill="none" stroke="#e9c46a" strokeWidth="3" />
          <circle cx="24" cy="24" r="4" fill="#fbf8f1" />
        </svg>
      </div>
    ),
    size,
  );
}
