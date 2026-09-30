import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { LocalizedMarkdown, Tx } from "@/components/i18n/tx";
import { GalleryGrid } from "@/components/interactive/gallery-grid";
import { Breadcrumbs, Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SmartImage } from "@/components/shared/smart-image";
import { getPageContext, LOCALES } from "@/lib/i18n";
import { text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { galleryLabels, toGalleryItems } from "@/lib/view-models";
import { getStories, getStoryBySlug } from "@/server/queries/public";

export async function generateStaticParams() {
  const stories = await getStories();
  return LOCALES.flatMap((locale) => stories.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/stories/[slug]">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return { title: t.errors.notFoundTitle, robots: { index: false } };
  return pageMetadata({ locale, path: `/stories/${slug}`, title: text(story.title, locale), description: text(story.summary, locale), image: story.cover?.url, type: "article" });
}

export default async function StoryPage({ params }: PageProps<"/[locale]/stories/[slug]">) {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();
  const chapters = [
    { title: t.stories.challenge, value: story.challenge },
    { title: t.stories.support, value: story.support },
    { title: t.stories.journey, value: story.journey },
    { title: t.stories.outcome, value: story.outcome },
  ].filter((c) => c.value);

  return (
    <article>
      <Section className="pt-10 sm:pt-14">
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.stories.title, href: localePath(locale, "/stories") }, { label: text(story.title, locale) }]} />
          <Reveal className="mt-8">
            {story.subject && (
              <p className="tracking-eyebrow text-xs font-medium text-brand">
                {t.stories.subject}: <Tx value={story.subject} locale={locale} />
              </p>
            )}
            <h1 className="text-page-title mt-3">
              <Tx value={story.title} locale={locale} />
            </h1>
            <Tx value={story.summary} locale={locale} as="p" className="mt-5 font-display text-xl leading-relaxed text-foreground/85 italic" />
            {story.anonymized && (
              <p className="mt-5 inline-flex items-start gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> {t.stories.anonymized}
              </p>
            )}
          </Reveal>
        </div>
        {story.cover && (
          <Reveal className="relative mx-auto mt-10 aspect-[16/9] max-w-4xl overflow-hidden rounded-3xl border bg-muted shadow-lift">
            <SmartImage src={story.cover.url} alt={text(story.cover.alt, locale)} fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" />
          </Reveal>
        )}
        <div className="mx-auto mt-12 max-w-3xl space-y-10">
          {chapters.map((chapter, index) => (
            <Reveal as="section" key={chapter.title}>
              <h2 className="flex items-baseline gap-3 text-2xl">
                <span className="font-display text-lg text-gold tabular-nums" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {chapter.title}
              </h2>
              <LocalizedMarkdown value={chapter.value} locale={locale} t={t} className="mt-3" />
            </Reveal>
          ))}
          {(story.activity || story.project) && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm">
              <span className="text-muted-foreground">{t.stories.related}:</span>
              {story.activity && (
                <Link href={localePath(locale, `/activities/${story.activity.slug}`)} className="text-brand hover:underline">
                  <Tx value={story.activity.title} locale={locale} />
                </Link>
              )}
              {story.project && (
                <Link href={localePath(locale, `/projects/${story.project.slug}`)} className="text-brand hover:underline">
                  <Tx value={story.project.title} locale={locale} />
                </Link>
              )}
            </div>
          )}
        </div>
        {story.images.length > 0 && (
          <div className="mt-16">
            <GalleryGrid images={toGalleryItems(locale, story.images)} labels={galleryLabels(t)} />
          </div>
        )}
      </Section>
    </article>
  );
}
