import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LocalizedMarkdown, Tx } from "@/components/i18n/tx";
import { Breadcrumbs, Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/shared/json-ld";
import { SmartImage } from "@/components/shared/smart-image";
import { formatDate, getPageContext, LOCALES } from "@/lib/i18n";
import { format, text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { articleJsonLd, breadcrumbJsonLd, eventJsonLd, pageMetadata } from "@/lib/seo";
import { getNews, getNewsBySlug, getTrust } from "@/server/queries/public";

export async function generateStaticParams() {
  const posts = await getNews();
  return LOCALES.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/news/[slug]">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return { title: t.errors.notFoundTitle, robots: { index: false } };
  return pageMetadata({
    locale,
    path: `/news/${slug}`,
    title: text(post.title, locale),
    description: text(post.excerpt, locale),
    image: post.cover?.url,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updatedAt,
  });
}

export default async function NewsPostPage({ params }: PageProps<"/[locale]/news/[slug]">) {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const [post, trust] = await Promise.all([getNewsBySlug(slug), getTrust()]);
  if (!post) notFound();
  const title = text(post.title, locale);
  const path = localePath(locale, `/news/${slug}`);
  const publisher = trust.namePending ? null : text(trust.name, locale);

  return (
    <article>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: t.nav.home, path: localePath(locale, "/") },
            { name: t.news.title, path: localePath(locale, "/news") },
            { name: title, path },
          ]),
          post.kind === "EVENT" && post.eventStart
            ? eventJsonLd({ locale, path, name: title, description: text(post.excerpt, locale), startDate: post.eventStart, endDate: post.eventEnd, location: post.eventLocation, organizer: publisher })
            : articleJsonLd({ locale, path, title, description: text(post.excerpt, locale), image: post.cover?.url, datePublished: post.date, dateModified: post.updatedAt, publisher }),
        ]}
      />
      <Section className="pt-10 sm:pt-14">
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.news.title, href: localePath(locale, "/news") }, { label: title }]} />
          <Reveal className="mt-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={post.kind === "EVENT" ? "brand" : "secondary"}>{t.news.kind[post.kind]}</Badge>
              {post.category && <Tx value={post.category.name} locale={locale} />}
              <time dateTime={post.date}>{formatDate(locale, post.date)}</time>
            </div>
            <h1 className="text-page-title mt-4">
              <Tx value={post.title} locale={locale} />
            </h1>
            <Tx value={post.excerpt} locale={locale} as="p" className="mt-5 text-lg leading-relaxed text-muted-foreground" />
            {post.authorName && <p className="mt-4 text-sm text-muted-foreground">{format(t.news.by, { author: post.authorName })}</p>}
            {post.kind === "EVENT" && post.eventStart && (
              <dl className="mt-6 grid gap-4 rounded-2xl border bg-card p-5 text-sm shadow-soft sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="size-4" aria-hidden="true" /> {t.news.when}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {formatDate(locale, post.eventStart)}
                    {post.eventEnd && ` – ${formatDate(locale, post.eventEnd)}`}
                  </dd>
                </div>
                {post.eventLocation && (
                  <div>
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="size-4" aria-hidden="true" /> {t.news.where}
                    </dt>
                    <Tx value={post.eventLocation} locale={locale} as="dd" className="mt-1 font-medium" />
                  </div>
                )}
              </dl>
            )}
          </Reveal>
        </div>
        {post.cover && (
          <Reveal className="relative mx-auto mt-10 aspect-[16/9] max-w-4xl overflow-hidden rounded-3xl border bg-muted shadow-lift">
            <SmartImage src={post.cover.url} alt={text(post.cover.alt, locale)} fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" />
          </Reveal>
        )}
        <div className="mx-auto mt-10 max-w-3xl">
          <LocalizedMarkdown value={post.content} locale={locale} t={t} className="text-[1.0625rem]" />
          {(post.activity || post.project) && (
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm">
              {post.activity && (
                <Link href={localePath(locale, `/activities/${post.activity.slug}`)} className="text-brand hover:underline">
                  {t.news.relatedActivity}: <Tx value={post.activity.title} locale={locale} />
                </Link>
              )}
              {post.project && (
                <Link href={localePath(locale, `/projects/${post.project.slug}`)} className="text-brand hover:underline">
                  {t.impact.relatedProject}: <Tx value={post.project.title} locale={locale} />
                </Link>
              )}
            </div>
          )}
        </div>
      </Section>
    </article>
  );
}
