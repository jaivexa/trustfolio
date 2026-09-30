import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, CircleCheck, CircleDashed, ExternalLink, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityCard, DocumentCard, ProjectCard, StoryCard } from "@/components/cards/cards";
import { LocalizedMarkdown, Tx } from "@/components/i18n/tx";
import { MetricTiles } from "@/components/impact/metric-tiles";
import { GalleryGrid } from "@/components/interactive/gallery-grid";
import { TestimonialCarousel } from "@/components/interactive/testimonial-carousel";
import { Breadcrumbs, Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/shared/json-ld";
import { SmartImage } from "@/components/shared/smart-image";
import { VerificationRecordCard } from "@/components/trust/evidence";
import { formatDate, getPageContext, LOCALES } from "@/lib/i18n";
import { text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { carouselLabels, galleryLabels, metricTileLabels, toCarouselItems, toGalleryItems, toMetricTile } from "@/lib/view-models";
import { getProjectBySlug, getProjects } from "@/server/queries/public";

export async function generateStaticParams() {
  const projects = await getProjects();
  return LOCALES.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: t.errors.notFoundTitle, robots: { index: false } };
  return pageMetadata({
    locale,
    path: `/projects/${slug}`,
    title: text(project.seoTitle, locale) || text(project.title, locale),
    description: text(project.seoDescription, locale) || text(project.summary, locale),
    image: project.cover?.url,
    type: "article",
    publishedTime: project.publishedAt,
    modifiedTime: project.updatedAt,
  });
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const title = text(project.title, locale);
  const images = project.albums.flatMap((a) => a.images);
  const checklist = [
    { key: "reports", label: t.projects.evidence_reports, count: project.documents.length, anchor: "#documents" },
    { key: "photos", label: t.projects.evidence_photos, count: images.length, anchor: "#gallery" },
    { key: "testimonials", label: t.projects.evidence_testimonials, count: project.testimonials.length, anchor: "#voices" },
    { key: "metrics", label: t.projects.evidence_metrics, count: project.metrics.length, anchor: "#impact" },
    { key: "verification", label: t.projects.evidence_verification, count: project.verificationRecords.length, anchor: "#verification" },
    { key: "external", label: t.projects.evidence_external, count: project.externalUrl ? 1 : 0, anchor: project.externalUrl ?? "" },
  ];
  const period = project.startDate
    ? `${formatDate(locale, project.startDate, "monthYear")}${project.endDate ? ` – ${formatDate(locale, project.endDate, "monthYear")}` : ""}`
    : null;

  return (
    <article>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: localePath(locale, "/") },
          { name: t.projects.title, path: localePath(locale, "/projects") },
          { name: title, path: localePath(locale, `/projects/${slug}`) },
        ])}
      />

      {/* Hero */}
      <header className="bg-kolam relative border-b">
        <div className="container-page relative pt-10 pb-12 sm:pt-14 sm:pb-16">
          <Breadcrumbs items={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.projects.title, href: localePath(locale, "/projects") }, { label: title }]} />
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-8">
              <div className="flex flex-wrap gap-2">
                <Badge variant={project.phase === "COMPLETED" ? "success" : "brand"}>{t.projects.phase[project.phase]}</Badge>
                {project.isFeatured && <Badge variant="outline">{t.projects.featured}</Badge>}
              </div>
              <h1 className="text-page-title mt-4">
                <Tx value={project.title} locale={locale} />
              </h1>
              <Tx value={project.summary} locale={locale} as="p" className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground" />
              {project.externalUrl && (
                <Button asChild variant="outline" className="mt-7">
                  <a href={project.externalUrl} target="_blank" rel="noopener noreferrer">
                    <Tx value={project.externalUrlLabel} locale={locale} fallback={t.projects.evidence_external} />
                    <ExternalLink aria-hidden="true" />
                  </a>
                </Button>
              )}
            </Reveal>
            <Reveal delay={0.06} className="lg:col-span-4">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border bg-card/80 p-5 shadow-soft backdrop-blur">
                {project.category && (
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Tag className="size-3.5" aria-hidden="true" /> {t.projects.category}
                    </dt>
                    <Tx value={project.category.name} locale={locale} as="dd" className="mt-1 text-sm font-medium" />
                  </div>
                )}
                {period && (
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" aria-hidden="true" /> {t.projects.period}
                    </dt>
                    <dd className="mt-1 text-sm font-medium">{period}</dd>
                  </div>
                )}
                {project.location && (
                  <div className="col-span-2">
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" /> {t.projects.location}
                    </dt>
                    <Tx value={project.location} locale={locale} as="dd" className="mt-1 text-sm font-medium" />
                  </div>
                )}
              </dl>
            </Reveal>
          </div>
        </div>
      </header>

      {project.cover && (
        <div className="container-page pt-10">
          <Reveal className="relative aspect-[16/8] overflow-hidden rounded-3xl border bg-muted shadow-lift">
            <SmartImage src={project.cover.url} alt={text(project.cover.alt, locale)} fill priority sizes="(min-width: 1216px) 1152px, 100vw" className="object-cover" />
          </Reveal>
        </div>
      )}

      {/* Story of the project + evidence checklist */}
      <Section className="pt-12 sm:pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="min-w-0 space-y-12 lg:col-span-8">
            {project.content && (
              <Reveal as="section">
                <h2 className="mb-4 text-2xl">{t.projects.overview}</h2>
                <LocalizedMarkdown value={project.content} locale={locale} t={t} />
              </Reveal>
            )}
            {project.need && (
              <Reveal as="section">
                <h2 className="mb-4 text-2xl">{t.projects.need}</h2>
                <LocalizedMarkdown value={project.need} locale={locale} t={t} />
              </Reveal>
            )}
            {project.approach && (
              <Reveal as="section">
                <h2 className="mb-4 text-2xl">{t.projects.approach}</h2>
                <LocalizedMarkdown value={project.approach} locale={locale} t={t} />
              </Reveal>
            )}
            {project.objectives && (
              <Reveal as="section">
                <h2 className="mb-4 text-2xl">{t.projects.objectives}</h2>
                <LocalizedMarkdown value={project.objectives} locale={locale} t={t} />
              </Reveal>
            )}
          </div>
          <aside className="lg:col-span-4">
            <div className="surface p-5 lg:sticky lg:top-28">
              <h2 className="text-base">{t.projects.evidenceChecklist}</h2>
              <ul className="mt-4 grid gap-2.5">
                {checklist.map((item) => {
                  const available = item.count > 0;
                  const content = (
                    <>
                      {available ? (
                        <CircleCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
                      ) : (
                        <CircleDashed className="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                      )}
                      <span className={available ? "" : "text-muted-foreground"}>{item.label}</span>
                      {available && item.key !== "external" && <span className="ml-auto text-xs text-muted-foreground tabular-nums">{item.count}</span>}
                      <span className="sr-only">{available ? t.verification.available : t.verification.notYet}</span>
                    </>
                  );
                  return (
                    <li key={item.key}>
                      {available ? (
                        <a
                          href={item.anchor}
                          {...(item.key === "external" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="flex items-center gap-2.5 px-2 py-1.5 text-sm">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      {project.activities.length > 0 && (
        <Section labelledBy="activities-title" tone="muted">
          <h2 id="activities-title" className="text-section mb-8">
            {t.projects.activities}
          </h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {project.activities.map((activity) => (
              <li key={activity.id}>
                <ActivityCard locale={locale} t={t} activity={activity} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {project.metrics.length > 0 && (
        <Section id="impact" labelledBy="impact-title">
          <h2 id="impact-title" className="text-section mb-8">
            {t.projects.impact}
          </h2>
          <MetricTiles metrics={project.metrics.map((m) => toMetricTile(locale, t, m))} labels={metricTileLabels(t)} locale={locale} />
        </Section>
      )}

      {images.length > 0 && (
        <Section id="gallery" labelledBy="gallery-title" tone="muted">
          <h2 id="gallery-title" className="text-section mb-8">
            {t.projects.gallery}
          </h2>
          <GalleryGrid images={toGalleryItems(locale, images)} labels={galleryLabels(t)} />
        </Section>
      )}

      {project.documents.length > 0 && (
        <Section id="documents" labelledBy="documents-title">
          <h2 id="documents-title" className="text-section mb-8">
            {t.projects.reports}
          </h2>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {project.documents.map((doc) => (
              <li key={doc.id}>
                <DocumentCard locale={locale} t={t} document={doc} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {project.verificationRecords.length > 0 && (
        <Section id="verification" labelledBy="verification-title" tone="muted">
          <h2 id="verification-title" className="text-section mb-3">
            {t.verification.records}
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">{t.verification.methodNote}</p>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {project.verificationRecords.map((record) => (
              <li key={record.id}>
                <VerificationRecordCard locale={locale} t={t} record={record} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {project.testimonials.length > 0 && (
        <Section id="voices" labelledBy="voices-title">
          <h2 id="voices-title" className="text-section mb-8 text-center">
            {t.projects.testimonials}
          </h2>
          <TestimonialCarousel items={toCarouselItems(locale, t, project.testimonials)} labels={carouselLabels(t)} />
        </Section>
      )}

      {project.stories.length > 0 && (
        <Section labelledBy="stories-title" tone="muted">
          <h2 id="stories-title" className="text-section mb-8">
            {t.projects.stories}
          </h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {project.stories.map((story) => (
              <li key={story.id}>
                <StoryCard locale={locale} t={t} story={story} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {project.related.length > 0 && (
        <Section labelledBy="related-title">
          <h2 id="related-title" className="text-section mb-8">
            {t.nav.more} {t.projects.title.toLowerCase()}
          </h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {project.related.map((related) => (
              <li key={related.id}>
                <ProjectCard locale={locale} t={t} project={related} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
