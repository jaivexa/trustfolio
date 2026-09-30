import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedType, sniffMatches, storeFile, UPLOAD_FOLDERS, type UploadFolder } from "@/lib/storage";
import { requireAdmin, UnauthorizedError } from "@/server/auth-guard";

/** Authenticated file upload for the admin dashboard. */
export async function POST(request: NextRequest) {
  // CSRF defence in depth (session cookies are also SameSite=Lax).
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  let user;
  try {
    user = await requireAdmin();
  } catch (error) {
    const status = error instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }

  const limit = await rateLimit(`upload:${user.id}`, { limit: 60, windowMs: 60 * 60 * 1000 });
  if (!limit.success) return NextResponse.json({ error: "Upload limit reached. Try again later." }, { status: 429 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const folderInput = String(form?.get("folder") ?? "misc");
  const folder: UploadFolder = (UPLOAD_FOLDERS as readonly string[]).includes(folderInput)
    ? (folderInput as UploadFolder)
    : "misc";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }
  const maxBytes = env().UPLOAD_MAX_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File is larger than ${env().UPLOAD_MAX_MB} MB` }, { status: 413 });
  }
  if (!isAllowedType(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WebP, AVIF, GIF or PDF." }, { status: 415 });
  }
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!sniffMatches(file.type, head)) {
    return NextResponse.json({ error: "File contents do not match its type" }, { status: 415 });
  }

  try {
    const { url } = await storeFile(file, folder);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("[upload] failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
