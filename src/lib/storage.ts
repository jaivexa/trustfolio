import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";
import { env } from "@/lib/env";

/**
 * Pluggable file storage with public and private visibility.
 *  - `local`:  PUBLIC  → ./uploads (served by /uploads/[...path])
 *              PRIVATE → ./private-uploads (never served publicly; admin route only)
 *  - `vercel-blob`: public or private blobs (private ones are fetched server-side).
 * Private media holds un-redacted originals and must never be linked publicly.
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
export type StorageVisibility = "PUBLIC" | "PRIVATE";

export const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), "uploads");
export const LOCAL_PRIVATE_ROOT = path.join(process.cwd(), "private-uploads");

export function isAllowedType(type: string): type is AllowedUploadType {
  return Object.hasOwn(ALLOWED_UPLOAD_TYPES, type);
}

/** Checks magic bytes so a renamed file can't masquerade as an image/PDF. */
export function sniffMatches(type: AllowedUploadType, bytes: Uint8Array): boolean {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  const ascii = (offset: number, text: string) => [...text].every((char, i) => bytes[offset + i] === char.charCodeAt(0));
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

export async function storeFile(file: File, visibility: StorageVisibility): Promise<{ url: string; storageKey: string }> {
  const type = file.type as AllowedUploadType;
  const folder = visibility === "PRIVATE" ? "private" : "public";
  const storageKey = `${folder}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ALLOWED_UPLOAD_TYPES[type]}`;
  const config = env();

  if (config.STORAGE_DRIVER === "vercel-blob") {
    const blob = await put(storageKey, file, {
      access: visibility === "PRIVATE" ? "private" : "public",
      contentType: type,
      token: config.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    // Private blob URLs are unusable without the token; keep them internal.
    return { url: visibility === "PRIVATE" ? `private:${blob.pathname}` : blob.url, storageKey: blob.pathname };
  }

  const root = visibility === "PRIVATE" ? LOCAL_PRIVATE_ROOT : LOCAL_UPLOAD_ROOT;
  const relative = storageKey.split("/").slice(1).join("/");
  const destination = path.join(root, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await file.arrayBuffer()));
  return { url: visibility === "PRIVATE" ? `private:${storageKey}` : `/uploads/${relative}`, storageKey };
}

/** Reads a PRIVATE file for an authorized admin request. */
export async function readPrivateFile(storageKey: string): Promise<ReadableStream<Uint8Array> | Uint8Array | null> {
  const config = env();
  if (config.STORAGE_DRIVER === "vercel-blob") {
    const result = await get(storageKey, { access: "private", token: config.BLOB_READ_WRITE_TOKEN }).catch(() => null);
    return result?.stream ?? null;
  }
  const relative = storageKey.split("/").slice(1).join("/");
  const resolved = path.resolve(LOCAL_PRIVATE_ROOT, relative);
  if (!resolved.startsWith(LOCAL_PRIVATE_ROOT + path.sep)) return null;
  return new Uint8Array(await readFile(resolved).catch(() => Buffer.alloc(0)));
}

/** Best-effort removal of the stored file (the DB row is the source of truth). */
export async function deleteStoredFile(media: { storageKey: string; url: string; visibility: StorageVisibility }) {
  if (media.storageKey.startsWith("demo/")) return; // bundled demo assets live in /public
  const config = env();
  try {
    if (config.STORAGE_DRIVER === "vercel-blob") {
      await del(media.visibility === "PUBLIC" ? media.url : media.storageKey, { token: config.BLOB_READ_WRITE_TOKEN });
      return;
    }
    const root = media.visibility === "PRIVATE" ? LOCAL_PRIVATE_ROOT : LOCAL_UPLOAD_ROOT;
    const resolved = path.resolve(root, media.storageKey.split("/").slice(1).join("/"));
    if (resolved.startsWith(root + path.sep)) await rm(resolved, { force: true });
  } catch (error) {
    console.error("[storage] delete failed", error);
  }
}
