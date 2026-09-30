import "server-only";
import { db } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/constants";
import { l10n, l10nOpt } from "@/lib/i18n/localized";
import type { Prisma } from "@/generated/prisma/client";
import { cached, categorySelect, iso, isoOrNull, PUBLISHED, refSelect, toCategory, toRef } from "./shared";
import type { MetricDTO } from "./types";

export const metricSelect = {
  id: true,
  metricKey: true,
  labelEn: true,
  labelTa: true,
  value: true,
  prefix: true,
  suffix: true,
  unitEn: true,
  unitTa: true,
  periodStart: true,
  periodEnd: true,
  periodLabelEn: true,
  periodLabelTa: true,
  methodologyEn: true,
  methodologyTa: true,
  isHeadline: true,
  updatedAt: true,
  category: { select: categorySelect },
  sourceDocument: { select: { ...refSelect, visibility: true, containsPersonalData: true, isRedacted: true } },
  report: { select: { slug: true, periodLabel: true, titleEn: true, titleTa: true, status: true } },
  project: { select: refSelect },
  activities: { select: refSelect, orderBy: { date: "desc" }, take: 12 },
} satisfies Prisma.ImpactMetricSelect;

export function toMetric(row: Prisma.ImpactMetricGetPayload<{ select: typeof metricSelect }>): MetricDTO {
  const doc = row.sourceDocument;
  return {
    id: row.id,
    metricKey: row.metricKey,
    label: l10n(row.labelEn, row.labelTa),
    value: row.value,
    prefix: row.prefix,
    suffix: row.suffix,
    unit: l10nOpt(row.unitEn, row.unitTa),
    periodStart: isoOrNull(row.periodStart),
    periodEnd: isoOrNull(row.periodEnd),
    periodLabel: l10nOpt(row.periodLabelEn, row.periodLabelTa),
    methodology: l10nOpt(row.methodologyEn, row.methodologyTa),
    category: toCategory(row.category),
    sourceDocument: doc && doc.visibility === "PUBLIC" && (!doc.containsPersonalData || doc.isRedacted) ? toRef(doc) : null,
    report:
      row.report && row.report.status === "PUBLISHED"
        ? { slug: row.report.slug, periodLabel: row.report.periodLabel, title: l10n(row.report.titleEn, row.report.titleTa) }
        : null,
    project: toRef(row.project),
    activities: row.activities.flatMap((a) => toRef(a) ?? []),
    isHeadline: row.isHeadline,
    updatedAt: iso(row.updatedAt),
  };
}

export const getMetrics = cached(
  async (): Promise<MetricDTO[]> => {
    const rows = await db.impactMetric.findMany({
      where: PUBLISHED,
      orderBy: [{ isHeadline: "desc" }, { sortOrder: "asc" }, { periodEnd: { sort: "desc", nulls: "last" } }],
      select: metricSelect,
    });
    return rows.map(toMetric);
  },
  "metrics",
  [CACHE_TAGS.impact, CACHE_TAGS.reports, CACHE_TAGS.documents, CACHE_TAGS.activities, CACHE_TAGS.projects],
);

/**
 * Headline figures: for each metric key, only the most recent period, so the
 * same measure is never shown twice with different numbers.
 */
export async function getHeadlineMetrics(limit = 4): Promise<MetricDTO[]> {
  const metrics = await getMetrics();
  const seen = new Set<string>();
  const latest = metrics
    .filter((m) => m.isHeadline)
    .sort((a, b) => (b.periodEnd ?? "").localeCompare(a.periodEnd ?? ""))
    .filter((m) => (seen.has(m.metricKey) ? false : (seen.add(m.metricKey), true)));
  return latest.slice(0, limit);
}
