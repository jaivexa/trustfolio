import { z } from "zod";
import {
  checkbox,
  emptyToNull,
  idSchema,
  jsonField,
  lines,
  optionalDate,
  optionalInt,
  optionalText,
  optionalUrl,
  requiredDate,
  requiredText,
  slug,
  sortOrder,
} from "./common";
import { ACCENT_COLORS, NAV_KEYS, OBJECTIVE_ICON_NAMES, SOCIAL_PLATFORMS } from "@/lib/constants";

/**
 * Admin validation. Bilingual fields come in pairs: English is required where
 * the field is required; Tamil is always optional (missing = "translation
 * missing"), and is never auto-filled for official content.
 */

/** Required English (string), optional Tamil. */
function biReq<K extends string>(key: K, label: string, max: number, min = 1) {
  return {
    [`${key}En`]: requiredText(label, max, min),
    [`${key}Ta`]: optionalText(max),
  } as { [P in `${K}En`]: z.ZodType<string> } & { [P in `${K}Ta`]: z.ZodType<string | null> };
}

/** Optional English and Tamil. */
function biOpt<K extends string>(key: K, max: number) {
  const pair: Record<string, z.ZodType<string | null>> = {
    [`${key}En`]: optionalText(max),
    [`${key}Ta`]: optionalText(max),
  };
  return pair as { [P in `${K}En` | `${K}Ta`]: z.ZodType<string | null> };
}

export const optionalId = z.preprocess((v) => (v === "" || v === "none" ? null : v), idSchema.nullable());
export const idList = jsonField(z.array(idSchema).max(200));
export const status = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const optionalEmail = z.preprocess(emptyToNull, z.email("Enter a valid email").max(254).nullable());

// ─── Trust identity ─────────────────────────────────────────────────────────

export const trustProfileSchema = z.object({
  ...biReq("name", "Trust name (English)", 200),
  ...biOpt("shortName", 80),
  ...biOpt("tagline", 240),
  ...biOpt("heroText", 600),
  ...biOpt("about", 8000),
  ...biOpt("history", 20000),
  ...biOpt("purpose", 4000),
  ...biOpt("geographicFocus", 600),
  ...biOpt("vision", 1200),
  ...biOpt("mission", 1200),
  registrationNumber: optionalText(120),
  ...biOpt("registrationOffice", 200),
  registrationDate: optionalDate,
  ...biOpt("legalStatus", 300),
  ...biOpt("officialAddress", 600),
  establishedDate: optionalDate,
  registrationDocumentId: optionalId,
  publicEmail: optionalEmail,
  publicPhone: z.preprocess(emptyToNull, z.string().trim().regex(/^\+?[0-9\s()-]{6,20}$/, "Enter a valid phone number").nullable()),
  ...biOpt("officeHours", 300),
  mapUrl: optionalUrl,
  logoId: optionalId,
  heroImageId: optionalId,
});

// ─── People ─────────────────────────────────────────────────────────────────

export const trusteeSchema = z
  .object({
    slug,
    ...biReq("name", "Name (English)", 120),
    ...biReq("position", "Position (English)", 120),
    ...biOpt("bio", 10000),
    ...biOpt("vision", 2000),
    ...biOpt("contribution", 6000),
    responsibilitiesEn: lines(15, 200),
    responsibilitiesTa: lines(15, 200),
    photoId: optionalId,
    joinedAt: optionalDate,
    publicEmail: optionalEmail,
    linkedinUrl: optionalUrl,
    websiteUrl: optionalUrl,
    isFounder: checkbox,
    publicationConsent: checkbox,
    sortOrder,
    status,
    documentIds: idList,
  })
  .refine((d) => d.status !== "PUBLISHED" || d.publicationConsent, {
    path: ["publicationConsent"],
    message: "Record the trustee's consent before publishing their profile",
  });

// ─── Purpose & history ─────────────────────────────────────────────────────

export const objectiveSchema = z.object({
  ...biReq("title", "Title (English)", 160),
  ...biOpt("description", 2000),
  icon: z.enum(OBJECTIVE_ICON_NAMES),
  sourceReference: optionalText(200),
  sourceDocumentId: optionalId,
  sortOrder,
  status,
});

export const historySchema = z.object({
  date: requiredDate("Date"),
  ...biOpt("dateLabel", 60),
  ...biReq("title", "Title (English)", 200),
  ...biOpt("description", 3000),
  imageId: optionalId,
  documentId: optionalId,
  evidenceUrl: optionalUrl,
  trusteeId: optionalId,
  status,
});

export const faqSchema = z.object({
  ...biReq("question", "Question (English)", 300),
  ...biReq("answer", "Answer (English)", 4000),
  sortOrder,
  status,
});

export const categorySchema = z.object({
  type: z.enum(["ACTIVITY", "PROJECT", "DOCUMENT", "NEWS", "GALLERY"]),
  slug,
  ...biReq("name", "Name (English)", 80),
  sortOrder,
});

// ─── Work ──────────────────────────────────────────────────────────────────

export const projectSchema = z
  .object({
    slug,
    ...biReq("title", "Title (English)", 200),
    ...biReq("summary", "Summary (English)", 400, 10),
    ...biOpt("content", 20000),
    ...biOpt("need", 10000),
    ...biOpt("approach", 10000),
    ...biOpt("objectives", 6000),
    ...biOpt("location", 200),
    ...biOpt("externalUrlLabel", 80),
    ...biOpt("seoTitle", 70),
    ...biOpt("seoDescription", 170),
    categoryId: optionalId,
    phase: z.enum(["PLANNED", "ONGOING", "COMPLETED", "PAUSED"]),
    startDate: optionalDate,
    endDate: optionalDate,
    coverId: optionalId,
    isFeatured: checkbox,
    externalUrl: optionalUrl,
    sortOrder,
    status,
    documentIds: idList,
  })
  .refine((d) => !d.endDate || !d.startDate || d.endDate >= d.startDate, { path: ["endDate"], message: "End date must be after the start date" });

export const activitySchema = z
  .object({
    slug,
    ...biReq("title", "Title (English)", 200),
    ...biReq("summary", "Summary (English)", 400, 10),
    ...biOpt("description", 20000),
    ...biOpt("location", 200),
    ...biOpt("beneficiariesNote", 300),
    ...biOpt("impact", 6000),
    date: requiredDate("Date"),
    endDate: optionalDate,
    categoryId: optionalId,
    coverId: optionalId,
    beneficiaries: optionalInt(0, 100_000_000),
    projectId: optionalId,
    status,
    documentIds: idList,
  })
  .refine((d) => !d.endDate || d.endDate >= d.date, { path: ["endDate"], message: "End date must be after the start date" });

export const metricSchema = z
  .object({
    metricKey: slug,
    ...biReq("label", "Label (English)", 120),
    value: z.coerce.number({ error: "Enter a number" }).finite().min(0).max(1e12),
    prefix: optionalText(8),
    suffix: optionalText(8),
    ...biOpt("unit", 40),
    periodStart: optionalDate,
    periodEnd: optionalDate,
    ...biOpt("periodLabel", 60),
    ...biOpt("methodology", 3000),
    categoryId: optionalId,
    sourceDocumentId: optionalId,
    reportId: optionalId,
    projectId: optionalId,
    activityIds: idList,
    isHeadline: checkbox,
    sortOrder,
    status,
  })
  .refine((d) => !d.periodEnd || !d.periodStart || d.periodEnd >= d.periodStart, { path: ["periodEnd"], message: "Period end must be after the start" })
  .refine((d) => d.status !== "PUBLISHED" || Boolean(d.methodologyEn || d.sourceDocumentId || d.reportId), {
    path: ["methodologyEn"],
    message: "Published figures need a method or a source document/report",
  });

// ─── Voices ─────────────────────────────────────────────────────────────────

export const testimonialSchema = z
  .object({
    ...biReq("name", "Name (English)", 120),
    ...biOpt("role", 120),
    ...biOpt("organization", 160),
    ...biReq("content", "Testimonial (English)", 3000, 10),
    ...biOpt("relationship", 160),
    date: requiredDate("Date"),
    photoId: optionalId,
    relationshipVerified: checkbox,
    consentObtained: checkbox,
    projectId: optionalId,
    activityId: optionalId,
    sortOrder,
    status,
  })
  .refine((d) => d.status !== "PUBLISHED" || d.consentObtained, {
    path: ["consentObtained"],
    message: "Record consent before publishing a testimonial",
  });

export const storySchema = z
  .object({
    slug,
    ...biReq("title", "Title (English)", 200),
    ...biReq("summary", "Summary (English)", 500, 10),
    ...biOpt("subject", 200),
    ...biOpt("challenge", 8000),
    ...biOpt("support", 8000),
    ...biOpt("journey", 8000),
    ...biOpt("outcome", 8000),
    coverId: optionalId,
    albumId: optionalId,
    activityId: optionalId,
    projectId: optionalId,
    consentObtained: checkbox,
    anonymized: checkbox,
    status,
  })
  .refine((d) => d.status !== "PUBLISHED" || d.consentObtained, {
    path: ["consentObtained"],
    message: "Stories cannot be published without recorded consent",
  });

// ─── Evidence ───────────────────────────────────────────────────────────────

export const documentSchema = z
  .object({
    slug,
    ...biReq("title", "Title (English)", 250),
    ...biOpt("description", 4000),
    ...biOpt("source", 250),
    categoryId: optionalId,
    language: z.enum(["EN", "TA", "BILINGUAL", "OTHER"]),
    year: optionalInt(1900, 2200),
    documentDate: optionalDate,
    fileId: optionalId,
    originalFileId: optionalId,
    thumbnailId: optionalId,
    version: optionalText(40),
    isRedacted: checkbox,
    containsPersonalData: checkbox,
    visibility: z.enum(["PUBLIC", "PRIVATE"]),
    sortOrder,
    status,
  })
  .refine((d) => !(d.status === "PUBLISHED" && d.visibility === "PUBLIC" && d.containsPersonalData && !d.isRedacted), {
    path: ["isRedacted"],
    message: "This document contains personal data: upload a redacted public copy (and tick “redacted”) or keep it private",
  })
  .refine((d) => !(d.status === "PUBLISHED" && d.visibility === "PUBLIC" && !d.fileId), {
    path: ["fileId"],
    message: "Attach the public file before publishing",
  });

export const reportSchema = z.object({
  slug,
  periodLabel: requiredText("Period", 20),
  startYear: z.coerce.number().int().min(1900).max(2200),
  ...biReq("title", "Title (English)", 200),
  ...biOpt("summary", 4000),
  ...biOpt("highlights", 8000),
  ...biOpt("impact", 8000),
  ...biOpt("financial", 8000),
  coverId: optionalId,
  documentEnId: optionalId,
  documentTaId: optionalId,
  status,
});

export const certificateSchema = z
  .object({
    kind: z.enum(["CERTIFICATE", "AWARD", "RECOGNITION"]),
    ...biReq("title", "Title (English)", 200),
    ...biReq("issuer", "Issuer (English)", 200),
    ...biOpt("description", 2000),
    issuedAt: optionalDate,
    expiresAt: optionalDate,
    credentialId: optionalText(120),
    verificationUrl: optionalUrl,
    imageId: optionalId,
    documentId: optionalId,
    sortOrder,
    status,
  })
  .refine((d) => !d.expiresAt || !d.issuedAt || d.expiresAt >= d.issuedAt, { path: ["expiresAt"], message: "Expiry must be after the issue date" });

export const verificationSchema = z
  .object({
    area: z.enum(["IDENTITY", "REGISTRATION", "LEADERSHIP", "PROJECTS", "ACTIVITIES", "FINANCIAL", "CERTIFICATES", "OTHER"]),
    method: z.enum(["OFFICIAL_DOCUMENT", "PUBLIC_REGISTRY", "ISSUER_WEBSITE", "OTHER"]),
    ...biReq("title", "Title (English)", 200),
    ...biOpt("description", 2000),
    referenceNumber: optionalText(120),
    ...biOpt("issuingAuthority", 200),
    issuedAt: optionalDate,
    externalUrl: optionalUrl,
    lastCheckedAt: optionalDate,
    documentId: optionalId,
    certificateId: optionalId,
    projectId: optionalId,
    trusteeId: optionalId,
    sortOrder,
    status,
  })
  .refine((d) => d.status !== "PUBLISHED" || Boolean(d.documentId || d.externalUrl), {
    path: ["documentId"],
    message: "A published record must point to a document or an external source",
  })
  .refine((d) => !(d.method === "PUBLIC_REGISTRY" || d.method === "ISSUER_WEBSITE") || Boolean(d.externalUrl), {
    path: ["externalUrl"],
    message: "Add the registry/issuer link for this method",
  });

// ─── Gallery & news ────────────────────────────────────────────────────────

export const albumSchema = z.object({
  slug,
  ...biReq("title", "Title (English)", 200),
  ...biOpt("description", 3000),
  ...biOpt("location", 200),
  categoryId: optionalId,
  date: optionalDate,
  coverId: optionalId,
  activityId: optionalId,
  projectId: optionalId,
  imageIds: idList,
  sortOrder,
  status,
});

export const newsSchema = z
  .object({
    slug,
    kind: z.enum(["NEWS", "EVENT"]),
    ...biReq("title", "Title (English)", 200),
    ...biReq("excerpt", "Excerpt (English)", 400, 10),
    ...biReq("content", "Content (English)", 30000, 10),
    ...biOpt("eventLocation", 200),
    date: requiredDate("Date"),
    eventStart: optionalDate,
    eventEnd: optionalDate,
    authorName: optionalText(120),
    categoryId: optionalId,
    coverId: optionalId,
    activityId: optionalId,
    projectId: optionalId,
    status,
  })
  .refine((d) => d.kind !== "EVENT" || Boolean(d.eventStart), { path: ["eventStart"], message: "Events need a start date" });

// ─── Media metadata ─────────────────────────────────────────────────────────

export const mediaMetaSchema = z.object({
  ...biOpt("alt", 300),
  ...biOpt("caption", 500),
});

// ─── Settings ───────────────────────────────────────────────────────────────

export const siteSettingsSchema = z.object({
  ...biReq("seoTitle", "SEO title (English)", 70),
  ...biReq("seoDescription", "SEO description (English)", 170, 20),
  seoKeywords: z.preprocess(
    (v) => (typeof v === "string" ? [...new Set(v.split(",").map((s) => s.trim()).filter(Boolean))] : v),
    z.array(z.string().max(40)).max(20),
  ),
  ogImageId: optionalId,
  twitterHandle: z.preprocess(
    emptyToNull,
    z.string().trim().regex(/^@?[A-Za-z0-9_]{1,15}$/, "Enter a valid X handle").transform((v) => (v.startsWith("@") ? v : `@${v}`)).nullable(),
  ),
  defaultTheme: z.enum(["LIGHT", "DARK", "SYSTEM"]),
  accentColor: z.enum(ACCENT_COLORS),
  contactEnabled: checkbox,
  ...biOpt("footerNote", 200),
  analyticsDomain: z.preprocess(emptyToNull, z.string().trim().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Enter a domain like example.org").nullable()),
});

export const navigationSchema = z.object({
  navigation: jsonField(
    z
      .array(z.object({ key: z.enum(NAV_KEYS), visible: z.boolean() }))
      .refine((items) => new Set(items.map((i) => i.key)).size === items.length, "Duplicate navigation items"),
  ),
});

export const socialLinksSchema = z.object({
  links: jsonField(
    z
      .array(
        z.object({
          platform: z.enum(SOCIAL_PLATFORMS),
          label: requiredText("Label", 40),
          url: z.string().trim().max(2048).refine((v) => /^https:\/\//.test(v) || /^mailto:/.test(v), "Use an https:// or mailto: link"),
          isVisible: z.boolean().default(true),
        }),
      )
      .max(12)
      .refine((links) => new Set(links.map((l) => l.platform)).size === links.length, "Each platform can only be used once"),
  ),
});

export const userSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase().max(254),
  name: optionalText(120),
  role: z.enum(["ADMIN", "EDITOR"]),
});

