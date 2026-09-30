import { isLocale, type Locale } from "./config";

/** Public, localizable route keys → path (without locale prefix). */
export const ROUTES = {
  home: "/",
  about: "/about",
  activities: "/activities",
  projects: "/projects",
  impact: "/impact",
  trustees: "/trustees",
  documents: "/documents",
  certificates: "/certificates",
  reports: "/reports",
  gallery: "/gallery",
  news: "/news",
  stories: "/stories",
  contact: "/contact",
  verification: "/verification",
  search: "/search",
  privacy: "/privacy",
  terms: "/terms",
} as const;

export type RouteKey = keyof typeof ROUTES;

/** `/en/projects/foo` style links. `path` may already include a hash or query. */
export function localePath(locale: Locale, path: string = "/"): string {
  if (/^(https?:|mailto:|tel:)/.test(path)) return path;
  if (path.startsWith("#")) return path;
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/**
 * The same page in another language. Slugs are shared across locales, so
 * `/en/projects/community-development` → `/ta/projects/community-development`.
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  }
  return localePath(target, pathname);
}

/** Strips the locale prefix: `/ta/projects` → `/projects`. */
export function stripLocale(pathname: string): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) return `/${segments.slice(2).join("/")}`;
  return pathname;
}
