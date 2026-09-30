import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Info } from "lucide-react";
import { Tx } from "@/components/i18n/tx";
import { BarChart } from "@/components/impact/bar-chart";
import { MetricTiles } from "@/components/impact/metric-tiles";
import { PageIntro, Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { formatNumber, getPageContext } from "@/lib/i18n";
import { format, text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { metricPeriod, metricTileLabels, toMetricTile } from "@/lib/view-models";
import { getActivities, getMetrics, type MetricDTO } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/impact">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/impact", title: t.impact.title, description: t.impact.description });
}

/** Latest period per metric key, so no measure is shown twice. */
function latestPerKey(metrics: MetricDTO[]): MetricDTO[] {
  const byKey = new Map<string, MetricDTO>();
  for (const metric of metrics) {
    const current = byKey.get(metric.metricKey);
    if (!current || (metric.periodEnd ?? "") > (current.periodEnd ?? "")) byKey.set(metric.metricKey, metric);
  }
  return [...byKey.values()];
}

export default async function ImpactPage({ params }: PageProps<"/[locale]/impact">) {
  const { locale, t } = await getPageContext(params);
  const [metrics, activities] = await Promise.all([getMetrics(), getActivities()]);
  const latest = latestPerKey(metrics);
  const headline = latest.filter((m) => m.isHeadline).length ? latest.filter((m) => m.isHeadline) : latest;

  // Year-on-year: only for measures reported in 2+ periods.
  const series = Object.values(
    metrics.reduce<Record<string, MetricDTO[]>>((acc, m) => {
      (acc[m.metricKey] ??= []).push(m);
      return acc;
    }, {}),
  )
    .filter((group) => group.length >= 2)
    .map((group) => group.sort((a, b) => (a.periodEnd ?? "").localeCompare(b.periodEnd ?? "")));

  // Category breakdown uses one like-for-like measure: number of recorded activities.
  const categoryCounts = Object.values(
    activities.reduce<Record<string, { id: string; name: (typeof activities)[number]["category"]; count: number }>>((acc, a) => {
      const key = a.category?.slug ?? "uncategorized";
      (acc[key] ??= { id: key, name: a.category, count: 0 }).count += 1;
      return acc;
    }, {}),
  ).sort((a, b) => b.count - a.count);

  const home = localePath(locale, "/");

  return (
    <>
      <PageIntro
        eyebrow={t.home.impactEyebrow}
        title={t.impact.title}
        description={t.impact.description}
        breadcrumbs={[{ label: t.nav.home, href: home }, { label: t.impact.title }]}
      />

      {metrics.length === 0 ? (
        <Section>
          <EmptyState icon={BarChart3} title={t.empty.metrics} />
        </Section>
      ) : (
        <>
          <Section labelledBy="headline-title">
            <SectionHeading id="headline-title" title={t.impact.headline} description={t.home.impactText} />
            <MetricTiles metrics={headline.slice(0, 8).map((m) => toMetricTile(locale, t, m))} labels={metricTileLabels(t)} locale={locale} />
          </Section>

          {(series.length > 0 || categoryCounts.length > 1) && (
            <Section labelledBy="dashboard-title" tone="muted">
              <SectionHeading id="dashboard-title" title={t.impact.dashboard} />
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {series.map((group) => {
                  const label = text(group[0]!.label, locale);
                  return (
                    <Reveal key={group[0]!.metricKey}>
                      <BarChart
                        title={format(t.impact.chartYearLabel, { label })}
                        tableLabel={t.impact.byYear}
                        labelHeader={t.impact.period}
                        valueHeader={label}
                        data={group.map((m) => ({
                          id: m.id,
                          label: metricPeriod(locale, m) ?? "—",
                          value: m.value,
                          display: `${m.prefix ?? ""}${formatNumber(locale, m.value)}${m.suffix ?? ""}`,
                          detail: text(m.methodology, locale) || undefined,
                        }))}
                      />
                    </Reveal>
                  );
                })}
                {categoryCounts.length > 1 && (
                  <Reveal>
                    <BarChart
                      title={`${t.activities.title} · ${t.impact.byCategory}`}
                      tableLabel={t.impact.byCategory}
                      labelHeader={t.projects.category}
                      valueHeader={t.activities.title}
                      data={categoryCounts.map((c) => ({
                        id: c.id,
                        label: c.name ? text(c.name.name, locale) : "—",
                        value: c.count,
                        display: formatNumber(locale, c.count),
                      }))}
                    />
                  </Reveal>
                )}
              </div>
            </Section>
          )}

          <Section labelledBy="all-title">
            <SectionHeading id="all-title" title={t.impact.methodology} />
            <div className="overflow-x-auto rounded-2xl border bg-card shadow-soft">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      {t.impact.headline}
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      #
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      {t.impact.period}
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      {t.impact.sourceDocument}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {metrics.map((m) => (
                    <tr key={m.id} className="align-top">
                      <td className="px-4 py-3">
                        <Tx value={m.label} locale={locale} className="font-medium" />
                        <Tx value={m.methodology} locale={locale} as="p" className="mt-1 max-w-md text-xs text-muted-foreground" />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {m.prefix}
                        {formatNumber(locale, m.value)}
                        {m.suffix}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{metricPeriod(locale, m) ?? "—"}</td>
                      <td className="px-4 py-3">
                        {m.sourceDocument ? (
                          <Link href={localePath(locale, `/documents/${m.sourceDocument.slug}`)} className="text-brand hover:underline">
                            <Tx value={m.sourceDocument.title} locale={locale} />
                          </Link>
                        ) : m.report ? (
                          <Link href={localePath(locale, `/reports/${m.report.slug}`)} className="text-brand hover:underline">
                            {format(t.reports.report, { period: m.report.periodLabel })}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      <Section className="pt-0 sm:pt-0">
        <Reveal className="flex gap-4 rounded-2xl border border-dashed bg-muted/30 p-6">
          <Info className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
          <div>
            <h2 className="text-lg">{t.impact.howWeCount}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{t.impact.howWeCountText}</p>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
