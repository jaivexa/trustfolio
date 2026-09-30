export const LOCALES = ["en", "ta"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_LABELS: Record<Locale, string> = { en: "English", ta: "தமிழ்" };

/** BCP 47 tags for <html lang>, hreflang and Open Graph. */
export const LOCALE_TAGS: Record<Locale, { lang: string; og: string; intl: string }> = {
  en: { lang: "en", og: "en_IN", intl: "en-IN" },
  ta: { lang: "ta", og: "ta_IN", intl: "ta-IN" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "ta";
}

/**
 * Picks a locale from an Accept-Language header. Only exact language matches
 * count; everything else falls back to the default.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q.split("=")[1]) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);
  const match = ranked.find((entry) => isLocale(entry.lang));
  return match && isLocale(match.lang) ? match.lang : DEFAULT_LOCALE;
}
