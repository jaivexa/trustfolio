import "server-only";
import { db } from "@/lib/db";
import { l10n, l10nOpt, type Localized, type OptionalLocalized } from "@/lib/i18n/localized";
import { PUBLIC_DOCUMENT_WHERE, PUBLISHED } from "./shared";

export const SEARCH_TYPES = ["project", "activity", "document", "report", "news", "trustee", "certificate", "story"] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export type SearchResult = {
  type: SearchType;
  id: string;
  href: string;
  title: Localized;
  excerpt: OptionalLocalized;
  date: string | null;
};

const PER_TYPE = 12;

/** Case-insensitive match on English and Tamil columns (Postgres ILIKE handles Tamil). */
function anyOf(fields: string[], q: string) {
  return fields.map((field) => ({ [field]: { contains: q, mode: "insensitive" as const } }));
}

/**
 * Global search across published content in both languages. Uncached: results
 * depend on the query string and should always reflect current data.
 */
export async function searchSite(rawQuery: string, type?: SearchType): Promise<SearchResult[]> {
  const q = rawQuery.trim().slice(0, 100);
  if (q.length < 2) return [];
  const want = (t: SearchType) => !type || type === t;

  const [projects, activities, documents, reports, news, trustees, certificates, stories] = await Promise.all([
    want("project")
      ? db.project.findMany({
          where: { ...PUBLISHED, OR: anyOf(["titleEn", "titleTa", "summaryEn", "summaryTa", "contentEn", "contentTa", "locationEn", "locationTa"], q) },
          select: { id: true, slug: true, titleEn: true, titleTa: true, summaryEn: true, summaryTa: true, startDate: true },
          take: PER_TYPE,
        })
      : [],
    want("activity")
      ? db.activity.findMany({
          where: { ...PUBLISHED, OR: anyOf(["titleEn", "titleTa", "summaryEn", "summaryTa", "descriptionEn", "descriptionTa", "locationEn", "locationTa"], q) },
          select: { id: true, slug: true, titleEn: true, titleTa: true, summaryEn: true, summaryTa: true, date: true },
          orderBy: { date: "desc" },
          take: PER_TYPE,
        })
      : [],
    want("document")
      ? db.document.findMany({
          where: { AND: [PUBLIC_DOCUMENT_WHERE, { OR: anyOf(["titleEn", "titleTa", "descriptionEn", "descriptionTa", "sourceEn", "sourceTa"], q) }] },
          select: { id: true, slug: true, titleEn: true, titleTa: true, descriptionEn: true, descriptionTa: true, documentDate: true },
          take: PER_TYPE,
        })
      : [],
    want("report")
      ? db.annualReport.findMany({
          where: { ...PUBLISHED, OR: [...anyOf(["titleEn", "titleTa", "summaryEn", "summaryTa", "highlightsEn", "highlightsTa"], q), { periodLabel: { contains: q } }] },
          select: { id: true, slug: true, titleEn: true, titleTa: true, summaryEn: true, summaryTa: true, publishedAt: true },
          take: PER_TYPE,
        })
      : [],
    want("news")
      ? db.newsPost.findMany({
          where: { ...PUBLISHED, OR: anyOf(["titleEn", "titleTa", "excerptEn", "excerptTa", "contentEn", "contentTa"], q) },
          select: { id: true, slug: true, titleEn: true, titleTa: true, excerptEn: true, excerptTa: true, date: true },
          orderBy: { date: "desc" },
          take: PER_TYPE,
        })
      : [],
    want("trustee")
      ? db.trustee.findMany({
          where: { status: "PUBLISHED", publicationConsent: true, OR: anyOf(["nameEn", "nameTa", "positionEn", "positionTa"], q) },
          select: { id: true, slug: true, nameEn: true, nameTa: true, positionEn: true, positionTa: true },
          take: PER_TYPE,
        })
      : [],
    want("certificate")
      ? db.certificate.findMany({
          where: { ...PUBLISHED, OR: anyOf(["titleEn", "titleTa", "issuerEn", "issuerTa", "descriptionEn", "descriptionTa"], q) },
          select: { id: true, titleEn: true, titleTa: true, issuerEn: true, issuerTa: true, issuedAt: true },
          take: PER_TYPE,
        })
      : [],
    want("story")
      ? db.story.findMany({
          where: { status: "PUBLISHED", consentObtained: true, OR: anyOf(["titleEn", "titleTa", "summaryEn", "summaryTa"], q) },
          select: { id: true, slug: true, titleEn: true, titleTa: true, summaryEn: true, summaryTa: true, publishedAt: true },
          take: PER_TYPE,
        })
      : [],
  ]);

  const iso = (d: Date | null) => (d ? d.toISOString() : null);
  return [
    ...projects.map((r) => ({ type: "project" as const, id: r.id, href: `/projects/${r.slug}`, title: l10n(r.titleEn, r.titleTa), excerpt: l10nOpt(r.summaryEn, r.summaryTa), date: iso(r.startDate) })),
    ...activities.map((r) => ({ type: "activity" as const, id: r.id, href: `/activities/${r.slug}`, title: l10n(r.titleEn, r.titleTa), excerpt: l10nOpt(r.summaryEn, r.summaryTa), date: iso(r.date) })),
    ...documents.map((r) => ({ type: "document" as const, id: r.id, href: `/documents/${r.slug}`, title: l10n(r.titleEn, r.titleTa), excerpt: l10nOpt(r.descriptionEn, r.descriptionTa), date: iso(r.documentDate) })),
    ...reports.map((r) => ({ type: "report" as const, id: r.id, href: `/reports/${r.slug}`, title: l10n(r.titleEn, r.titleTa), excerpt: l10nOpt(r.summaryEn, r.summaryTa), date: iso(r.publishedAt) })),
    ...news.map((r) => ({ type: "news" as const, id: r.id, href: `/news/${r.slug}`, title: l10n(r.titleEn, r.titleTa), excerpt: l10nOpt(r.excerptEn, r.excerptTa), date: iso(r.date) })),
    ...trustees.map((r) => ({ type: "trustee" as const, id: r.id, href: `/trustees/${r.slug}`, title: l10n(r.nameEn, r.nameTa), excerpt: l10nOpt(r.positionEn, r.positionTa), date: null })),
    ...certificates.map((r) => ({ type: "certificate" as const, id: r.id, href: `/certificates#${r.id}`, title: l10n(r.titleEn, r.titleTa), excerpt: l10nOpt(r.issuerEn, r.issuerTa), date: iso(r.issuedAt) })),
    ...stories.map((r) => ({ type: "story" as const, id: r.id, href: `/stories/${r.slug}`, title: l10n(r.titleEn, r.titleTa), excerpt: l10nOpt(r.summaryEn, r.summaryTa), date: iso(r.publishedAt) })),
  ];
}

/** Slugs for sitemap and static params. */
export async function getSitemapData() {
  const pick = { slug: true, updatedAt: true } as const;
  const [projects, activities, documents, reports, news, trustees, stories, albums] = await Promise.all([
    db.project.findMany({ where: PUBLISHED, select: pick }),
    db.activity.findMany({ where: PUBLISHED, select: pick }),
    db.document.findMany({ where: PUBLIC_DOCUMENT_WHERE, select: pick }),
    db.annualReport.findMany({ where: PUBLISHED, select: pick }),
    db.newsPost.findMany({ where: PUBLISHED, select: pick }),
    db.trustee.findMany({ where: { status: "PUBLISHED", publicationConsent: true }, select: pick }),
    db.story.findMany({ where: { status: "PUBLISHED", consentObtained: true }, select: pick }),
    db.galleryAlbum.findMany({ where: PUBLISHED, select: pick }),
  ]);
  return { projects, activities, documents, reports, news, trustees, stories, albums };
}
