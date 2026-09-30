"use server";

import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { deleteStoredFile } from "@/lib/storage";
import { idSchema } from "@/lib/validations/common";
import { albumSchema, mediaMetaSchema, newsSchema } from "@/lib/validations/admin";
import { adminMutation, expire, logActivity, parseForm, publishedAtFor } from "@/server/actions/admin-helpers";

const MEDIA_TAGS = [
  CACHE_TAGS.media,
  CACHE_TAGS.trust,
  CACHE_TAGS.trustees,
  CACHE_TAGS.projects,
  CACHE_TAGS.activities,
  CACHE_TAGS.gallery,
  CACHE_TAGS.news,
  CACHE_TAGS.stories,
  CACHE_TAGS.documents,
  CACHE_TAGS.certificates,
  CACHE_TAGS.reports,
  CACHE_TAGS.history,
  CACHE_TAGS.testimonials,
] as const;

export async function updateMediaMeta(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(mediaMetaSchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      const media = await db.media.update({ where: { id: idSchema.parse(id) }, data: parsed.data });
      await logActivity(user, "UPDATE", "Media", id, `Updated details of ${media.filename}`);
      expire(...MEDIA_TAGS);
      return { status: "success", message: "Media details saved" };
    },
    { values: parsed.values },
  );
}

/** Deletes the record (references are cleared by the schema) and the stored file. */
export async function deleteMedia(id: string): Promise<ActionState> {
  return adminMutation(async (user) => {
    const media = await db.media.delete({ where: { id: idSchema.parse(id) } });
    await deleteStoredFile(media);
    await logActivity(user, "DELETE", "Media", id, `Deleted ${media.filename}`);
    expire(...MEDIA_TAGS);
    return { status: "success", message: "File deleted" };
  });
}

export async function saveAlbum(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(albumSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { imageIds, ...data } = parsed.data;
  return adminMutation(
    async (user) => {
      // Albums are public by nature: only public images may be added.
      const privateCount = await db.media.count({ where: { id: { in: imageIds }, visibility: "PRIVATE" } });
      if (privateCount) return { status: "error", fieldErrors: { imageIds: ["Private files cannot be added to a public album"] }, values: parsed.values };

      const existing = id ? await db.galleryAlbum.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } }) : null;
      const payload = { ...data, publishedAt: publishedAtFor(data.status, existing?.publishedAt) };
      const row = await db.$transaction(async (tx) => {
        const album = id ? await tx.galleryAlbum.update({ where: { id }, data: payload }) : await tx.galleryAlbum.create({ data: payload });
        await tx.galleryImage.deleteMany({ where: { albumId: album.id } });
        await tx.galleryImage.createMany({ data: imageIds.map((mediaId, sortOrder) => ({ albumId: album.id, mediaId, sortOrder })) });
        return album;
      });
      await logActivity(user, id ? "UPDATE" : "CREATE", "GalleryAlbum", row.id, `${id ? "Updated" : "Created"} album “${row.titleEn}” (${imageIds.length} photos)`);
      expire(CACHE_TAGS.gallery, CACHE_TAGS.projects, CACHE_TAGS.activities, CACHE_TAGS.stories);
      return { status: "success", message: "Album saved", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function saveNews(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(newsSchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      const existing = id ? await db.newsPost.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } }) : null;
      const data = { ...parsed.data, publishedAt: publishedAtFor(parsed.data.status, existing?.publishedAt) };
      const row = id ? await db.newsPost.update({ where: { id }, data }) : await db.newsPost.create({ data });
      await logActivity(user, id ? "UPDATE" : "CREATE", "NewsPost", row.id, `${id ? "Updated" : "Created"} ${row.kind === "EVENT" ? "event" : "post"} “${row.titleEn}”`);
      expire(CACHE_TAGS.news);
      return { status: "success", message: "Post saved", id: row.id };
    },
    { values: parsed.values },
  );
}
