import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { brandName, buildNav } from "@/components/layout/chrome";
import { fontVariables } from "@/lib/fonts";
import { getPageContext, LOCALES, localePath, LOCALE_TAGS } from "@/lib/i18n";
import { buildLocaleMetadata } from "@/lib/seo";
import { getSettings, getTrust } from "@/server/queries/public";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await getPageContext(params);
  const [trust, settings] = await Promise.all([getTrust(), getSettings()]);
  return buildLocaleMetadata(locale, trust, settings);
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9f4" },
    { media: "(prefers-color-scheme: dark)", color: "#121a1a" },
  ],
  colorScheme: "light dark",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale, t } = await getPageContext(params);
  const [trust, settings] = await Promise.all([getTrust(), getSettings()]);
  const nav = buildNav(locale, t, settings);
  const brand = brandName(locale, t, trust);
  const defaultTheme = settings.defaultTheme.toLowerCase() as "light" | "dark" | "system";

  return (
    <html lang={LOCALE_TAGS[locale].lang} data-accent={settings.accentColor} className={fontVariables} suppressHydrationWarning>
      <body className="min-h-dvh font-sans">
        <Providers defaultTheme={defaultTheme}>
          <a
            href="#main"
            className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {t.meta.skipToContent}
          </a>
          <SiteHeader
            locale={locale}
            brand={{ ...brand, logoUrl: trust.logo?.url ?? null }}
            homeHref={localePath(locale, "/")}
            nav={nav}
            cta={{ label: settings.contactEnabled ? t.header.cta : t.header.ctaContact, href: localePath(locale, "/contact") }}
            searchHref={localePath(locale, "/search")}
            labels={{
              primary: t.nav.primary,
              mobile: t.nav.mobile,
              menu: t.nav.menu,
              openMenu: t.nav.openMenu,
              more: t.nav.more,
              search: t.nav.search,
              language: t.header.language,
              home: brand.name,
              theme: {
                theme: t.header.theme,
                light: t.header.light,
                dark: t.header.dark,
                system: t.header.system,
                changeTheme: t.header.changeTheme,
              },
            }}
          />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter locale={locale} t={t} trust={trust} settings={settings} brand={brand} nav={nav} />
        </Providers>
        {settings.analyticsDomain && (
          // Privacy-friendly, cookie-less analytics — only when configured in Settings.
          <Script defer data-domain={settings.analyticsDomain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
