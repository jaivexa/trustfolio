import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = { title: "404 — Page not found · பக்கம் கிடைக்கவில்லை" };

/** Bilingual 404 for URLs outside every route tree (e.g. unknown /api paths). */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body className="grid min-h-dvh place-items-center bg-background px-4 font-sans text-foreground">
        <main className="max-w-md text-center">
          <p className="font-display text-6xl text-gold">404</p>
          <h1 className="mt-4 text-2xl">Page not found</h1>
          <p lang="ta" className="mt-1 text-xl">
            பக்கம் கிடைக்கவில்லை
          </p>
          <div className="mt-8 flex justify-center gap-3 text-sm">
            <a href="/en" className="rounded-full bg-primary px-5 py-2.5 text-primary-foreground">
              English
            </a>
            <a href="/ta" lang="ta" className="rounded-full border px-5 py-2.5">
              தமிழ்
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
