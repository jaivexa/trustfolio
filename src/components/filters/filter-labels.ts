import type { FilterLabels } from "@/components/filters/filter-shell";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import type { Localized, OptionalLocalized } from "@/lib/i18n/localized";
import { text } from "@/lib/i18n/localized";

export function filterLabels(t: Dictionary, searchPlaceholder?: string): FilterLabels {
  return {
    all: t.filters.all,
    filterBy: t.filters.category,
    search: t.filters.search,
    searchPlaceholder: searchPlaceholder ?? `${t.filters.search}…`,
    results: t.filters.results,
    noMatches: t.filters.noMatches,
    noMatchesHint: t.filters.noMatchesHint,
    clear: t.actions.clearFilters,
    showMore: t.actions.showMore,
    year: t.documents.year,
    allYears: t.documents.allYears,
  };
}

/** Lower-cased text in both languages so visitors can search either way. */
export function searchText(...values: (Localized | OptionalLocalized | string | null | undefined)[]): string {
  return values
    .flatMap((v) => (v == null ? [] : typeof v === "string" ? [v] : [v.en, v.ta ?? ""]))
    .join(" ")
    .toLowerCase();
}

export function categoryOptions(locale: Locale, categories: { slug: string; name: Localized }[]) {
  return categories.map((c) => ({ value: c.slug, label: text(c.name, locale) }));
}
