import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE, negotiateLocale } from "@/lib/i18n/config";

const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

/**
 * 1. Admin: optimistic redirect to the login page when no session cookie is
 *    present. This is UX only — every admin page, query and action verifies
 *    the session against the database on the server.
 * 2. Public: every page lives under /en or /ta. Unprefixed URLs are redirected
 *    using the saved preference, then Accept-Language, then English.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
    if (!hasSession) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved) ? saved : negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API routes, Next internals, generated metadata files, uploads and any file with an extension.
  matcher: ["/((?!api|_next|uploads|og|icon|apple-icon|sitemap.xml|robots.txt|.*\\..*).*)"],
};
