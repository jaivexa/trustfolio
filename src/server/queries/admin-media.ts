import "server-only";
import type { Media } from "@/generated/prisma/client";

/** Media as seen by the admin UI. Private files get an authenticated preview URL. */
export type AdminMedia = {
  id: string;
  url: string;
  previewUrl: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  visibility: "PUBLIC" | "PRIVATE";
  altEn: string | null;
  altTa: string | null;
  captionEn: string | null;
  captionTa: string | null;
  createdAt: string;
};

export function toAdminMedia(media: Media): AdminMedia {
  return {
    id: media.id,
    url: media.visibility === "PUBLIC" ? media.url : "",
    previewUrl: media.visibility === "PUBLIC" ? media.url : `/api/admin/media/${media.id}/file`,
    filename: media.filename,
    mimeType: media.mimeType,
    size: media.size,
    width: media.width,
    height: media.height,
    visibility: media.visibility,
    altEn: media.altEn,
    altTa: media.altTa,
    captionEn: media.captionEn,
    captionTa: media.captionTa,
    createdAt: media.createdAt.toISOString(),
  };
}
