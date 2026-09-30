import type { Locale } from "./config";

/**
 * Bilingual value carried from the database to the UI. English is the
 * reference language; Tamil may be missing (null) until translated.
 */
export type Localized = { en: string; ta: string | null };
export type OptionalLocalized = Localized | null;

export type Resolved = {
  text: string;
  /** Language the text is actually in (differs from the page on fallback). */
  lang: Locale;
  isFallback: boolean;
};

/** Build a Localized value from paired `…En` / `…Ta` columns. */
export function l10n(en: string, ta: string | null | undefined): Localized {
  return { en, ta: ta?.trim() ? ta : null };
}

/** Like `l10n`, but returns null when there is no English value either. */
export function l10nOpt(en: string | null | undefined, ta: string | null | undefined): OptionalLocalized {
  const hasEn = Boolean(en?.trim());
  const hasTa = Boolean(ta?.trim());
  if (!hasEn && !hasTa) return null;
  return { en: hasEn ? en! : "", ta: hasTa ? ta! : null };
}

/**
 * Resolve a value for a locale. Tamil pages fall back to English (flagged);
 * English pages fall back to Tamil only when English is empty.
 */
export function resolve(value: OptionalLocalized | undefined, locale: Locale): Resolved | null {
  if (!value) return null;
  if (locale === "ta") {
    if (value.ta) return { text: value.ta, lang: "ta", isFallback: false };
    if (value.en) return { text: value.en, lang: "en", isFallback: true };
    return null;
  }
  if (value.en) return { text: value.en, lang: "en", isFallback: false };
  if (value.ta) return { text: value.ta, lang: "ta", isFallback: true };
  return null;
}

/** Plain string for attributes, metadata and sorting. */
export function text(value: OptionalLocalized | undefined, locale: Locale, fallback = ""): string {
  return resolve(value, locale)?.text ?? fallback;
}

/** Whether a Tamil translation exists for every provided value. */
export function isTranslated(...values: OptionalLocalized[]): boolean {
  return values.every((value) => !value || !value.en || Boolean(value.ta));
}

/** Fill `{name}` placeholders in dictionary strings. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}
