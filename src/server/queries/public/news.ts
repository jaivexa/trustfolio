import "server-only";
import { db } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/constants";
import { l10n, l10nOpt } from "@/lib/i18n/localized";
import type { Prisma } from "@/generated/prisma/client";
import { cached, categorySelect, iso, isoOrNull, mediaSelect, PUBLISHED, refSelect, toCategory, toMedia, toRef } from "./shared";
import type { NewsCardDTO, NewsDTO } from "./types";

const newsCardSelect = {
  id: true,
  slug: true,
  kind: true,
  titleEn: true,
  titleTa: true,
  excerptEn: true,
  excerptTa: true,
  date: true,
  eventStart: true,
  eventEnd: true,
  eventLocationEn: true,
  eventLocationTa: true,
  category: { select: categorySelect },
  cover: { select: mediaSelect },
} satisfies Prisma.NewsPostSelect;

function toNewsCard(row: Prisma.NewsPostGetPayload<{ select: typeof newsCardSelect }>): NewsCardDTO {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    title: l10n(row.titleEn, row.titleTa),
    excerpt: l10n(row.excerptEn, row.excerptTa),
    date: iso(row.date),
    eventStart: isoOrNull(row.eventStart),
    eventEnd: isoOrNull(row.eventEnd),
    eventLocation: l10nOpt(row.eventLocationEn, row.eventLocationTa),
    category: toCategory(row.category),
    cover: toMedia(row.cover),
  };
}

export const getNews = cached(
  async (): Promise<NewsCardDTO[]> => {
    const rows = await db.newsPost.findMany({ where: PUBLISHED, orderBy: { date: "desc" }, select: newsCardSelect });
    return rows.map(toNewsCard);
  },
  "news",
  [CACHE_TAGS.news, CACHE_TAGS.categories],
);

export const getNewsBySlug = cached(
  async (slug: string): Promise<NewsDTO | null> => {
    const row = await db.newsPost.findFirst({
      where: { slug, ...PUBLISHED },
      select: {
        ...newsCardSelect,
        contentEn: true,
        contentTa: true,
        authorName: true,
        updatedAt: true,
        activity: { select: refSelect },
        project: { select: refSelect },
      },
    });
    if (!row) return null;
    return {
      ...toNewsCard(row),
      content: l10n(row.contentEn, row.contentTa),
      authorName: row.authorName,
      activity: toRef(row.activity),
      project: toRef(row.project),
      updatedAt: iso(row.updatedAt),
    };
  },
  "news:by-slug",
  [CACHE_TAGS.news, CACHE_TAGS.activities, CACHE_TAGS.projects],
);
