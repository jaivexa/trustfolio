import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { CacheTag } from "@/lib/constants";
import { l10n, l10nOpt } from "@/lib/i18n/localized";
import type { Prisma } from "@/generated/prisma/client";
import type { CategoryDTO, DocumentCardDTO, LinkRef, MediaDTO } from "./types";

/**
 * Cached across requests (tag-invalidated by admin mutations) and memoized
 * within a request. A daily revalidation acts as a safety net.
 */
export function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string, tags: CacheTag[]) {
  return cache(unstable_cache(fn, [key], { tags, revalidate: 86_400 }));
}

export const PUBLISHED = { status: "PUBLISHED" } as const;

export const iso = (date: Date) => date.toISOString();
export const isoOrNull = (date: Date | null | undefined) => (date ? date.toISOString() : null);

// ─── Media ──────────────────────────────────────────────────────────────────

export const mediaSelect = {
  id: true,
  url: true,
  mimeType: true,
  width: true,
  height: true,
  altEn: true,
  altTa: true,
  captionEn: true,
  captionTa: true,
  visibility: true,
} satisfies Prisma.MediaSelect;

type MediaRow = Prisma.MediaGetPayload<{ select: typeof mediaSelect }>;

/** PRIVATE media never leaves the server, even if linked by mistake. */
export function toMedia(row: MediaRow | null | undefined): MediaDTO | null {
  if (!row || row.visibility !== "PUBLIC") return null;
  return {
    id: row.id,
    url: row.url,
    mimeType: row.mimeType,
    width: row.width,
    height: row.height,
    alt: l10nOpt(row.altEn, row.altTa),
    caption: l10nOpt(row.captionEn, row.captionTa),
  };
}

// ─── Categories & references ───────────────────────────────────────────────

export const categorySelect = { id: true, slug: true, nameEn: true, nameTa: true } satisfies Prisma.CategorySelect;

export function toCategory(row: Prisma.CategoryGetPayload<{ select: typeof categorySelect }> | null): CategoryDTO | null {
  return row ? { id: row.id, slug: row.slug, name: l10n(row.nameEn, row.nameTa) } : null;
}

export const refSelect = { slug: true, titleEn: true, titleTa: true, status: true } as const;

/** A link to another record, only if that record is itself published. */
export function toRef(
  row: { slug: string; titleEn: string; titleTa: string | null; status: string } | null | undefined,
): LinkRef | null {
  if (!row || row.status !== "PUBLISHED") return null;
  return { slug: row.slug, title: l10n(row.titleEn, row.titleTa) };
}

// ─── Documents ──────────────────────────────────────────────────────────────

export const documentCardSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleTa: true,
  descriptionEn: true,
  descriptionTa: true,
  language: true,
  year: true,
  documentDate: true,
  version: true,
  isRedacted: true,
  containsPersonalData: true,
  visibility: true,
  status: true,
  publishedAt: true,
  updatedAt: true,
  category: { select: categorySelect },
  file: { select: { ...mediaSelect, size: true, filename: true } },
  thumbnail: { select: mediaSelect },
} satisfies Prisma.DocumentSelect;

export type DocumentCardRow = Prisma.DocumentGetPayload<{ select: typeof documentCardSelect }>;

/** Public documents only: published, public, and redacted if they hold personal data. */
export const PUBLIC_DOCUMENT_WHERE = {
  status: "PUBLISHED",
  visibility: "PUBLIC",
  OR: [{ containsPersonalData: false }, { isRedacted: true }],
} satisfies Prisma.DocumentWhereInput;

export function isPublicDocument(row: {
  status: string;
  visibility: string;
  containsPersonalData: boolean;
  isRedacted: boolean;
}): boolean {
  return (
    row.status === "PUBLISHED" && row.visibility === "PUBLIC" && (!row.containsPersonalData || row.isRedacted)
  );
}

export function toDocumentCard(row: DocumentCardRow): DocumentCardDTO {
  const file = row.file && row.file.visibility === "PUBLIC" ? row.file : null;
  return {
    id: row.id,
    slug: row.slug,
    title: l10n(row.titleEn, row.titleTa),
    description: l10nOpt(row.descriptionEn, row.descriptionTa),
    category: toCategory(row.category),
    language: row.language,
    year: row.year,
    documentDate: isoOrNull(row.documentDate),
    version: row.version,
    isRedacted: row.isRedacted,
    file: file ? { url: file.url, mimeType: file.mimeType, size: file.size, filename: file.filename } : null,
    thumbnail: toMedia(row.thumbnail),
    publishedAt: isoOrNull(row.publishedAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function publicDocuments(rows: DocumentCardRow[]): DocumentCardDTO[] {
  return rows.filter(isPublicDocument).map(toDocumentCard);
}
