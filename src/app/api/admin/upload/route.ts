import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { CACHE_TAGS } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedType, sniffMatches, storeFile } from "@/lib/storage";
import { requireAdmin, UnauthorizedError } from "@/server/auth-guard";
import { toAdminMedia } from "@/server/queries/admin-media";

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin) && new URL(origin!).host === request.headers.get("host");
}

/**
 * Authenticated upload. Creates a Media record; PRIVATE uploads (e.g. an
 * un-redacted trust deed) are stored where the public can never reach them.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  let user;
  try {
    user = await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: error instanceof UnauthorizedError ? 401 : 500 });
  }

  const limit = await rateLimit(`upload:${user.id}`, { limit: 120, windowMs: 60 * 60 * 1000 });
  if (!limit.success) return NextResponse.json({ error: "Upload limit reached. Try again later." }, { status: 429 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const visibility = form?.get("visibility") === "PRIVATE" ? "PRIVATE" : "PUBLIC";
  const dim = (key: string) => {
    const value = Number(form?.get(key));
    return Number.isInteger(value) && value > 0 && value < 20000 ? value : null;
  };

  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "No file received" }, { status: 400 });
  const { UPLOAD_MAX_MB } = env();
  if (file.size > UPLOAD_MAX_MB * 1024 * 1024) {
    return NextResponse.json({ error: `File is larger than ${UPLOAD_MAX_MB} MB` }, { status: 413 });
  }
  if (!isAllowedType(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WebP, AVIF, GIF or PDF." }, { status: 415 });
  }
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!sniffMatches(file.type, head)) return NextResponse.json({ error: "File contents do not match its type" }, { status: 415 });

  try {
    const stored = await storeFile(file, visibility);
    const media = await db.media.create({
      data: {
        url: stored.url,
        storageKey: stored.storageKey,
        filename: file.name.slice(0, 200).replace(/[^\p{L}\p{N}._ -]/gu, "_"),
        mimeType: file.type,
        size: file.size,
        width: file.type.startsWith("image/") ? dim("width") : null,
        height: file.type.startsWith("image/") ? dim("height") : null,
        visibility,
        uploadedById: user.id,
      },
    });
    await db.activityLog.create({
      data: { userId: user.id, action: "UPLOAD", entity: "Media", entityId: media.id, summary: `Uploaded ${media.filename}${visibility === "PRIVATE" ? " (private)" : ""}` },
    });
    revalidateTag(CACHE_TAGS.media, { expire: 0 });
    return NextResponse.json(toAdminMedia(media), { status: 201 });
  } catch (error) {
    console.error("[upload] failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
