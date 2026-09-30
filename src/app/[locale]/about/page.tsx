import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { LocalizedMarkdown, Pending, Tx } from "@/components/i18n/tx";
import { PageIntro, Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLd } from "@/components/shared/json-ld";
import { HistoryTimeline } from "@/components/trust/history-timeline";
import { FounderFeature } from "@/components/trust/people";
import { ObjectivesGrid, ReadMoreLink, VisionMission } from "@/components/trust/purpose";
import { getPageContext } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getFaqs, getFounder, getHistory, getObjectives, getTrust } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/about", title: t.about.title, description: t.about.description });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale, t } = await getPageContext(params);
  const [trust, objectives, history, founder, faqs] = await Promise.all([getTrust(), getObjectives(), getHistory(), getFounder(), getFaqs()]);
  const home = localePath(locale, "/");

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: t.nav.home, path: home }, { name: t.about.title, path: localePath(locale, "/about") }])} />
      <PageIntro
        eyebrow={t.nav.about}
        title={t.about.title}
        description={t.about.description}
        breadcrumbs={[{ label: t.nav.home, href: home }, { label: t.about.title }]}
      />

      <Section labelledBy="history-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 id="history-title" className="text-section mb-6">
              {t.about.history}
            </h2>
            <Reveal>
              <LocalizedMarkdown
                value={trust.history ?? trust.about}
                locale={locale}
                t={t}
                className="text-[1.0625rem]"
                fallback={<Pending t={t} />}
              />
            </Reveal>
          </div>
          <aside className="space-y-5 lg:col-span-5">
            <Reveal className="surface p-6">
              <h3 className="text-lg">{t.about.why}</h3>
              <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
                <LocalizedMarkdown value={trust.purpose} locale={locale} t={t} fallback={<Pending t={t} />} />
              </div>
            </Reveal>
            <Reveal delay={0.05} className="surface p-6">
              <h3 className="flex items-center gap-2 text-lg">
                <MapPin className="size-4 text-brand" aria-hidden="true" /> {t.about.focus}
              </h3>
              <Tx value={trust.geographicFocus} locale={locale} as="p" className="mt-3 text-sm leading-relaxed text-muted-foreground" fallback={<Pending t={t} className="mt-3" />} />
            </Reveal>
            <Reveal delay={0.08}>
              <ReadMoreLink href={localePath(locale, "/verification/registration")}>{t.registration.title}</ReadMoreLink>
            </Reveal>
          </aside>
        </div>
      </Section>

      <Section labelledBy="vm-title" tone="muted" className="py-14 sm:py-20">
        <h2 id="vm-title" className="sr-only">
          {t.about.visionTitle} · {t.about.missionTitle}
        </h2>
        <VisionMission locale={locale} t={t} trust={trust} />
      </Section>

      <Section id="objectives" labelledBy="objectives-title">
        <SectionHeading id="objectives-title" eyebrow={t.about.objectivesEyebrow} title={t.about.objectivesTitle} />
        <ObjectivesGrid locale={locale} t={t} objectives={objectives} />
      </Section>

      {founder && (
        <Section id="founder" labelledBy="founder-title" tone="pattern">
          <SectionHeading id="founder-title" eyebrow={t.founder.eyebrow} title={<Tx value={founder.name} locale={locale} />} />
          <FounderFeature locale={locale} t={t} founder={founder} />
        </Section>
      )}

      <Section id="history" labelledBy="timeline-title">
        <SectionHeading id="timeline-title" eyebrow={t.about.timelineEyebrow} title={t.about.timelineTitle} />
        {history.length > 0 ? <HistoryTimeline locale={locale} t={t} events={history} /> : <EmptyState title={t.empty.history} />}
      </Section>

      {faqs.length > 0 && (
        <Section id="faq" labelledBy="faq-title" tone="muted">
          <SectionHeading id="faq-title" title={t.about.faqTitle} />
          <div className="mx-auto max-w-3xl divide-y rounded-2xl border bg-card shadow-soft">
            {faqs.map((faq) => (
              <details key={faq.id} className="group p-5 open:bg-muted/20 sm:p-6">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium outline-none focus-visible:text-brand">
                  <Tx value={faq.question} locale={locale} />
                  <span aria-hidden="true" className="mt-1 text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="mt-3 text-sm text-muted-foreground">
                  <LocalizedMarkdown value={faq.answer} locale={locale} t={t} />
                </div>
              </details>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
