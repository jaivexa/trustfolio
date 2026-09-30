import "server-only";
import { locale as rootLocale } from "next/root-params";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import { getDictionary } from "./index";

/**
 * Current locale for any Server Component under app/[locale], including
 * special files (not-found, error boundaries' server parents) that don't
 * receive params.
 */
export async function getLocale(): Promise<Locale> {
  const value = await rootLocale().catch(() => undefined);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
