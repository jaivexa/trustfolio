import type { NextConfig } from "next";
import { OPTIMIZED_REMOTE_HOSTS } from "./src/lib/images";

const isDev = process.env.NODE_ENV !== "production";
const BLOB = "https://*.public.blob.vercel-storage.com";
const ANALYTICS = "https://plausible.io";

/**
 * Static CSP. Next.js injects inline bootstrap scripts, so `'unsafe-inline'`
 * is required for scripts without nonces. PDFs may be embedded from this site
 * or Vercel Blob (document viewer); nothing else can be framed or embedded.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${ANALYTICS}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${ANALYTICS}${isDev ? " ws:" : ""}`,
  `object-src 'self' ${BLOB}`,
  `frame-src 'self' ${BLOB}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: OPTIMIZED_REMOTE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
  experimental: {
    globalNotFound: true,
    serverActions: {
      // Uploads go through a route handler; actions only carry form fields.
      bodySizeLimit: "2mb",
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Uploaded files may be shown inside this site's own document viewer.
      {
        source: "/uploads/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
      { source: "/demo/:path*", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }, { key: "Content-Security-Policy", value: "frame-ancestors 'self'" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
