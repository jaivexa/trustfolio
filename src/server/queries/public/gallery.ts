import "server-only";
import { db } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/constants";
import { l10n, l10nOpt } from "@/lib/i18n/localized";
import type { Prisma } from "@/generated/prisma/client";
import { cached, categorySelect, isoOrNull, mediaSelect, PUBLISHED, refSelect, toCategory, toMedia, toRef } from "./shared";
import type { AlbumCardDTO, AlbumDTO } from "./types";

export const albumSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleTa: true,
  descriptionEn: true,
  descriptionTa: true,
  date: true,
  locationEn: true,
  locationTa: true,
  category: { select: categorySelect },
  cover: { select: mediaSelect },
  activity: { select: refSelect },
  project: { select: refSelect },
  images: {
    orderBy: { sortOrder: "asc" },
    where: { media: { visibility: "PUBLIC" } },
    select: { media: { select: mediaSelect } },
  },
} satisfies Prisma.GalleryAlbumSelect;

type AlbumRow = Prisma.GalleryAlbumGetPayload<{ select: typeof albumSelect }>;

export function toAlbum(row: AlbumRow): AlbumDTO {
  const images = row.images.flatMap((image) => toMedia(image.media) ?? []);
  return {
    id: row.id,
    slug: row.slug,
    title: l10n(row.titleEn, row.titleTa),
    description: l10nOpt(row.descriptionEn, row.descriptionTa),
    date: isoOrNull(row.date),
    location: l10nOpt(row.locationEn, row.locationTa),
    category: toCategory(row.category),
    cover: toMedia(row.cover) ?? images[0] ?? null,
    imageCount: images.length,
    images,
    activity: toRef(row.activity),
    project: toRef(row.project),
  };
}

export function toAlbumCard(album: AlbumDTO): AlbumCardDTO {
  return {
    id: album.id,
    slug: album.slug,
    title: album.title,
    description: album.description,
    date: album.date,
    location: album.location,
    category: album.category,
    cover: album.cover,
    imageCount: album.imageCount,
  };
}

export const getAlbums = cached(
  async (): Promise<AlbumDTO[]> => {
    const rows = await db.galleryAlbum.findMany({
      where: PUBLISHED,
      orderBy: [{ sortOrder: "asc" }, { date: { sort: "desc", nulls: "last" } }],
      select: albumSelect,
    });
    return rows.map(toAlbum).filter((album) => album.imageCount > 0);
  },
  "albums",
  [CACHE_TAGS.gallery, CACHE_TAGS.media],
);

export const getAlbumBySlug = cached(
  async (slug: string): Promise<AlbumDTO | null> => {
    const row = await db.galleryAlbum.findFirst({ where: { slug, ...PUBLISHED }, select: albumSelect });
    return row ? toAlbum(row) : null;
  },
  "album:by-slug",
  [CACHE_TAGS.gallery, CACHE_TAGS.media],
);
