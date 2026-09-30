import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalizedMarkdown, Tx } from "@/components/i18n/tx";
import { MetricTiles } from "@/components/impact/metric-tiles";
import { DocumentViewer } from "@/components/interactive/document-viewer";
import { PageIntro, Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { formatDate, getPageContext, LOCALES } from "@/lib/i18n";
import { format, text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { metricTileLabels, toMetricTile } from "@/lib/view-models";
import { getReportBySlug, getReports } from "@/server/queries/public";

export async function generateStaticParams() {
  const reports = await getReports();
  return LOCALES.flatMap((locale) => reports.map((r) => ({ locale, slug: r.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/reports/[slug]">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const report = await getReportBySlug(slug);
  if (!report) return { title: t.errors.notFoundTitle, robots: { index: false } };
  return pageMetadata({
    locale,
    path: `/reports/${slug}`,
    title: `${text(report.title, locale)} ${report.periodLabel}`,
    description: text(report.summary, locale) || undefined,
  });
}

export default async function ReportPage({ params }: PageProps<"/[locale]/reports/[slug]">) {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const report = await getReportBySlug(slug);
  if (!report) notFound();
  // Prefer the PDF in the visitor's language.
  const primary = (locale === "ta" ? report.documentTa ?? report.documentEn : report.documentEn ?? report.documentTa) ?? null;
  const files = [
    { doc: report.documentEn, label: t.reports.english, lang: "en" },
    { doc: report.documentTa, label: t.reports.tamil, lang: "ta" },
  ].filter((f) => f.doc?.file);
  const sections = [
    { title: t.reports.summary, value: report.summary },
    { title: t.reports.highlights, value: report.highlights },
    { title: t.reports.impact, value: report.impact },
    { title: t.reports.financial, value: report.financial },
  ].filter((s) => s.value);

  return (
    <>
      <PageIntro
        eyebrow={format(t.reports.report, { period: report.periodLabel })}
        title={<Tx value={report.title} locale={locale} />}
        breadcrumbs={[
          { label: t.nav.home, href: localePath(locale, "/") },
          { label: t.reports.title, href: localePath(locale, "/reports") },
          { label: report.periodLabel },
        ]}
      >
        {files.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-2">
            {files.map((f) => (
              <Button key={f.lang} asChild variant={f.lang === locale ? "default" : "outline"}>
                <a href={f.doc!.file!.url} download lang={f.lang}>
                  <Download aria-hidden="true" /> {f.label}
                </a>
              </Button>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">{format(t.meta.lastUpdated, { date: formatDate(locale, report.updatedAt, "monthYear") })}</p>
      </PageIntro>
      <Section>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="min-w-0 space-y-10 lg:col-span-7">
            {sections.map((section) => (
              <Reveal as="section" key={section.title}>
                <h2 className="mb-3 text-2xl">{section.title}</h2>
                <LocalizedMarkdown value={section.value} locale={locale} t={t} />
              </Reveal>
            ))}
          </div>
          <div className="min-w-0 lg:col-span-5">
            {!primary?.file && (
              <p role="note" className="rounded-2xl border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground">
                {report.isDemo ? t.reports.demoNoDocument : t.reports.noDocument}
              </p>
            )}
            {primary?.file && (
              <DocumentViewer
                file={primary.file}
                title={text(primary.title, locale)}
                labels={{
                  preview: t.documents.preview,
                  fullscreen: t.actions.fullscreen,
                  exitFullscreen: t.actions.exitFullscreen,
                  download: t.actions.download,
                  openInNewTab: t.actions.openInNewTab,
                  page: t.documents.pages,
                  previewUnavailable: t.documents.previewUnavailable,
                }}
              />
            )}
          </div>
        </div>
      </Section>
      {report.metrics.length > 0 && (
        <Section labelledBy="report-metrics" tone="muted">
          <h2 id="report-metrics" className="text-section mb-8">
            {t.reports.metrics}
          </h2>
          <MetricTiles metrics={report.metrics.map((m) => toMetricTile(locale, t, m))} labels={metricTileLabels(t)} locale={locale} />
        </Section>
      )}
    </>
  );
}
