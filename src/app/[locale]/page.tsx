import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCard, NewsCard, ProjectCard } from "@/components/cards/cards";
import { LocalizedMarkdown, Pending, Tx } from "@/components/i18n/tx";
import { MetricTiles } from "@/components/impact/metric-tiles";
import { TestimonialCarousel } from "@/components/interactive/testimonial-carousel";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/shared/json-ld";
import { EvidenceCoverage } from "@/components/trust/evidence";
import { TrustHero } from "@/components/trust/hero";
import { Portrait } from "@/components/trust/people";
import { ObjectivesGrid, ReadMoreLink, VisionMission } from "@/components/trust/purpose";
import { getPageContext } from "@/lib/i18n";
import { text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { organizationJsonLd, siteTitle, websiteJsonLd } from "@/lib/seo";
import { carouselLabels, metricTileLabels, toCarouselItems, toMetricTile } from "@/lib/view-models";
import {
  getActivities,
  getEvidenceCoverage,
  getHeadlineMetrics,
  getNews,
  getObjectives,
  getProjects,
  getSettings,
  getTestimonials,
  getTrust,
  getTrustees,
} from "@/server/queries/public";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale, t } = await getPageContext(params);
  const [trust, settings, coverage, objectives, metrics, projects, activities, testimonials, news, trustees] = await Promise.all([
    getTrust(),
    getSettings(),
    getEvidenceCoverage(),
    getObjectives(),
    getHeadlineMetrics(4),
    getProjects(),
    getActivities(),
    getTestimonials(),
    getNews(),
    getTrustees(),
  ]);
  const href = (path: string) => localePath(locale, path);
  const founder = trustees.find((p) => p.isFounder) ?? null;
  const featuredProjects = [...projects].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, 3);
  const org = organizationJsonLd(locale, trust);

  return (
    <>
      <JsonLd data={[websiteJsonLd(locale, siteTitle(locale, trust, settings)), ...(org ? [org] : [])]} />
      <TrustHero locale={locale} t={t} trust={trust} coverage={coverage} />

      {/* About the trust */}
      <Section labelledBy="intro-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading id="intro-title" eyebrow={t.home.aboutEyebrow} title={t.about.title} className="mb-6 sm:mb-8" />
            <Reveal>
              <LocalizedMarkdown value={trust.about} locale={locale} t={t} className="text-[1.0625rem]" fallback={<Pending t={t} />} />
              <div className="mt-7">
                <ReadMoreLink href={href("/about")}>{t.actions.readFullStory}</ReadMoreLink>
              </div>
            </Reveal>
          </div>
          <div className="flex flex-col gap-5 lg:col-span-5 lg:pt-16">
            {founder && (
              <Reveal className="surface flex items-center gap-4 p-4">
                <Portrait
                  photo={founder.photo}
                  name={text(founder.name, locale)}
                  locale={locale}
                  sizes="80px"
                  className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                />
                <div className="min-w-0">
                  <p className="tracking-eyebrow text-[11px] text-brand">{t.founder.eyebrow}</p>
                  <Tx value={founder.name} locale={locale} as="p" className="mt-1 font-display text-lg leading-snug" />
                  <Tx value={founder.position} locale={locale} as="p" className="text-sm text-muted-foreground" />
                </div>
              </Reveal>
            )}
            {trust.purpose && (
              <Reveal delay={0.05} className="surface p-6">
                <h3 className="text-lg">{t.about.why}</h3>
                <Tx value={trust.purpose} locale={locale} as="p" className="mt-2 text-sm leading-relaxed text-muted-foreground" />
              </Reveal>
            )}
            {trust.geographicFocus && (
              <Reveal delay={0.08} className="surface flex gap-3 p-6">
                <MapPin className="mt-1 size-4 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <h3 className="text-lg">{t.about.focus}</h3>
                  <Tx value={trust.geographicFocus} locale={locale} as="p" className="mt-2 text-sm leading-relaxed text-muted-foreground" />
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </Section>

      {/* Vision & mission */}
      <Section labelledBy="vision-title" tone="muted" className="py-14 sm:py-20">
        <h2 id="vision-title" className="sr-only">
          {t.about.visionTitle} · {t.about.missionTitle}
        </h2>
        <VisionMission locale={locale} t={t} trust={trust} />
      </Section>

      {/* Objectives */}
      <Section labelledBy="objectives-title">
        <SectionHeading id="objectives-title" eyebrow={t.about.objectivesEyebrow} title={t.about.objectivesTitle} />
        <ObjectivesGrid locale={locale} t={t} objectives={objectives} />
      </Section>

      {/* Impact headline */}
      {metrics.length > 0 && (
        <Section labelledBy="impact-title" tone="pattern">
          <SectionHeading
            id="impact-title"
            eyebrow={t.home.impactEyebrow}
            title={t.home.impactTitle}
            description={t.home.impactText}
            action={<ReadMoreLink href={href("/impact")}>{t.impact.dashboard}</ReadMoreLink>}
          />
          <MetricTiles metrics={metrics.map((m) => toMetricTile(locale, t, m))} labels={metricTileLabels(t)} locale={locale} />
        </Section>
      )}

      {/* Projects & activities */}
      {(featuredProjects.length > 0 || activities.length > 0) && (
        <Section labelledBy="work-title">
          <SectionHeading
            id="work-title"
            eyebrow={t.home.workEyebrow}
            title={t.home.projectsTitle}
            action={
              projects.length > 0 ? (
                <Button asChild variant="outline">
                  <Link href={href("/projects")}>
                    {t.actions.viewAll} <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : undefined
            }
          />
          {featuredProjects.length > 0 && (
            <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project, i) => (
                <StaggerItem as="li" key={project.id}>
                  <ProjectCard locale={locale} t={t} project={project} priority={i === 0} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
          {activities.length > 0 && (
            <div className="mt-14">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                <h3 className="text-2xl">{t.home.activitiesTitle}</h3>
                <ReadMoreLink href={href("/activities")}>{t.actions.viewAll}</ReadMoreLink>
              </div>
              <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {activities.slice(0, 3).map((activity) => (
                  <StaggerItem as="li" key={activity.id}>
                    <ActivityCard locale={locale} t={t} activity={activity} />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}
        </Section>
      )}

      {/* Evidence */}
      <Section labelledBy="evidence-title" tone="muted">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start lg:gap-14">
          <Reveal>
            <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <p className="tracking-eyebrow mt-6 text-xs font-medium text-brand">{t.home.evidenceEyebrow}</p>
            <h2 id="evidence-title" className="text-section mt-3">
              {t.home.evidenceTitle}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t.home.evidenceText}</p>
            <Button asChild className="mt-7">
              <Link href={href("/verification")}>
                {t.home.evidenceCta} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
          <div>
            <p className="mb-4 text-sm font-medium">{t.verification.coverageTitle}</p>
            <EvidenceCoverage locale={locale} t={t} coverage={coverage} compact />
            <p className="mt-4 text-xs text-muted-foreground">{t.verification.coverageText}</p>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <Section labelledBy="voices-title">
          <SectionHeading id="voices-title" eyebrow={t.home.voicesEyebrow} title={t.home.voicesTitle} align="center" />
          <Reveal>
            <TestimonialCarousel items={toCarouselItems(locale, t, testimonials)} labels={carouselLabels(t)} />
          </Reveal>
        </Section>
      )}

      {/* News */}
      {news.length > 0 && (
        <Section labelledBy="news-title" tone="muted">
          <SectionHeading
            id="news-title"
            eyebrow={t.home.latestEyebrow}
            title={t.home.latestTitle}
            action={<ReadMoreLink href={href("/news")}>{t.actions.viewAll}</ReadMoreLink>}
          />
          <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map((post) => (
              <StaggerItem as="li" key={post.id}>
                <NewsCard locale={locale} t={t} post={post} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}
    </>
  );
}
