import "server-only";
import { db } from "@/lib/db";
import { CACHE_TAGS, DEFAULT_NAVIGATION, NAV_KEYS, PENDING_MARKER, type NavKey } from "@/lib/constants";
import { l10n, l10nOpt } from "@/lib/i18n/localized";
import type { Prisma } from "@/generated/prisma/client";
import {
  cached,
  documentCardSelect,
  iso,
  isoOrNull,
  mediaSelect,
  PUBLISHED,
  publicDocuments,
  refSelect,
  toMedia,
  toRef,
} from "./shared";
import type {
  FaqDTO,
  HistoryEventDTO,
  ObjectiveDTO,
  SettingsDTO,
  TestimonialDTO,
  TrustDTO,
  TrusteeCardDTO,
  TrusteeDTO,
} from "./types";

/** Placeholder text is treated as "no data" so the UI shows a pending state. */
export function real(value: string | null | undefined): string | null {
  if (!value?.trim() || value.includes(PENDING_MARKER)) return null;
  return value;
}
const opt = (en: string | null | undefined, ta: string | null | undefined) => l10nOpt(real(en), real(ta));

export const getTrust = cached(
  async (): Promise<TrustDTO> => {
    const [profile, socialLinks] = await Promise.all([
      db.trustProfile.findUnique({
        where: { id: "default" },
        include: {
          logo: { select: mediaSelect },
          heroImage: { select: mediaSelect },
          registrationDocument: { select: documentCardSelect },
        },
      }),
      db.socialLink.findMany({ where: { isVisible: true }, orderBy: { sortOrder: "asc" } }),
    ]);

    const p = profile;
    return {
      name: l10n(real(p?.nameEn) ?? "", real(p?.nameTa)),
      namePending: !real(p?.nameEn),
      isDemo: p?.isDemo === true,
      shortName: opt(p?.shortNameEn, p?.shortNameTa),
      tagline: opt(p?.taglineEn, p?.taglineTa),
      heroText: opt(p?.heroTextEn, p?.heroTextTa),
      about: opt(p?.aboutEn, p?.aboutTa),
      history: opt(p?.historyEn, p?.historyTa),
      purpose: opt(p?.purposeEn, p?.purposeTa),
      geographicFocus: opt(p?.geographicFocusEn, p?.geographicFocusTa),
      vision: opt(p?.visionEn, p?.visionTa),
      mission: opt(p?.missionEn, p?.missionTa),
      registration: {
        number: real(p?.registrationNumber),
        office: opt(p?.registrationOfficeEn, p?.registrationOfficeTa),
        date: isoOrNull(p?.registrationDate),
        legalStatus: opt(p?.legalStatusEn, p?.legalStatusTa),
        address: opt(p?.officialAddressEn, p?.officialAddressTa),
        established: isoOrNull(p?.establishedDate),
        document: p?.registrationDocument ? (publicDocuments([p.registrationDocument])[0] ?? null) : null,
      },
      contact: {
        email: real(p?.publicEmail),
        phone: real(p?.publicPhone),
        hours: opt(p?.officeHoursEn, p?.officeHoursTa),
        mapUrl: real(p?.mapUrl),
        address: opt(p?.officialAddressEn, p?.officialAddressTa),
      },
      logo: toMedia(p?.logo),
      heroImage: toMedia(p?.heroImage),
      socialLinks: socialLinks.map((l) => ({ id: l.id, platform: l.platform, label: l.label, url: l.url })),
      updatedAt: iso(p?.updatedAt ?? new Date(0)),
    };
  },
  "trust",
  [CACHE_TAGS.trust],
);

function parseNavigation(value: Prisma.JsonValue): SettingsDTO["navigation"] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_NAVIGATION;
  const items = value.flatMap((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return [];
    const key = (item as Record<string, unknown>).key;
    const visible = (item as Record<string, unknown>).visible;
    return typeof key === "string" && (NAV_KEYS as readonly string[]).includes(key)
      ? [{ key: key as NavKey, visible: visible !== false }]
      : [];
  });
  // Keys added in later versions appear (hidden) at the end.
  const missing = DEFAULT_NAVIGATION.filter((d) => !items.some((i) => i.key === d.key)).map((d) => ({ ...d, visible: false }));
  return [...items, ...missing];
}

export const getSettings = cached(
  async (): Promise<SettingsDTO> => {
    const s = await db.siteSetting.findUnique({ where: { id: "default" }, include: { ogImage: { select: mediaSelect } } });
    return {
      seoTitle: l10n(s?.seoTitleEn ?? "Trustfolio", s?.seoTitleTa),
      seoDescription: l10n(s?.seoDescriptionEn ?? "", s?.seoDescriptionTa),
      seoKeywords: s?.seoKeywords ?? [],
      ogImage: toMedia(s?.ogImage),
      twitterHandle: s?.twitterHandle ?? null,
      defaultTheme: s?.defaultTheme ?? "SYSTEM",
      accentColor: s?.accentColor ?? "teal",
      navigation: parseNavigation(s?.navigation ?? []),
      contactEnabled: s?.contactEnabled ?? true,
      footerNote: l10nOpt(s?.footerNoteEn, s?.footerNoteTa),
      analyticsDomain: s?.analyticsDomain ?? null,
    };
  },
  "settings",
  [CACHE_TAGS.settings],
);

// ─── Objectives, history, FAQ ───────────────────────────────────────────────

export const getObjectives = cached(
  async (): Promise<ObjectiveDTO[]> => {
    const rows = await db.trustObjective.findMany({
      where: PUBLISHED,
      orderBy: { sortOrder: "asc" },
      include: { sourceDocument: { select: { ...refSelect, visibility: true, containsPersonalData: true, isRedacted: true } } },
    });
    return rows.map((row) => ({
      id: row.id,
      title: l10n(row.titleEn, row.titleTa),
      description: l10nOpt(row.descriptionEn, row.descriptionTa),
      icon: row.icon,
      sourceReference: row.sourceReference,
      sourceDocument:
        row.sourceDocument && row.sourceDocument.visibility === "PUBLIC" && (!row.sourceDocument.containsPersonalData || row.sourceDocument.isRedacted)
          ? toRef(row.sourceDocument)
          : null,
    }));
  },
  "objectives",
  [CACHE_TAGS.objectives, CACHE_TAGS.documents],
);

const historySelect = {
  id: true,
  date: true,
  dateLabelEn: true,
  dateLabelTa: true,
  titleEn: true,
  titleTa: true,
  descriptionEn: true,
  descriptionTa: true,
  evidenceUrl: true,
  image: { select: mediaSelect },
  document: { select: { ...refSelect, visibility: true, containsPersonalData: true, isRedacted: true } },
} satisfies Prisma.HistoryEventSelect;

function toHistory(row: Prisma.HistoryEventGetPayload<{ select: typeof historySelect }>): HistoryEventDTO {
  const doc = row.document;
  return {
    id: row.id,
    date: iso(row.date),
    dateLabel: l10nOpt(row.dateLabelEn, row.dateLabelTa),
    title: l10n(row.titleEn, row.titleTa),
    description: l10nOpt(row.descriptionEn, row.descriptionTa),
    image: toMedia(row.image),
    document: doc && doc.visibility === "PUBLIC" && (!doc.containsPersonalData || doc.isRedacted) ? toRef(doc) : null,
    evidenceUrl: row.evidenceUrl,
  };
}

export const getHistory = cached(
  async (): Promise<HistoryEventDTO[]> => {
    const rows = await db.historyEvent.findMany({ where: PUBLISHED, orderBy: { date: "asc" }, select: historySelect });
    return rows.map(toHistory);
  },
  "history",
  [CACHE_TAGS.history, CACHE_TAGS.documents],
);

export const getFaqs = cached(
  async (): Promise<FaqDTO[]> => {
    const rows = await db.faq.findMany({ where: PUBLISHED, orderBy: { sortOrder: "asc" } });
    return rows.map((row) => ({ id: row.id, question: l10n(row.questionEn, row.questionTa), answer: l10n(row.answerEn, row.answerTa) }));
  },
  "faqs",
  [CACHE_TAGS.faqs],
);

// ─── Trustees & founder ─────────────────────────────────────────────────────

/** Trustees must be published AND have publication consent recorded. */
const PUBLIC_TRUSTEE = { status: "PUBLISHED", publicationConsent: true } as const;

function excerpt(value: string | null | undefined, max = 220): string | null {
  if (!value) return null;
  const plain = value.replace(/[#*_>`[\]()]/g, "").replace(/\s+/g, " ").trim();
  return plain.length > max ? `${plain.slice(0, max - 1)}…` : plain;
}

export const getTrustees = cached(
  async (): Promise<TrusteeCardDTO[]> => {
    const rows = await db.trustee.findMany({
      where: PUBLIC_TRUSTEE,
      orderBy: [{ isFounder: "desc" }, { sortOrder: "asc" }],
      include: { photo: { select: mediaSelect } },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: l10n(row.nameEn, row.nameTa),
      position: l10n(row.positionEn, row.positionTa),
      photo: toMedia(row.photo),
      isFounder: row.isFounder,
      bioExcerpt: l10nOpt(excerpt(row.bioEn), excerpt(row.bioTa)),
    }));
  },
  "trustees",
  [CACHE_TAGS.trustees],
);

export const getTrusteeBySlug = cached(
  async (slug: string): Promise<TrusteeDTO | null> => {
    const row = await db.trustee.findFirst({
      where: { slug, ...PUBLIC_TRUSTEE },
      include: {
        photo: { select: mediaSelect },
        documents: { select: documentCardSelect, orderBy: { documentDate: "desc" } },
        historyEvents: { where: PUBLISHED, orderBy: { date: "asc" }, select: historySelect },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      slug: row.slug,
      name: l10n(row.nameEn, row.nameTa),
      position: l10n(row.positionEn, row.positionTa),
      photo: toMedia(row.photo),
      isFounder: row.isFounder,
      bioExcerpt: l10nOpt(excerpt(row.bioEn), excerpt(row.bioTa)),
      bio: l10nOpt(row.bioEn, row.bioTa),
      joinedAt: isoOrNull(row.joinedAt),
      responsibilities: { en: row.responsibilitiesEn, ta: row.responsibilitiesTa },
      publicEmail: row.publicEmail,
      linkedinUrl: row.linkedinUrl,
      websiteUrl: row.websiteUrl,
      vision: l10nOpt(row.visionEn, row.visionTa),
      contribution: l10nOpt(row.contributionEn, row.contributionTa),
      timeline: row.historyEvents.map(toHistory),
      documents: publicDocuments(row.documents),
      updatedAt: iso(row.updatedAt),
    };
  },
  "trustee:by-slug",
  [CACHE_TAGS.trustees, CACHE_TAGS.history, CACHE_TAGS.documents],
);

export const getFounder = cached(
  async (): Promise<TrusteeDTO | null> => {
    const founder = await db.trustee.findFirst({ where: { isFounder: true, ...PUBLIC_TRUSTEE }, select: { slug: true } });
    return founder ? getTrusteeBySlug(founder.slug) : null;
  },
  "founder",
  [CACHE_TAGS.trustees, CACHE_TAGS.history, CACHE_TAGS.documents],
);

// ─── Testimonials ───────────────────────────────────────────────────────────

export const testimonialSelect = {
  id: true,
  nameEn: true,
  nameTa: true,
  roleEn: true,
  roleTa: true,
  organizationEn: true,
  organizationTa: true,
  contentEn: true,
  contentTa: true,
  date: true,
  relationshipEn: true,
  relationshipTa: true,
  relationshipVerified: true,
  photo: { select: mediaSelect },
  project: { select: refSelect },
} satisfies Prisma.TestimonialSelect;

export function toTestimonial(row: Prisma.TestimonialGetPayload<{ select: typeof testimonialSelect }>): TestimonialDTO {
  return {
    id: row.id,
    name: l10n(row.nameEn, row.nameTa),
    role: l10nOpt(row.roleEn, row.roleTa),
    organization: l10nOpt(row.organizationEn, row.organizationTa),
    photo: toMedia(row.photo),
    content: l10n(row.contentEn, row.contentTa),
    date: iso(row.date),
    relationship: l10nOpt(row.relationshipEn, row.relationshipTa),
    relationshipVerified: row.relationshipVerified,
    project: toRef(row.project),
  };
}

/** Testimonials publish only with recorded consent. */
export const PUBLIC_TESTIMONIAL = { status: "PUBLISHED", consentObtained: true } as const;

export const getTestimonials = cached(
  async (): Promise<TestimonialDTO[]> => {
    const rows = await db.testimonial.findMany({
      where: PUBLIC_TESTIMONIAL,
      orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
      select: testimonialSelect,
    });
    return rows.map(toTestimonial);
  },
  "testimonials",
  [CACHE_TAGS.testimonials, CACHE_TAGS.projects],
);

/**
 * True when any fictional seed content is visible on the public site. Drives
 * the "demonstration website" banner, noindex and the omission of
 * Organization structured data, so demo data is never presented as real.
 */
export const getDemoStatus = cached(
  async (): Promise<{ active: boolean }> => {
    const demo = { isDemo: true, ...PUBLISHED };
    const counts = await Promise.all([
      db.trustProfile.count({ where: { isDemo: true } }),
      db.project.count({ where: demo }),
      db.activity.count({ where: demo }),
      db.trustee.count({ where: demo }),
      db.newsPost.count({ where: demo }),
      db.document.count({ where: demo }),
      db.impactMetric.count({ where: demo }),
      db.testimonial.count({ where: demo }),
      db.galleryAlbum.count({ where: demo }),
    ]);
    return { active: counts.some((n) => n > 0) };
  },
  "demo-status",
  [CACHE_TAGS.trust, CACHE_TAGS.projects, CACHE_TAGS.activities, CACHE_TAGS.trustees, CACHE_TAGS.news, CACHE_TAGS.documents, CACHE_TAGS.impact, CACHE_TAGS.testimonials, CACHE_TAGS.gallery],
);
