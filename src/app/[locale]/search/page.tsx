import type { Metadata } from "next";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tx } from "@/components/i18n/tx";
import { PageIntro, Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, getPageContext } from "@/lib/i18n";
import { format } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { alternatesFor } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { searchSite, SEARCH_TYPES, type SearchType } from "@/server/queries/public/search";

export async function generateMetadata({ params }: PageProps<"/[locale]/search">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  // Result pages are not indexed; the form page itself is.
  return { title: t.search.title, description: t.search.description, alternates: alternatesFor(locale, "/search"), robots: { index: false, follow: true } };
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[locale]/search">) {
  const { locale, t } = await getPageContext(params);
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const typeParam = typeof sp.type === "string" ? sp.type : undefined;
  const type = SEARCH_TYPES.includes(typeParam as SearchType) ? (typeParam as SearchType) : undefined;
  const results = query.trim().length >= 2 ? await searchSite(query, type) : [];
  const base = localePath(locale, "/search");
  const typeHref = (value?: SearchType) => `${base}?${new URLSearchParams({ q: query, ...(value ? { type: value } : {}) }).toString()}`;

  return (
    <>
      <PageIntro
        eyebrow={t.nav.search}
        title={t.search.title}
        description={t.search.description}
        breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.search.title }]}
      >
        <form action={base} method="get" role="search" className="mt-8 flex max-w-2xl gap-2">
          <label htmlFor="site-search" className="sr-only">
            {t.search.placeholder}
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="site-search" name="q" type="search" defaultValue={query} placeholder={t.search.placeholder} className="h-12 rounded-full pl-11 text-base" minLength={2} maxLength={100} autoFocus={!query} />
          </div>
          {type && <input type="hidden" name="type" value={type} />}
          <Button type="submit" size="lg">
            {t.actions.search}
          </Button>
        </form>
      </PageIntro>
      <Section className="pt-10 sm:pt-12">
        {query.trim().length < 2 ? (
          <p className="text-muted-foreground">{t.search.prompt}</p>
        ) : (
          <>
            <nav aria-label={t.filters.category} className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {[undefined, ...SEARCH_TYPES].map((value) => (
                <Link
                  key={value ?? "all"}
                  href={typeHref(value)}
                  aria-current={type === value ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors",
                    type === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {value ? t.search.types[value] : t.search.all}
                </Link>
              ))}
            </nav>
            <p role="status" className="mb-6 text-sm text-muted-foreground">
              {results.length ? format(t.search.results, { count: results.length, query }) : ""}
            </p>
            {results.length === 0 ? (
              <EmptyState icon={SearchX} title={format(t.search.noResults, { query })} description={t.filters.noMatchesHint} />
            ) : (
              <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-soft">
                {results.map((result) => (
                  <li key={`${result.type}-${result.id}`}>
                    <Link href={localePath(locale, result.href)} className="block p-5 transition-colors hover:bg-muted/40 sm:px-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">{t.search.types[result.type]}</Badge>
                        {result.date && <time dateTime={result.date}>{formatDate(locale, result.date, "medium")}</time>}
                      </div>
                      <Tx value={result.title} locale={locale} as="p" className="mt-2 font-display text-lg" />
                      <Tx value={result.excerpt} locale={locale} as="p" className="mt-1 line-clamp-2 text-sm text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Section>
    </>
  );
}
