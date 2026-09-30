import { notFound } from "next/navigation";
import { isLocale, LOCALE_TAGS, type Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { ta } from "./dictionaries/ta";

export * from "./config";
export * from "./localized";
export * from "./paths";
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, ta };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Validates the `[locale]` route param; unknown locales 404. */
export function assertLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

/** Resolves params + dictionary in one call for pages and layouts. */
export async function getPageContext(params: Promise<{ locale: string }>) {
  const { locale: raw } = await params;
  const locale = assertLocale(raw);
  return { locale, t: getDictionary(locale) };
}

const dateFormats = {
  long: { day: "numeric", month: "long", year: "numeric" },
  medium: { day: "numeric", month: "short", year: "numeric" },
  monthYear: { month: "long", year: "numeric" },
  year: { year: "numeric" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export function formatDate(
  locale: Locale,
  value: string | Date,
  style: keyof typeof dateFormats = "long",
): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale].intl, { ...dateFormats[style], timeZone: "UTC" }).format(
    new Date(value),
  );
}

export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale].intl, { maximumFractionDigits: 1 }).format(value);
}

export function formatFileSize(locale: Locale, bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${formatNumber(locale, Math.round(size * 10) / 10)} ${units[unit]}`;
}
