import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, FolderOpen, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DocumentCard, StoryCard } from "@/components/cards/cards";
import { LocalizedMarkdown, Tx } from "@/components/i18n/tx";
import { GalleryGrid } from "@/components/interactive/gallery-grid";
import { TestimonialCarousel } from "@/components/interactive/testimonial-carousel";
import { Breadcrumbs, Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/shared/json-ld";
import { SmartImage } from "@/components/shared/smart-image";
import { formatDate, formatNumber, getPageContext, LOCALES } from "@/lib/i18n";
import { text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { carouselLabels, galleryLabels, toCarouselItems, toGalleryItems } from "@/lib/view-models";
import { getActivities, getActivityBySlug } from "@/server/queries/public";

export async function generateStaticParams() {
  const activities = await getActivities();
  return LOCALES.flatMap((locale) => activities.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/activities/[slug]">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) return { title: t.errors.notFoundTitle, robots: { index: false } };
  return pageMetadata({
    locale,
    path: `/activities/${slug}`,
    title: text(activity.title, locale),
    description: text(activity.summary, locale),
    image: activity.cover?.url,
    type: "article",
    publishedTime: activity.publishedAt,
    modifiedTime: activity.updatedAt,
  });
}

export default async function ActivityPage({ params }: PageProps<"/[locale]/activities/[slug]">) {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) notFound();
  const title = text(activity.title, locale);
  const images = activity.albums.flatMap((a) => a.images);

  return (
    <article>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: localePath(locale, "/") },
          { name: t.activities.title, path: localePath(locale, "/activities") },
          { name: title, path: localePath(locale, `/activities/${slug}`) },
        ])}
      />
      <header className="bg-kolam relative border-b">
        <div className="container-page relative pt-10 pb-12 sm:pt-14">
          <Breadcrumbs items={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.activities.title, href: localePath(locale, "/activities") }, { label: title }]} />
          <Reveal className="mt-8 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {activity.category && (
                <Badge variant="brand">
                  <Tx value={activity.category.name} locale={locale} />
                </Badge>
              )}
            </div>
            <h1 className="text-page-title mt-4">
              <Tx value={activity.title} locale={locale} />
            </h1>
            <Tx value={activity.summary} locale={locale} as="p" className="mt-5 text-lg leading-relaxed text-muted-foreground" />
            <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden="true" /> {t.activities.date}
                </dt>
                <dd className="mt-1 font-medium">
                  <time dateTime={activity.date}>{formatDate(locale, activity.date)}</time>
                  {activity.endDate && ` – ${formatDate(locale, activity.endDate)}`}
                </dd>
              </div>
              {activity.location && (
                <div>
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-4" aria-hidden="true" /> {t.activities.location}
                  </dt>
                  <Tx value={activity.location} locale={locale} as="dd" className="mt-1 font-medium" />
                </div>
              )}
              {activity.beneficiaries !== null && (
                <div>
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-4" aria-hidden="true" /> {t.activities.beneficiaries}
                  </dt>
                  <dd className="mt-1 font-medium tabular-nums">
                    {formatNumber(locale, activity.beneficiaries)}
                    <Tx value={activity.beneficiariesNote} locale={locale} className="ml-2 font-normal text-muted-foreground" />
                  </dd>
                </div>
              )}
              {activity.project && (
                <div>
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <FolderOpen className="size-4" aria-hidden="true" /> {t.activities.partOfProject}
                  </dt>
                  <dd className="mt-1 font-medium">
                    <Link href={localePath(locale, `/projects/${activity.project.slug}`)} className="text-brand hover:underline">
                      <Tx value={activity.project.title} locale={locale} />
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>
        </div>
      </header>

      {activity.cover && (
        <div className="container-page pt-10">
          <Reveal className="relative aspect-[16/8] overflow-hidden rounded-3xl border bg-muted shadow-lift">
            <SmartImage src={activity.cover.url} alt={text(activity.cover.alt, locale)} fill priority sizes="(min-width: 1216px) 1152px, 100vw" className="object-cover" />
          </Reveal>
        </div>
      )}

      <Section className="pt-12 sm:pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <LocalizedMarkdown value={activity.description} locale={locale} t={t} />
            {activity.impact && (
              <Reveal>
                <h2 className="mb-3 text-2xl">{t.activities.impact}</h2>
                <LocalizedMarkdown value={activity.impact} locale={locale} t={t} />
              </Reveal>
            )}
          </div>
          {activity.documents.length > 0 && (
            <aside className="lg:col-span-4">
              <h2 className="mb-4 text-lg">{t.activities.reports}</h2>
              <ul className="grid gap-3">
                {activity.documents.map((doc) => (
                  <li key={doc.id}>
                    <DocumentCard locale={locale} t={t} document={doc} />
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>

        {images.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl">{t.activities.gallery}</h2>
            <GalleryGrid images={toGalleryItems(locale, images)} labels={galleryLabels(t)} />
          </div>
        )}
        {activity.testimonials.length > 0 && (
          <div className="mt-16">
            <TestimonialCarousel items={toCarouselItems(locale, t, activity.testimonials)} labels={carouselLabels(t)} />
          </div>
        )}
        {activity.stories.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl">{t.projects.stories}</h2>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {activity.stories.map((story) => (
                <li key={story.id}>
                  <StoryCard locale={locale} t={t} story={story} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>
    </article>
  );
}
