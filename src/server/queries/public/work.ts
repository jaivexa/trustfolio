import "server-only";
import { db } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/constants";
import { l10n, l10nOpt } from "@/lib/i18n/localized";
import type { CategoryType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { albumSelect, toAlbum } from "./gallery";
import { metricSelect, toMetric } from "./impact";
import {
  cached,
  categorySelect,
  documentCardSelect,
  iso,
  isoOrNull,
  mediaSelect,
  PUBLISHED,
  publicDocuments,
  refSelect,
  toCategory,
  toMedia,
  toRef,
} from "./shared";
import { PUBLIC_TESTIMONIAL, testimonialSelect, toTestimonial } from "./trust";
import type {
  ActivityCardDTO,
  ActivityDTO,
  CategoryDTO,
  ProjectCardDTO,
  ProjectDTO,
  StoryCardDTO,
  StoryDTO,
  VerificationRecordDTO,
} from "./types";

export const getCategories = cached(
  async (type: CategoryType): Promise<CategoryDTO[]> => {
    const rows = await db.category.findMany({ where: { type }, orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }], select: categorySelect });
    return rows.flatMap((row) => toCategory(row) ?? []);
  },
  "categories",
  [CACHE_TAGS.categories],
);

// ─── Projects ───────────────────────────────────────────────────────────────

const projectCardSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleTa: true,
  summaryEn: true,
  summaryTa: true,
  phase: true,
  startDate: true,
  endDate: true,
  locationEn: true,
  locationTa: true,
  isFeatured: true,
  category: { select: categorySelect },
  cover: { select: mediaSelect },
} satisfies Prisma.ProjectSelect;

function toProjectCard(row: Prisma.ProjectGetPayload<{ select: typeof projectCardSelect }>): ProjectCardDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: l10n(row.titleEn, row.titleTa),
    summary: l10n(row.summaryEn, row.summaryTa),
    category: toCategory(row.category),
    phase: row.phase,
    startDate: isoOrNull(row.startDate),
    endDate: isoOrNull(row.endDate),
    location: l10nOpt(row.locationEn, row.locationTa),
    cover: toMedia(row.cover),
    isFeatured: row.isFeatured,
  };
}

const projectOrder: Prisma.ProjectOrderByWithRelationInput[] = [
  { isFeatured: "desc" },
  { sortOrder: "asc" },
  { startDate: { sort: "desc", nulls: "last" } },
];

export const getProjects = cached(
  async (): Promise<ProjectCardDTO[]> => {
    const rows = await db.project.findMany({ where: PUBLISHED, orderBy: projectOrder, select: projectCardSelect });
    return rows.map(toProjectCard);
  },
  "projects",
  [CACHE_TAGS.projects, CACHE_TAGS.categories],
);

// ─── Activities ─────────────────────────────────────────────────────────────

const activityCardSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleTa: true,
  summaryEn: true,
  summaryTa: true,
  date: true,
  endDate: true,
  locationEn: true,
  locationTa: true,
  beneficiaries: true,
  category: { select: categorySelect },
  cover: { select: mediaSelect },
  project: { select: refSelect },
} satisfies Prisma.ActivitySelect;

function toActivityCard(row: Prisma.ActivityGetPayload<{ select: typeof activityCardSelect }>): ActivityCardDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: l10n(row.titleEn, row.titleTa),
    summary: l10n(row.summaryEn, row.summaryTa),
    date: iso(row.date),
    endDate: isoOrNull(row.endDate),
    location: l10nOpt(row.locationEn, row.locationTa),
    category: toCategory(row.category),
    cover: toMedia(row.cover),
    beneficiaries: row.beneficiaries,
    project: toRef(row.project),
  };
}

export const getActivities = cached(
  async (): Promise<ActivityCardDTO[]> => {
    const rows = await db.activity.findMany({ where: PUBLISHED, orderBy: { date: "desc" }, select: activityCardSelect });
    return rows.map(toActivityCard);
  },
  "activities",
  [CACHE_TAGS.activities, CACHE_TAGS.categories, CACHE_TAGS.projects],
);

// ─── Stories ────────────────────────────────────────────────────────────────

/** Stories publish only with recorded consent. */
const PUBLIC_STORY = { status: "PUBLISHED", consentObtained: true } as const;

const storyCardSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleTa: true,
  summaryEn: true,
  summaryTa: true,
  publishedAt: true,
  anonymized: true,
  cover: { select: mediaSelect },
} satisfies Prisma.StorySelect;

function toStoryCard(row: Prisma.StoryGetPayload<{ select: typeof storyCardSelect }>): StoryCardDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: l10n(row.titleEn, row.titleTa),
    summary: l10n(row.summaryEn, row.summaryTa),
    cover: toMedia(row.cover),
    publishedAt: isoOrNull(row.publishedAt),
    anonymized: row.anonymized,
  };
}

export const getStories = cached(
  async (): Promise<StoryCardDTO[]> => {
    const rows = await db.story.findMany({ where: PUBLIC_STORY, orderBy: { publishedAt: "desc" }, select: storyCardSelect });
    return rows.map(toStoryCard);
  },
  "stories",
  [CACHE_TAGS.stories],
);

export const getStoryBySlug = cached(
  async (slug: string): Promise<StoryDTO | null> => {
    const row = await db.story.findFirst({
      where: { slug, ...PUBLIC_STORY },
      select: {
        ...storyCardSelect,
        subjectEn: true,
        subjectTa: true,
        challengeEn: true,
        challengeTa: true,
        supportEn: true,
        supportTa: true,
        journeyEn: true,
        journeyTa: true,
        outcomeEn: true,
        outcomeTa: true,
        album: { select: { ...albumSelect, status: true } },
        activity: { select: refSelect },
        project: { select: refSelect },
      },
    });
    if (!row) return null;
    const album = row.album && row.album.status === "PUBLISHED" ? toAlbum(row.album) : null;
    return {
      ...toStoryCard(row),
      subject: l10nOpt(row.subjectEn, row.subjectTa),
      challenge: l10nOpt(row.challengeEn, row.challengeTa),
      support: l10nOpt(row.supportEn, row.supportTa),
      journey: l10nOpt(row.journeyEn, row.journeyTa),
      outcome: l10nOpt(row.outcomeEn, row.outcomeTa),
      images: album?.images ?? [],
      activity: toRef(row.activity),
      project: toRef(row.project),
    };
  },
  "story:by-slug",
  [CACHE_TAGS.stories, CACHE_TAGS.gallery],
);

// ─── Details ────────────────────────────────────────────────────────────────

const verificationSelect = {
  id: true,
  area: true,
  method: true,
  titleEn: true,
  titleTa: true,
  descriptionEn: true,
  descriptionTa: true,
  referenceNumber: true,
  issuingAuthorityEn: true,
  issuingAuthorityTa: true,
  issuedAt: true,
  externalUrl: true,
  lastCheckedAt: true,
  document: { select: { ...refSelect, visibility: true, containsPersonalData: true, isRedacted: true } },
} satisfies Prisma.VerificationRecordSelect;

export function toVerification(row: Prisma.VerificationRecordGetPayload<{ select: typeof verificationSelect }>): VerificationRecordDTO {
  const doc = row.document;
  return {
    id: row.id,
    area: row.area,
    method: row.method,
    title: l10n(row.titleEn, row.titleTa),
    description: l10nOpt(row.descriptionEn, row.descriptionTa),
    referenceNumber: row.referenceNumber,
    issuingAuthority: l10nOpt(row.issuingAuthorityEn, row.issuingAuthorityTa),
    issuedAt: isoOrNull(row.issuedAt),
    externalUrl: row.externalUrl,
    lastCheckedAt: isoOrNull(row.lastCheckedAt),
    document: doc && doc.visibility === "PUBLIC" && (!doc.containsPersonalData || doc.isRedacted) ? toRef(doc) : null,
  };
}
export { verificationSelect };

export const getProjectBySlug = cached(
  async (slug: string): Promise<ProjectDTO | null> => {
    const row = await db.project.findFirst({
      where: { slug, ...PUBLISHED },
      select: {
        ...projectCardSelect,
        contentEn: true,
        contentTa: true,
        needEn: true,
        needTa: true,
        approachEn: true,
        approachTa: true,
        outcomeEn: true,
        outcomeTa: true,
        objectivesEn: true,
        objectivesTa: true,
        externalUrl: true,
        externalUrlLabelEn: true,
        externalUrlLabelTa: true,
        seoTitleEn: true,
        seoTitleTa: true,
        seoDescriptionEn: true,
        seoDescriptionTa: true,
        publishedAt: true,
        updatedAt: true,
        activities: { where: PUBLISHED, orderBy: { date: "desc" }, select: activityCardSelect },
        documents: { select: documentCardSelect, orderBy: { documentDate: { sort: "desc", nulls: "last" } } },
        testimonials: { where: PUBLIC_TESTIMONIAL, orderBy: { sortOrder: "asc" }, select: testimonialSelect },
        impactMetrics: { where: PUBLISHED, orderBy: { sortOrder: "asc" }, select: metricSelect },
        albums: { where: PUBLISHED, orderBy: { sortOrder: "asc" }, select: albumSelect },
        stories: { where: PUBLIC_STORY, orderBy: { publishedAt: "desc" }, select: storyCardSelect },
        verificationRecords: { where: PUBLISHED, orderBy: { sortOrder: "asc" }, select: verificationSelect },
      },
    });
    if (!row) return null;

    const others = await db.project.findMany({
      where: { ...PUBLISHED, id: { not: row.id } },
      orderBy: projectOrder,
      select: projectCardSelect,
      take: 12,
    });
    const related = [
      ...others.filter((p) => p.category?.id && p.category.id === row.category?.id),
      ...others.filter((p) => !p.category?.id || p.category.id !== row.category?.id),
    ]
      .slice(0, 3)
      .map(toProjectCard);

    return {
      ...toProjectCard(row),
      content: l10nOpt(row.contentEn, row.contentTa),
      need: l10nOpt(row.needEn, row.needTa),
      approach: l10nOpt(row.approachEn, row.approachTa),
      outcome: l10nOpt(row.outcomeEn, row.outcomeTa),
      objectives: l10nOpt(row.objectivesEn, row.objectivesTa),
      externalUrl: row.externalUrl,
      externalUrlLabel: l10nOpt(row.externalUrlLabelEn, row.externalUrlLabelTa),
      seoTitle: l10nOpt(row.seoTitleEn, row.seoTitleTa),
      seoDescription: l10nOpt(row.seoDescriptionEn, row.seoDescriptionTa),
      activities: row.activities.map(toActivityCard),
      documents: publicDocuments(row.documents),
      testimonials: row.testimonials.map(toTestimonial),
      metrics: row.impactMetrics.map(toMetric),
      albums: row.albums.map(toAlbum).filter((a) => a.imageCount > 0),
      stories: row.stories.map(toStoryCard),
      verificationRecords: row.verificationRecords.map(toVerification),
      related,
      publishedAt: isoOrNull(row.publishedAt),
      updatedAt: iso(row.updatedAt),
    };
  },
  "project:by-slug",
  [
    CACHE_TAGS.projects,
    CACHE_TAGS.activities,
    CACHE_TAGS.documents,
    CACHE_TAGS.testimonials,
    CACHE_TAGS.impact,
    CACHE_TAGS.gallery,
    CACHE_TAGS.stories,
    CACHE_TAGS.verification,
  ],
);

export const getActivityBySlug = cached(
  async (slug: string): Promise<ActivityDTO | null> => {
    const row = await db.activity.findFirst({
      where: { slug, ...PUBLISHED },
      select: {
        ...activityCardSelect,
        descriptionEn: true,
        descriptionTa: true,
        beneficiariesNoteEn: true,
        beneficiariesNoteTa: true,
        impactEn: true,
        impactTa: true,
        publishedAt: true,
        updatedAt: true,
        documents: { select: documentCardSelect },
        albums: { where: PUBLISHED, orderBy: { sortOrder: "asc" }, select: albumSelect },
        stories: { where: PUBLIC_STORY, select: storyCardSelect },
        testimonials: { where: PUBLIC_TESTIMONIAL, select: testimonialSelect },
      },
    });
    if (!row) return null;
    return {
      ...toActivityCard(row),
      description: l10nOpt(row.descriptionEn, row.descriptionTa),
      beneficiariesNote: l10nOpt(row.beneficiariesNoteEn, row.beneficiariesNoteTa),
      impact: l10nOpt(row.impactEn, row.impactTa),
      documents: publicDocuments(row.documents),
      albums: row.albums.map(toAlbum).filter((a) => a.imageCount > 0),
      stories: row.stories.map(toStoryCard),
      testimonials: row.testimonials.map(toTestimonial),
      publishedAt: isoOrNull(row.publishedAt),
      updatedAt: iso(row.updatedAt),
    };
  },
  "activity:by-slug",
  [CACHE_TAGS.activities, CACHE_TAGS.documents, CACHE_TAGS.gallery, CACHE_TAGS.stories, CACHE_TAGS.testimonials],
);
