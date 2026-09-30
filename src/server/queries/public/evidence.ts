import "server-only";
import { db } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/constants";
import { l10n, l10nOpt } from "@/lib/i18n/localized";
import type { Prisma } from "@/generated/prisma/client";
import { metricSelect, toMetric } from "./impact";
import {
  cached,
  documentCardSelect,
  isoOrNull,
  iso,
  mediaSelect,
  PUBLIC_DOCUMENT_WHERE,
  PUBLISHED,
  publicDocuments,
  refSelect,
  toDocumentCard,
  toMedia,
  toRef,
} from "./shared";
import { getTrust, PUBLIC_TESTIMONIAL } from "./trust";
import { toVerification, verificationSelect } from "./work";
import type {
  CertificateDTO,
  DocumentCardDTO,
  DocumentDTO,
  EvidenceCoverageDTO,
  ReportCardDTO,
  ReportDTO,
  VerificationRecordDTO,
} from "./types";

// ─── Documents ──────────────────────────────────────────────────────────────

export const getDocuments = cached(
  async (): Promise<DocumentCardDTO[]> => {
    const rows = await db.document.findMany({
      where: PUBLIC_DOCUMENT_WHERE,
      orderBy: [{ sortOrder: "asc" }, { year: { sort: "desc", nulls: "last" } }, { documentDate: { sort: "desc", nulls: "last" } }],
      select: documentCardSelect,
    });
    return publicDocuments(rows);
  },
  "documents",
  [CACHE_TAGS.documents, CACHE_TAGS.categories, CACHE_TAGS.media],
);

export const getDocumentBySlug = cached(
  async (slug: string): Promise<DocumentDTO | null> => {
    const row = await db.document.findFirst({
      where: { slug, ...PUBLIC_DOCUMENT_WHERE },
      select: {
        ...documentCardSelect,
        sourceEn: true,
        sourceTa: true,
        projects: { select: refSelect },
        activities: { select: refSelect },
        trustees: { select: { slug: true, nameEn: true, nameTa: true, status: true, publicationConsent: true } },
      },
    });
    if (!row) return null;
    const related: DocumentDTO["related"] = [
      ...row.projects.flatMap((p) => {
        const ref = toRef(p);
        return ref ? [{ type: "project" as const, ...ref }] : [];
      }),
      ...row.activities.flatMap((a) => {
        const ref = toRef(a);
        return ref ? [{ type: "activity" as const, ...ref }] : [];
      }),
      ...row.trustees
        .filter((t) => t.status === "PUBLISHED" && t.publicationConsent)
        .map((t) => ({ type: "trustee" as const, slug: t.slug, title: l10n(t.nameEn, t.nameTa) })),
    ];
    return { ...toDocumentCard(row), source: l10nOpt(row.sourceEn, row.sourceTa), related };
  },
  "document:by-slug",
  [CACHE_TAGS.documents, CACHE_TAGS.projects, CACHE_TAGS.activities, CACHE_TAGS.trustees],
);

// ─── Annual reports ─────────────────────────────────────────────────────────

const reportCardSelect = {
  id: true,
  slug: true,
  periodLabel: true,
  isDemo: true,
  startYear: true,
  titleEn: true,
  titleTa: true,
  summaryEn: true,
  summaryTa: true,
  updatedAt: true,
  cover: { select: mediaSelect },
  documentEn: { select: documentCardSelect },
  documentTa: { select: documentCardSelect },
} satisfies Prisma.AnnualReportSelect;

function toReportCard(row: Prisma.AnnualReportGetPayload<{ select: typeof reportCardSelect }>): ReportCardDTO {
  return {
    id: row.id,
    slug: row.slug,
    periodLabel: row.periodLabel,
    isDemo: row.isDemo,
    startYear: row.startYear,
    title: l10n(row.titleEn, row.titleTa),
    summary: l10nOpt(row.summaryEn, row.summaryTa),
    cover: toMedia(row.cover),
    documentEn: row.documentEn ? (publicDocuments([row.documentEn])[0] ?? null) : null,
    documentTa: row.documentTa ? (publicDocuments([row.documentTa])[0] ?? null) : null,
    updatedAt: iso(row.updatedAt),
  };
}

export const getReports = cached(
  async (): Promise<ReportCardDTO[]> => {
    const rows = await db.annualReport.findMany({ where: PUBLISHED, orderBy: { startYear: "desc" }, select: reportCardSelect });
    return rows.map(toReportCard);
  },
  "reports",
  [CACHE_TAGS.reports, CACHE_TAGS.documents],
);

export const getReportBySlug = cached(
  async (slug: string): Promise<ReportDTO | null> => {
    const row = await db.annualReport.findFirst({
      where: { slug, ...PUBLISHED },
      select: {
        ...reportCardSelect,
        highlightsEn: true,
        highlightsTa: true,
        impactEn: true,
        impactTa: true,
        financialEn: true,
        financialTa: true,
        metrics: { where: PUBLISHED, orderBy: { sortOrder: "asc" }, select: metricSelect },
      },
    });
    if (!row) return null;
    return {
      ...toReportCard(row),
      highlights: l10nOpt(row.highlightsEn, row.highlightsTa),
      impact: l10nOpt(row.impactEn, row.impactTa),
      financial: l10nOpt(row.financialEn, row.financialTa),
      metrics: row.metrics.map(toMetric),
    };
  },
  "report:by-slug",
  [CACHE_TAGS.reports, CACHE_TAGS.documents, CACHE_TAGS.impact],
);

// ─── Certificates & verification ───────────────────────────────────────────

export const getCertificates = cached(
  async (): Promise<CertificateDTO[]> => {
    const rows = await db.certificate.findMany({
      where: PUBLISHED,
      orderBy: [{ sortOrder: "asc" }, { issuedAt: { sort: "desc", nulls: "last" } }],
      include: {
        image: { select: mediaSelect },
        document: { select: { ...refSelect, visibility: true, containsPersonalData: true, isRedacted: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      title: l10n(row.titleEn, row.titleTa),
      issuer: l10n(row.issuerEn, row.issuerTa),
      issuedAt: isoOrNull(row.issuedAt),
      expiresAt: isoOrNull(row.expiresAt),
      credentialId: row.credentialId,
      verificationUrl: row.verificationUrl,
      description: l10nOpt(row.descriptionEn, row.descriptionTa),
      image: toMedia(row.image),
      document:
        row.document && row.document.visibility === "PUBLIC" && (!row.document.containsPersonalData || row.document.isRedacted)
          ? toRef(row.document)
          : null,
    }));
  },
  "certificates",
  [CACHE_TAGS.certificates, CACHE_TAGS.documents],
);

export const getVerificationRecords = cached(
  async (): Promise<VerificationRecordDTO[]> => {
    const rows = await db.verificationRecord.findMany({
      where: PUBLISHED,
      orderBy: [{ area: "asc" }, { sortOrder: "asc" }],
      select: verificationSelect,
    });
    return rows.map(toVerification);
  },
  "verification",
  [CACHE_TAGS.verification, CACHE_TAGS.documents],
);

/**
 * Which evidence categories have published, inspectable records.
 * A category is "available" only when real rows exist — never inferred.
 */
export const getEvidenceCoverage = cached(
  async (): Promise<EvidenceCoverageDTO> => {
    const [trust, trustees, projects, activities, metrics, documents, certificates, reports, testimonials, records] =
      await Promise.all([
        getTrust(),
        db.trustee.count({ where: { status: "PUBLISHED", publicationConsent: true } }),
        db.project.count({ where: PUBLISHED }),
        db.activity.count({ where: PUBLISHED }),
        db.impactMetric.count({ where: PUBLISHED }),
        db.document.count({ where: PUBLIC_DOCUMENT_WHERE }),
        db.certificate.count({ where: PUBLISHED }),
        db.annualReport.count({ where: PUBLISHED }),
        db.testimonial.count({ where: PUBLIC_TESTIMONIAL }),
        db.verificationRecord.groupBy({ by: ["area"], where: PUBLISHED, _count: { _all: true } }),
      ]);
    const recordCount = (area: string) => records.find((r) => r.area === area)?._count._all ?? 0;

    const identityCount = [trust.about, trust.vision, trust.mission].filter(Boolean).length + recordCount("IDENTITY");
    const registrationCount =
      (trust.registration.number ? 1 : 0) + (trust.registration.document ? 1 : 0) + recordCount("REGISTRATION");
    const entry = (count: number) => ({ available: count > 0, count });

    return {
      identity: entry(identityCount),
      registration: entry(registrationCount),
      leadership: entry(trustees + recordCount("LEADERSHIP")),
      projects: entry(projects),
      activities: entry(activities),
      impact: entry(metrics),
      documents: entry(documents),
      certificates: entry(certificates),
      reports: entry(reports),
      testimonials: entry(testimonials),
    };
  },
  "evidence-coverage",
  [
    CACHE_TAGS.trust,
    CACHE_TAGS.trustees,
    CACHE_TAGS.projects,
    CACHE_TAGS.activities,
    CACHE_TAGS.impact,
    CACHE_TAGS.documents,
    CACHE_TAGS.certificates,
    CACHE_TAGS.reports,
    CACHE_TAGS.testimonials,
    CACHE_TAGS.verification,
  ],
);
