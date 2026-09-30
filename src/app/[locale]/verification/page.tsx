import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentCard, ProjectCard, ReportCard } from "@/components/cards/cards";
import { Tx } from "@/components/i18n/tx";
import { TestimonialCarousel } from "@/components/interactive/testimonial-carousel";
import { PageIntro, Section, SectionHeading } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { EvidenceCoverage, RegistrationFacts, VerificationRecordCard } from "@/components/trust/evidence";
import { TrusteeCard } from "@/components/trust/people";
import { ReadMoreLink } from "@/components/trust/purpose";
import { getPageContext } from "@/lib/i18n";
import { format } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { carouselLabels, toCarouselItems } from "@/lib/view-models";
import {
  getCertificates,
  getDocuments,
  getEvidenceCoverage,
  getProjects,
  getReports,
  getTestimonials,
  getTrust,
  getTrustees,
  getVerificationRecords,
} from "@/server/queries/public";
import type { EvidenceArea } from "@/generated/prisma/enums";

export async function generateMetadata({ params }: PageProps<"/[locale]/verification">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/verification", title: t.verification.title, description: t.verification.description });
}

const AREA_LABEL: Record<EvidenceArea, "identity" | "registration" | "leadership" | "projects" | "activities" | "financial" | "certificates" | "other"> = {
  IDENTITY: "identity",
  REGISTRATION: "registration",
  LEADERSHIP: "leadership",
  PROJECTS: "projects",
  ACTIVITIES: "activities",
  FINANCIAL: "financial",
  CERTIFICATES: "certificates",
  OTHER: "other",
};

export default async function VerificationPage({ params }: PageProps<"/[locale]/verification">) {
  const { locale, t } = await getPageContext(params);
  const [trust, coverage, records, trustees, projects, documents, reports, certificates, testimonials] = await Promise.all([
    getTrust(),
    getEvidenceCoverage(),
    getVerificationRecords(),
    getTrustees(),
    getProjects(),
    getDocuments(),
    getReports(),
    getCertificates(),
    getTestimonials(),
  ]);
  const href = (path: string) => localePath(locale, path);
  const areas = [...new Set(records.map((r) => r.area))];

  return (
    <>
      <PageIntro
        eyebrow={
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" aria-hidden="true" /> {t.home.evidenceEyebrow}
          </span>
        }
        title={t.verification.title}
        description={t.verification.description}
        breadcrumbs={[{ label: t.nav.home, href: href("/") }, { label: t.verification.title }]}
      />

      <Section labelledBy="coverage-title">
        <SectionHeading id="coverage-title" title={t.verification.coverageTitle} description={t.verification.coverageText} />
        <EvidenceCoverage locale={locale} t={t} coverage={coverage} />
      </Section>

      <Section id="identity" labelledBy="identity-title" tone="muted">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 id="identity-title" className="text-section">
              {t.verification.identity}
            </h2>
            <div className="mt-6 grid gap-4">
              {[
                { label: t.about.visionTitle, value: trust.vision },
                { label: t.about.missionTitle, value: trust.mission },
              ].map((row) => (
                <div key={row.label} className="surface p-5">
                  <p className="text-xs font-medium text-muted-foreground">{row.label}</p>
                  <Tx value={row.value} locale={locale} as="p" className="mt-1.5 text-sm leading-relaxed" fallback={<span className="text-sm text-muted-foreground">{t.meta.pendingOfficial}</span>} />
                </div>
              ))}
            </div>
            <div className="mt-5">
              <ReadMoreLink href={href("/about")}>{t.about.title}</ReadMoreLink>
            </div>
          </div>
          <div id="registration">
            <h2 className="text-section">{t.verification.registration}</h2>
            <div className="mt-6">
              <RegistrationFacts locale={locale} t={t} trust={trust} />
            </div>
            <div className="mt-5">
              <ReadMoreLink href={href("/verification/registration")}>{t.registration.title}</ReadMoreLink>
            </div>
          </div>
        </div>
      </Section>

      {records.length > 0 && (
        <Section id="records" labelledBy="records-title">
          <SectionHeading id="records-title" title={t.verification.records} description={t.verification.methodNote} />
          <div className="space-y-10">
            {areas.map((area) => (
              <div key={area}>
                <h3 className="mb-4 text-lg">{t.verification[AREA_LABEL[area]]}</h3>
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {records
                    .filter((r) => r.area === area)
                    .map((record) => (
                      <li key={record.id}>
                        <VerificationRecordCard locale={locale} t={t} record={record} />
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section id="leadership" labelledBy="leadership-title" tone="pattern">
        <SectionHeading
          id="leadership-title"
          title={t.verification.leadership}
          action={trustees.length ? <ReadMoreLink href={href("/trustees")}>{t.actions.viewAll}</ReadMoreLink> : undefined}
        />
        {trustees.length ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustees.slice(0, 4).map((trustee) => (
              <li key={trustee.id}>
                <TrusteeCard locale={locale} trustee={trustee} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t.empty.trustees} />
        )}
      </Section>

      <Section id="work" labelledBy="work-title">
        <SectionHeading
          id="work-title"
          title={`${t.verification.projects} · ${t.verification.activities}`}
          description={format(t.verification.count, { count: coverage.projects.count + coverage.activities.count })}
          action={
            <div className="flex flex-wrap gap-4">
              <ReadMoreLink href={href("/projects")}>{t.nav.projects}</ReadMoreLink>
              <ReadMoreLink href={href("/activities")}>{t.nav.activities}</ReadMoreLink>
              <ReadMoreLink href={href("/impact")}>{t.nav.impact}</ReadMoreLink>
            </div>
          }
        />
        {projects.length ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <li key={project.id}>
                <ProjectCard locale={locale} t={t} project={project} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t.empty.projects} />
        )}
      </Section>

      <Section id="documents" labelledBy="documents-title" tone="muted">
        <SectionHeading
          id="documents-title"
          title={t.verification.documents}
          action={documents.length ? <ReadMoreLink href={href("/documents")}>{t.actions.viewAll}</ReadMoreLink> : undefined}
        />
        {documents.length ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {documents.slice(0, 6).map((doc) => (
              <li key={doc.id}>
                <DocumentCard locale={locale} t={t} document={doc} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t.empty.documents} />
        )}
      </Section>

      <Section id="reports" labelledBy="reports-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 id="reports-title" className="text-section mb-6">
              {t.verification.reports}
            </h2>
            {reports.length ? (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {reports.slice(0, 2).map((report) => (
                  <li key={report.id}>
                    <ReportCard locale={locale} t={t} report={report} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title={t.empty.reports} />
            )}
          </div>
          <div id="certificates">
            <h2 className="text-section mb-6">{t.verification.certificates}</h2>
            {certificates.length ? (
              <ul className="grid gap-3">
                {certificates.slice(0, 5).map((cert) => (
                  <li key={cert.id} className="surface flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <Tx value={cert.title} locale={locale} as="p" className="font-medium" />
                      <Tx value={cert.issuer} locale={locale} as="p" className="text-sm text-muted-foreground" />
                    </div>
                    {cert.verificationUrl && (
                      <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm text-brand hover:underline">
                        {t.actions.checkWithIssuer}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title={t.empty.certificates} />
            )}
            {certificates.length > 0 && (
              <div className="mt-5">
                <ReadMoreLink href={href("/certificates")}>{t.actions.viewAll}</ReadMoreLink>
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section id="testimonials" labelledBy="testimonials-title" tone="muted">
        <SectionHeading id="testimonials-title" title={t.verification.testimonials} align="center" />
        {testimonials.length ? (
          <TestimonialCarousel items={toCarouselItems(locale, t, testimonials)} labels={carouselLabels(t)} />
        ) : (
          <EmptyState title={t.empty.testimonials} />
        )}
      </Section>

      <Section className="pt-0 sm:pt-0">
        <div className="flex flex-col items-start gap-4 rounded-3xl bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <p className="max-w-xl font-display text-xl leading-relaxed">{t.verification.methodNote}</p>
          <Button asChild variant="secondary">
            <Link href={href("/contact")}>
              {t.header.ctaContact} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
