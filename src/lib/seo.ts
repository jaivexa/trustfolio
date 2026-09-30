import type { Metadata } from "next";
import { LOCALE_TAGS, LOCALES, type Locale } from "@/lib/i18n/config";
import { text, type OptionalLocalized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { absoluteUrl, getSiteUrl } from "@/lib/utils";
import type { SettingsDTO, TrustDTO } from "@/server/queries/public";
import { real } from "@/server/queries/public/trust";

/** hreflang alternates for a path that exists in every locale. */
export function alternatesFor(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [LOCALE_TAGS[l].lang, localePath(l, path)])),
      "x-default": localePath("en", path),
    },
  };
}

export function siteTitle(locale: Locale, trust: TrustDTO, settings: SettingsDTO): string {
  const seo = real(text(settings.seoTitle, locale));
  if (seo) return seo;
  if (!trust.namePending) return text(trust.name, locale);
  return "Trustfolio";
}

/** Root metadata for a locale (title template, description, OG, Twitter). */
export function buildLocaleMetadata(locale: Locale, trust: TrustDTO, settings: SettingsDTO): Metadata {
  const title = siteTitle(locale, trust, settings);
  const description = real(text(settings.seoDescription, locale)) ?? text(trust.tagline, locale) ?? undefined;
  const ogImage = absoluteUrl(settings.ogImage?.url ?? `/og?locale=${locale}`);
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: title, template: `%s · ${title}` },
    description: description || undefined,
    keywords: settings.seoKeywords,
    applicationName: title,
    alternates: alternatesFor(locale, "/"),
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description: description || undefined,
      locale: LOCALE_TAGS[locale].og,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_TAGS[l].og),
      url: localePath(locale, "/"),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || undefined,
      images: [ogImage],
      ...(settings.twitterHandle ? { site: settings.twitterHandle } : {}),
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    formatDetection: { telephone: false },
  };
}

/** Metadata for an inner page. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
}: {
  locale: Locale;
  path: string;
  title: string;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
}): Metadata {
  return {
    title,
    description: description || undefined,
    alternates: alternatesFor(locale, path),
    openGraph: {
      type,
      title,
      description: description || undefined,
      url: localePath(locale, path),
      locale: LOCALE_TAGS[locale].og,
      ...(image ? { images: [{ url: absoluteUrl(image) }] } : {}),
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description: description || undefined },
  };
}

// ─── Structured data (only for visible, supported content) ─────────────────

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(locale: Locale, trust: TrustDTO): JsonLd | null {
  if (trust.namePending) return null;
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: text(trust.name, locale),
    ...(trust.name.ta && locale === "en" ? { alternateName: trust.name.ta } : {}),
    url: absoluteUrl(localePath(locale, "/")),
    ...(trust.tagline ? { description: text(trust.tagline, locale) } : {}),
    ...(trust.logo ? { logo: absoluteUrl(trust.logo.url) } : {}),
    ...(trust.contact.email ? { email: trust.contact.email } : {}),
    ...(trust.contact.phone ? { telephone: trust.contact.phone } : {}),
    ...(trust.registration.established ? { foundingDate: trust.registration.established.slice(0, 10) } : {}),
    ...(trust.contact.address ? { address: { "@type": "PostalAddress", streetAddress: text(trust.contact.address, locale) } } : {}),
    sameAs: trust.socialLinks.filter((l) => l.url.startsWith("https://")).map((l) => l.url),
  };
}

export function websiteJsonLd(locale: Locale, name: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: absoluteUrl(localePath(locale, "/")),
    inLanguage: LOCALE_TAGS[locale].lang,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl(localePath(locale, "/search"))}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleJsonLd({
  locale,
  path,
  title,
  description,
  image,
  datePublished,
  dateModified,
  publisher,
}: {
  locale: Locale;
  path: string;
  title: string;
  description?: string | null;
  image?: string | null;
  datePublished: string;
  dateModified: string;
  publisher: string | null;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    inLanguage: LOCALE_TAGS[locale].lang,
    url: absoluteUrl(path),
    ...(description ? { description } : {}),
    ...(image ? { image: absoluteUrl(image) } : {}),
    datePublished,
    dateModified,
    ...(publisher ? { publisher: { "@type": "Organization", name: publisher } } : {}),
  };
}

export function eventJsonLd({
  locale,
  path,
  name,
  description,
  startDate,
  endDate,
  location,
  organizer,
}: {
  locale: Locale;
  path: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: OptionalLocalized;
  organizer: string | null;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    url: absoluteUrl(path),
    startDate,
    ...(endDate ? { endDate } : {}),
    ...(description ? { description } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(location ? { location: { "@type": "Place", name: text(location, locale), address: text(location, locale) } } : {}),
    ...(organizer ? { organizer: { "@type": "Organization", name: organizer } } : {}),
  };
}
