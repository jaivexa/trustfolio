import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { env } from "@/lib/env";

/**
 * Pluggable file storage.
 *  - `local`: writes to ./uploads and serves via /uploads/[...path] (dev & self-hosting with a volume)
 *  - `vercel-blob`: Vercel Blob (serverless-friendly, recommended in production)
 */

export const ALLOWED_UPLOAD_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "application/pdf": "pdf",
} as const;

export type AllowedUploadType = keyof typeof ALLOWED_UPLOAD_TYPES;

export const UPLOAD_FOLDERS = ["projects", "avatars", "certificates", "documents", "testimonials", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export function isAllowedType(type: string): type is AllowedUploadType {
  return Object.hasOwn(ALLOWED_UPLOAD_TYPES, type);
}

/** Checks magic bytes so a renamed file can't masquerade as an image/PDF. */
export function sniffMatches(type: AllowedUploadType, bytes: Uint8Array): boolean {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  const ascii = (offset: number, text: string) =>
    [...text].every((char, i) => bytes[offset + i] === char.charCodeAt(0));
  switch (type) {
    case "image/jpeg":
      return starts(0xff, 0xd8, 0xff);
    case "image/png":
      return starts(0x89, 0x50, 0x4e, 0x47);
    case "image/gif":
      return ascii(0, "GIF8");
    case "image/webp":
      return ascii(0, "RIFF") && ascii(8, "WEBP");
    case "image/avif":
      return ascii(4, "ftyp");
    case "application/pdf":
      return ascii(0, "%PDF");
  }
}

export async function storeFile(file: File, folder: UploadFolder): Promise<{ url: string }> {
  const type = file.type as AllowedUploadType;
  const name = `${folder}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ALLOWED_UPLOAD_TYPES[type]}`;
  const config = env();

  if (config.STORAGE_DRIVER === "vercel-blob") {
    const blob = await put(name, file, {
      access: "public",
      contentType: type,
      token: config.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  const destination = path.join(LOCAL_UPLOAD_ROOT, name);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}` };
}
