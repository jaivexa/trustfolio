import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readPrivateFile } from "@/lib/storage";
import { requireAdmin } from "@/server/auth-guard";

/**
 * Serves a PRIVATE file (e.g. an un-redacted original) to signed-in admins
 * only. Never cached by shared caches, never indexable.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/admin/media/[id]/file">) {
  try {
    await requireAdmin();
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await params;
  const media = await db.media.findUnique({ where: { id } });
  if (!media) return new NextResponse("Not found", { status: 404 });
  if (media.visibility === "PUBLIC") return NextResponse.redirect(new URL(media.url, _request.url));

  const body = await readPrivateFile(media.storageKey);
  if (!body || (body instanceof Uint8Array && body.byteLength === 0)) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(body as BodyInit, {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(media.filename)}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
