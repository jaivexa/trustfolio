import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Branded Open Graph card used by the site root and project pages. */
export function renderOgImage({ eyebrow, title, subtitle, footer }: { eyebrow: string; title: string; subtitle?: string; footer: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0f1020 0%, #1e1b4b 55%, #0e3a4a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#a5b4fc" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#818cf8" }} />
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 30, color: "#cbd5e1", lineHeight: 1.35, maxWidth: 980 }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#94a3b8" }}>
          <span>{footer}</span>
          <span style={{ color: "#e0e7ff" }}>→</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

export const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
