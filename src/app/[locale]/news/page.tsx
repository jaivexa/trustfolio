import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { NewsCard } from "@/components/cards/cards";
import { FilterShell } from "@/components/filters/filter-shell";
import { filterLabels, searchText } from "@/components/filters/filter-labels";
import { PageIntro, Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { getPageContext } from "@/lib/i18n";
import { text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { getCategories, getNews } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/news">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/news", title: t.news.title, description: t.news.description });
}

export default async function NewsPage({ params }: PageProps<"/[locale]/news">) {
  const { locale, t } = await getPageContext(params);
  const [posts, categories] = await Promise.all([getNews(), getCategories("NEWS")]);
  const now = new Date().toISOString();
  const groups = [
    ...(posts.some((p) => p.kind === "EVENT" && p.eventStart && p.eventStart >= now) ? [{ value: "upcoming", label: t.news.upcoming }] : []),
    ...(["NEWS", "EVENT"] as const).filter((k) => posts.some((p) => p.kind === k)).map((k) => ({ value: k.toLowerCase(), label: t.news.kind[k] })),
    ...categories.filter((c) => posts.some((p) => p.category?.slug === c.slug)).map((c) => ({ value: c.slug, label: text(c.name, locale) })),
  ];
  const years = [...new Set(posts.map((p) => new Date(p.date).getUTCFullYear()))].sort((a, b) => b - a);

  return (
    <>
      <PageIntro
        eyebrow={t.home.latestEyebrow}
        title={t.news.title}
        description={t.news.description}
        breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.news.title }]}
      />
      <Section>
        {posts.length === 0 ? (
          <EmptyState icon={Newspaper} title={t.empty.news} />
        ) : (
          <FilterShell
            items={posts.map((p) => ({
              key: p.id,
              groups: [
                p.kind.toLowerCase(),
                ...(p.category ? [p.category.slug] : []),
                ...(p.kind === "EVENT" && p.eventStart && p.eventStart >= now ? ["upcoming"] : []),
              ],
              year: new Date(p.date).getUTCFullYear(),
              text: searchText(p.title, p.excerpt, p.eventLocation),
            }))}
            groups={groups}
            years={years}
            labels={filterLabels(t)}
          >
            {posts.map((post) => (
              <NewsCard key={post.id} locale={locale} t={t} post={post} />
            ))}
          </FilterShell>
        )}
      </Section>
    </>
  );
}
