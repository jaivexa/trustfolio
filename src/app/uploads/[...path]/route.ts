import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { ALLOWED_UPLOAD_TYPES, LOCAL_UPLOAD_ROOT } from "@/lib/storage";

const TYPES_BY_EXTENSION = Object.fromEntries(
  Object.entries(ALLOWED_UPLOAD_TYPES).map(([type, ext]) => [ext, type]),
) as Record<string, string>;

/** Serves files written by the `local` storage driver. Path traversal is rejected. */
export async function GET(_request: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const segments = (await params).path;
  const resolved = path.resolve(LOCAL_UPLOAD_ROOT, ...segments);
  if (!resolved.startsWith(LOCAL_UPLOAD_ROOT + path.sep)) return new Response("Not found", { status: 404 });

  const type = TYPES_BY_EXTENSION[path.extname(resolved).slice(1).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const info = await stat(resolved);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const body = await readFile(resolved);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        // File names are random UUIDs, so they can be cached forever.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        ...(type === "application/pdf" ? { "Content-Disposition": "inline" } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
