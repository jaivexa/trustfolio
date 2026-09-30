import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/providers";
import { buildRootMetadata } from "@/lib/seo";
import { getProfile, getSiteSettings } from "@/server/queries/public";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, profile] = await Promise.all([getSiteSettings(), getProfile()]);
  return buildRootMetadata(settings, profile);
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#111218" },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const defaultTheme = settings.defaultTheme.toLowerCase() as "light" | "dark" | "system";

  return (
    <html
      lang="en"
      data-accent={settings.accentColor}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh font-sans">
        <Providers defaultTheme={defaultTheme}>{children}</Providers>
      </body>
    </html>
  );
}
