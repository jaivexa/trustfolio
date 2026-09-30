import "server-only";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { resolve } from "@/lib/i18n/localized";
import { localePath, ROUTES } from "@/lib/i18n/paths";
import { initials } from "@/lib/utils";
import type { SettingsDTO, TrustDTO } from "@/server/queries/public";

/** Visible navigation items, in the admin-defined order. */
export function buildNav(locale: Locale, t: Dictionary, settings: SettingsDTO) {
  return settings.navigation
    .filter((item) => item.visible)
    .map((item) => ({ key: item.key, label: t.nav[item.key], href: localePath(locale, ROUTES[item.key]) }));
}

/** Trust name for the chrome; a clearly marked pending label until entered. */
export function brandName(locale: Locale, t: Dictionary, trust: TrustDTO) {
  if (trust.namePending) return { name: t.meta.pendingOfficial, lang: undefined, monogram: "" };
  const resolved = resolve(trust.shortName ?? trust.name, locale) ?? resolve(trust.name, locale);
  return {
    name: resolved?.text ?? "",
    lang: resolved?.isFallback ? resolved.lang : undefined,
    monogram: initials(resolve(trust.name, "en")?.text ?? ""),
  };
}
