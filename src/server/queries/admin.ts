import "server-only";
import { db } from "@/lib/db";
import { RESOURCES, type ResourceKey } from "@/lib/admin-resources";
import type { CategoryType, MessageStatus } from "@/generated/prisma/enums";
import { requireAdminPage } from "@/server/auth-guard";
import { toAdminMedia } from "@/server/queries/admin-media";

/**
 * Uncached reads for the dashboard. Every function re-checks the session
 * (memoized per request) so data never renders for anonymous visitors.
 */
function adminQuery<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  return async (...args: A): Promise<R> => {
    await requireAdminPage();
    return fn(...args);
  };
}

// ─── Translation completeness ──────────────────────────────────────────────

/** Bilingual field stems per resource (`…En` / `…Ta`). */
export const BILINGUAL_FIELDS: Record<ResourceKey, string[]> = {
  trustees: ["name", "position", "bio", "vision", "contribution"],
  objectives: ["title", "description"],
  history: ["title", "description", "dateLabel"],
  activities: ["title", "summary", "description", "location", "beneficiariesNote", "impact"],
  projects: ["title", "summary", "content", "need", "approach", "outcome", "objectives", "location", "externalUrlLabel", "seoTitle", "seoDescription"],
  metrics: ["label", "unit", "periodLabel", "methodology"],
  testimonials: ["name", "role", "organization", "content", "relationship"],
  stories: ["title", "summary", "subject", "challenge", "support", "journey", "outcome"],
  documents: ["title", "description", "source"],
  reports: ["title", "summary", "highlights", "impact", "financial"],
  certificates: ["title", "issuer", "description"],
  verification: ["title", "description", "issuingAuthority"],
  albums: ["title", "description", "location"],
  news: ["title", "excerpt", "content", "eventLocation"],
  faqs: ["question", "answer"],
};

/** Stems whose English is filled but Tamil is empty. */
export function missingTamil(row: Record<string, unknown>, stems: string[]): string[] {
  const filled = (v: unknown) => typeof v === "string" && v.trim().length > 0;
  return stems.filter((stem) => filled(row[`${stem}En`]) && !filled(row[`${stem}Ta`]));
}

export type ResourceRow = {
  id: string;
  title: string;
  titleTa: string | null;
  subtitle: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  updatedAt: string;
  missing: string[];
  flags: string[];
  thumbUrl: string | null;
  publicHref: string | null;
  /** Fictional seed record. */
  isDemo: boolean;
};

type Base = { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; updatedAt: Date } & Record<string, unknown>;

function row(resource: ResourceKey, r: Base, extra: Partial<ResourceRow> & { title: string; titleTa?: string | null }): ResourceRow {
  return {
    id: r.id,
    status: r.status,
    updatedAt: r.updatedAt.toISOString(),
    missing: missingTamil(r, BILINGUAL_FIELDS[resource]),
    subtitle: null,
    flags: [],
    thumbUrl: null,
    publicHref: null,
    titleTa: null,
    isDemo: r.isDemo === true,
    ...extra,
  };
}

const thumb = { select: { url: true, visibility: true, mimeType: true } } as const;
const publicThumb = (m: { url: string; visibility: string; mimeType: string } | null) =>
  m && m.visibility === "PUBLIC" && m.mimeType.startsWith("image/") ? m.url : null;
const dateLabel = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);

export const listResourceRows = adminQuery(async (resource: ResourceKey): Promise<ResourceRow[]> => {
  switch (resource) {
    case "trustees":
      return (await db.trustee.findMany({ orderBy: [{ isFounder: "desc" }, { sortOrder: "asc" }], include: { photo: thumb } })).map((r) =>
        row(resource, r, {
          title: r.nameEn,
          titleTa: r.nameTa,
          subtitle: r.positionEn,
          thumbUrl: publicThumb(r.photo),
          flags: [...(r.isFounder ? ["Founder"] : []), ...(r.publicationConsent ? [] : ["No consent recorded"])],
          publicHref: `/trustees/${r.slug}`,
        }),
      );
    case "objectives":
      return (await db.trustObjective.findMany({ orderBy: { sortOrder: "asc" } })).map((r) =>
        row(resource, r, { title: r.titleEn, titleTa: r.titleTa, subtitle: r.sourceReference, flags: r.sourceReference || r.sourceDocumentId ? [] : ["No source cited"] }),
      );
    case "history":
      return (await db.historyEvent.findMany({ orderBy: { date: "asc" } })).map((r) =>
        row(resource, r, { title: r.titleEn, titleTa: r.titleTa, subtitle: dateLabel(r.date) }),
      );
    case "activities":
      return (await db.activity.findMany({ orderBy: { date: "desc" }, include: { cover: thumb, category: true, project: { select: { titleEn: true } } } })).map((r) =>
        row(resource, r, {
          title: r.titleEn,
          titleTa: r.titleTa,
          subtitle: [dateLabel(r.date), r.category?.nameEn, r.project?.titleEn].filter(Boolean).join(" · "),
          thumbUrl: publicThumb(r.cover),
          publicHref: `/activities/${r.slug}`,
        }),
      );
    case "projects":
      return (await db.project.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }], include: { cover: thumb, category: true } })).map((r) =>
        row(resource, r, {
          title: r.titleEn,
          titleTa: r.titleTa,
          subtitle: [r.category?.nameEn, r.phase.toLowerCase()].filter(Boolean).join(" · "),
          thumbUrl: publicThumb(r.cover),
          flags: r.isFeatured ? ["Featured"] : [],
          publicHref: `/projects/${r.slug}`,
        }),
      );
    case "metrics":
      return (await db.impactMetric.findMany({ orderBy: [{ metricKey: "asc" }, { periodEnd: "desc" }] })).map((r) =>
        row(resource, r, {
          title: `${r.prefix ?? ""}${r.value}${r.suffix ?? ""} ${r.labelEn}`,
          titleTa: r.labelTa,
          subtitle: [r.metricKey, r.periodLabelEn].filter(Boolean).join(" · "),
          flags: [...(r.isHeadline ? ["Headline"] : []), ...(r.methodologyEn || r.sourceDocumentId || r.reportId ? [] : ["No source"])],
        }),
      );
    case "testimonials":
      return (await db.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { date: "desc" }], include: { photo: thumb } })).map((r) =>
        row(resource, r, {
          title: r.nameEn,
          titleTa: r.nameTa,
          subtitle: r.contentEn.slice(0, 90),
          thumbUrl: publicThumb(r.photo),
          flags: [...(r.consentObtained ? [] : ["No consent recorded"]), ...(r.relationshipVerified ? ["Relationship confirmed"] : [])],
        }),
      );
    case "stories":
      return (await db.story.findMany({ orderBy: { updatedAt: "desc" }, include: { cover: thumb } })).map((r) =>
        row(resource, r, {
          title: r.titleEn,
          titleTa: r.titleTa,
          subtitle: r.summaryEn.slice(0, 90),
          thumbUrl: publicThumb(r.cover),
          flags: [...(r.consentObtained ? [] : ["No consent recorded"]), ...(r.anonymized ? ["Anonymised"] : [])],
          publicHref: `/stories/${r.slug}`,
        }),
      );
    case "documents":
      return (await db.document.findMany({ orderBy: [{ updatedAt: "desc" }], include: { category: true } })).map((r) =>
        row(resource, r, {
          title: r.titleEn,
          titleTa: r.titleTa,
          subtitle: [r.category?.nameEn, r.year, r.version ? `v${r.version}` : null].filter(Boolean).join(" · "),
          flags: [
            ...(r.visibility === "PRIVATE" ? ["Private"] : []),
            ...(r.containsPersonalData ? [r.isRedacted ? "Redacted" : "Personal data — not redacted"] : []),
            ...(r.fileId ? [] : ["No public file"]),
          ],
          publicHref: `/documents/${r.slug}`,
        }),
      );
    case "reports":
      return (await db.annualReport.findMany({ orderBy: { startYear: "desc" } })).map((r) =>
        row(resource, r, { title: `${r.periodLabel} — ${r.titleEn}`, titleTa: r.titleTa, flags: r.documentEnId || r.documentTaId ? [] : ["No PDF attached"], publicHref: `/reports/${r.slug}` }),
      );
    case "certificates":
      return (await db.certificate.findMany({ orderBy: [{ sortOrder: "asc" }, { issuedAt: "desc" }], include: { image: thumb } })).map((r) =>
        row(resource, r, {
          title: r.titleEn,
          titleTa: r.titleTa,
          subtitle: [r.kind.toLowerCase(), r.issuerEn, dateLabel(r.issuedAt)].filter(Boolean).join(" · "),
          thumbUrl: publicThumb(r.image),
          flags: r.verificationUrl ? ["Issuer link"] : [],
        }),
      );
    case "verification":
      return (await db.verificationRecord.findMany({ orderBy: [{ area: "asc" }, { sortOrder: "asc" }] })).map((r) =>
        row(resource, r, { title: r.titleEn, titleTa: r.titleTa, subtitle: [r.area.toLowerCase(), r.method.toLowerCase().replace(/_/g, " "), r.referenceNumber].filter(Boolean).join(" · ") }),
      );
    case "albums":
      return (await db.galleryAlbum.findMany({ orderBy: [{ sortOrder: "asc" }, { date: "desc" }], include: { cover: thumb, _count: { select: { images: true } } } })).map((r) =>
        row(resource, r, { title: r.titleEn, titleTa: r.titleTa, subtitle: `${r._count.images} photos${r.date ? ` · ${dateLabel(r.date)}` : ""}`, thumbUrl: publicThumb(r.cover), publicHref: `/gallery/${r.slug}` }),
      );
    case "news":
      return (await db.newsPost.findMany({ orderBy: { date: "desc" }, include: { cover: thumb } })).map((r) =>
        row(resource, r, { title: r.titleEn, titleTa: r.titleTa, subtitle: `${r.kind.toLowerCase()} · ${dateLabel(r.date)}`, thumbUrl: publicThumb(r.cover), publicHref: `/news/${r.slug}` }),
      );
    case "faqs":
      return (await db.faq.findMany({ orderBy: { sortOrder: "asc" } })).map((r) => row(resource, r, { title: r.questionEn, titleTa: r.questionTa }));
  }
});

// ─── Edit loaders ───────────────────────────────────────────────────────────

const mediaInclude = { select: { id: true, url: true, filename: true, mimeType: true, visibility: true, altEn: true } } as const;

export const getTrustProfileForEdit = adminQuery(() =>
  db.trustProfile.findUnique({ where: { id: "default" }, include: { logo: mediaInclude, heroImage: mediaInclude } }),
);
export const getTrusteeForEdit = adminQuery((id: string) =>
  db.trustee.findUnique({ where: { id }, include: { photo: mediaInclude, documents: { select: { id: true } } } }),
);
export const getObjectiveForEdit = adminQuery((id: string) => db.trustObjective.findUnique({ where: { id } }));
export const getHistoryForEdit = adminQuery((id: string) => db.historyEvent.findUnique({ where: { id }, include: { image: mediaInclude } }));
export const getFaqForEdit = adminQuery((id: string) => db.faq.findUnique({ where: { id } }));
export const getProjectForEdit = adminQuery((id: string) =>
  db.project.findUnique({ where: { id }, include: { cover: mediaInclude, documents: { select: { id: true } } } }),
);
export const getActivityForEdit = adminQuery((id: string) =>
  db.activity.findUnique({ where: { id }, include: { cover: mediaInclude, documents: { select: { id: true } } } }),
);
export const getMetricForEdit = adminQuery((id: string) => db.impactMetric.findUnique({ where: { id }, include: { activities: { select: { id: true } } } }));
export const getTestimonialForEdit = adminQuery((id: string) => db.testimonial.findUnique({ where: { id }, include: { photo: mediaInclude } }));
export const getStoryForEdit = adminQuery((id: string) => db.story.findUnique({ where: { id }, include: { cover: mediaInclude } }));
export const getDocumentForEdit = adminQuery((id: string) =>
  db.document.findUnique({ where: { id }, include: { file: mediaInclude, originalFile: mediaInclude, thumbnail: mediaInclude } }),
);
export const getReportForEdit = adminQuery((id: string) => db.annualReport.findUnique({ where: { id }, include: { cover: mediaInclude } }));
export const getCertificateForEdit = adminQuery((id: string) => db.certificate.findUnique({ where: { id }, include: { image: mediaInclude } }));
export const getVerificationForEdit = adminQuery((id: string) => db.verificationRecord.findUnique({ where: { id } }));
export const getAlbumForEdit = adminQuery((id: string) =>
  db.galleryAlbum.findUnique({
    where: { id },
    include: { cover: mediaInclude, images: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
  }),
);
export const getNewsForEdit = adminQuery((id: string) => db.newsPost.findUnique({ where: { id }, include: { cover: mediaInclude } }));
export const getSiteSettingsForEdit = adminQuery(async () => {
  const [settings, socialLinks] = await Promise.all([
    db.siteSetting.findUnique({ where: { id: "default" }, include: { ogImage: mediaInclude } }),
    db.socialLink.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return { settings, socialLinks };
});

export type PickedMedia = { id: string; url: string; filename: string; mimeType: string; visibility: "PUBLIC" | "PRIVATE"; altEn: string | null } | null;

/** Admin-safe media preview (private files go through the authenticated route). */
export function pickedMedia(media: { id: string; url: string; filename: string; mimeType: string; visibility: "PUBLIC" | "PRIVATE"; altEn: string | null } | null | undefined): PickedMedia {
  if (!media) return null;
  // Explicit fields only: never forward storage keys or uploader ids to the client.
  return {
    id: media.id,
    filename: media.filename,
    mimeType: media.mimeType,
    visibility: media.visibility,
    altEn: media.altEn,
    url: media.visibility === "PUBLIC" ? media.url : `/api/admin/media/${media.id}/file`,
  };
}

// ─── Relation options ───────────────────────────────────────────────────────

export type Option = { value: string; label: string; hint?: string };

export const getOptions = adminQuery(async () => {
  const [documents, projects, activities, trustees, reports, certificates, albums, categories] = await Promise.all([
    db.document.findMany({ select: { id: true, titleEn: true, year: true, visibility: true, status: true }, orderBy: { titleEn: "asc" } }),
    db.project.findMany({ select: { id: true, titleEn: true, status: true }, orderBy: { titleEn: "asc" } }),
    db.activity.findMany({ select: { id: true, titleEn: true, date: true, status: true }, orderBy: { date: "desc" } }),
    db.trustee.findMany({ select: { id: true, nameEn: true, status: true }, orderBy: { nameEn: "asc" } }),
    db.annualReport.findMany({ select: { id: true, periodLabel: true, titleEn: true, status: true }, orderBy: { startYear: "desc" } }),
    db.certificate.findMany({ select: { id: true, titleEn: true, status: true }, orderBy: { titleEn: "asc" } }),
    db.galleryAlbum.findMany({ select: { id: true, titleEn: true, status: true }, orderBy: { titleEn: "asc" } }),
    db.category.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }] }),
  ]);
  const hint = (status: string, extra?: string | number | null) => [status === "PUBLISHED" ? null : status.toLowerCase(), extra].filter(Boolean).join(" · ") || undefined;
  const byType = (type: CategoryType): Option[] => categories.filter((c) => c.type === type).map((c) => ({ value: c.id, label: c.nameEn }));
  return {
    documents: documents.map((d) => ({ value: d.id, label: d.titleEn, hint: hint(d.status, [d.year, d.visibility === "PRIVATE" ? "private" : null].filter(Boolean).join(" · ")) })),
    projects: projects.map((p) => ({ value: p.id, label: p.titleEn, hint: hint(p.status) })),
    activities: activities.map((a) => ({ value: a.id, label: a.titleEn, hint: hint(a.status, a.date.toISOString().slice(0, 10)) })),
    trustees: trustees.map((t) => ({ value: t.id, label: t.nameEn, hint: hint(t.status) })),
    reports: reports.map((r) => ({ value: r.id, label: `${r.periodLabel} — ${r.titleEn}`, hint: hint(r.status) })),
    certificates: certificates.map((c) => ({ value: c.id, label: c.titleEn, hint: hint(c.status) })),
    albums: albums.map((a) => ({ value: a.id, label: a.titleEn, hint: hint(a.status) })),
    categories: {
      ACTIVITY: byType("ACTIVITY"),
      PROJECT: byType("PROJECT"),
      DOCUMENT: byType("DOCUMENT"),
      NEWS: byType("NEWS"),
      GALLERY: byType("GALLERY"),
    },
  };
});
export type AdminOptions = Awaited<ReturnType<typeof getOptions>>;

// ─── Dashboard, translations, messages, media, users ───────────────────────

export const getDashboardData = adminQuery(async () => {
  const counts = await Promise.all(
    (Object.keys(RESOURCES) as ResourceKey[]).map(async (key) => {
      const rows = await listResourceRowsUnchecked(key);
      return {
        key,
        total: rows.length,
        published: rows.filter((r) => r.status === "PUBLISHED").length,
        drafts: rows.filter((r) => r.status === "DRAFT").length,
        untranslated: rows.filter((r) => r.missing.length > 0).length,
        demo: rows.filter((r) => r.isDemo).length,
      };
    }),
  );
  const [unread, messagesTotal, activity, recentMessages, mediaCount] = await Promise.all([
    db.contactMessage.count({ where: { status: "UNREAD" } }),
    db.contactMessage.count({ where: { status: { not: "ARCHIVED" } } }),
    db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 12, include: { user: { select: { name: true, email: true } } } }),
    db.contactMessage.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, subject: true, status: true, createdAt: true },
    }),
    db.media.count(),
  ]);
  return { counts, unread, messagesTotal, activity, recentMessages, mediaCount };
});

/** Used internally by already-authorized queries. */
async function listResourceRowsUnchecked(resource: ResourceKey) {
  return listResourceRows(resource);
}

export const getTranslationReport = adminQuery(async () => {
  const sections = await Promise.all(
    (Object.keys(RESOURCES) as ResourceKey[]).map(async (key) => {
      const rows = await listResourceRows(key);
      return { key, total: rows.length, rows: rows.filter((r) => r.missing.length > 0) };
    }),
  );
  const profile = await db.trustProfile.findUnique({ where: { id: "default" } });
  const profileStems = ["name", "shortName", "tagline", "heroText", "about", "history", "purpose", "geographicFocus", "vision", "mission", "registrationOffice", "legalStatus", "officialAddress", "officeHours"];
  return { sections, profileMissing: profile ? missingTamil(profile as unknown as Record<string, unknown>, profileStems) : [] };
});

export const listMessages = adminQuery(async (filter: "inbox" | "unread" | "archived") => {
  const where: { status: MessageStatus | { not: MessageStatus } } =
    filter === "archived" ? { status: "ARCHIVED" } : filter === "unread" ? { status: "UNREAD" } : { status: { not: "ARCHIVED" } };
  const [messages, counts] = await Promise.all([
    db.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, email: true, phone: true, subject: true, message: true, status: true, locale: true, isDemo: true, createdAt: true },
    }),
    db.contactMessage.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const byStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all])) as Partial<Record<MessageStatus, number>>;
  return {
    messages,
    counts: { inbox: (byStatus.UNREAD ?? 0) + (byStatus.READ ?? 0) + (byStatus.REPLIED ?? 0), unread: byStatus.UNREAD ?? 0, archived: byStatus.ARCHIVED ?? 0 },
  };
});

export const listMedia = adminQuery(async () => {
  const rows = await db.media.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return rows.map(toAdminMedia);
});

export const listUsers = adminQuery(() =>
  db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, email: true, name: true, role: true, lastLoginAt: true, createdAt: true } }),
);

export const listCategories = adminQuery(async () => {
  const rows = await db.category.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    include: { _count: { select: { activities: true, projects: true, documents: true, news: true, albums: true, impactMetrics: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    slug: r.slug,
    nameEn: r.nameEn,
    nameTa: r.nameTa,
    sortOrder: r.sortOrder,
    usage: Object.values(r._count).reduce((a, b) => a + b, 0),
  }));
});
