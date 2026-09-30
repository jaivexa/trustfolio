import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALE_TAGS, LOCALES } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/paths";
import { absoluteUrl } from "@/lib/utils";
import { getSitemapData } from "@/server/queries/public/search";

export const revalidate = 3600;

/** Every public page in both languages, with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData();
  const staticPaths = [
    "/",
    "/about",
    "/activities",
    "/projects",
    "/impact",
    "/trustees",
    "/documents",
    "/certificates",
    "/reports",
    "/gallery",
    "/news",
    "/stories",
    "/contact",
    "/verification",
    "/verification/registration",
    "/privacy",
    "/terms",
  ].map((path) => ({ path, updatedAt: undefined as Date | undefined }));

  const dynamic = [
    ...data.projects.map((r) => ({ path: `/projects/${r.slug}`, updatedAt: r.updatedAt })),
    ...data.activities.map((r) => ({ path: `/activities/${r.slug}`, updatedAt: r.updatedAt })),
    ...data.documents.map((r) => ({ path: `/documents/${r.slug}`, updatedAt: r.updatedAt })),
    ...data.reports.map((r) => ({ path: `/reports/${r.slug}`, updatedAt: r.updatedAt })),
    ...data.news.map((r) => ({ path: `/news/${r.slug}`, updatedAt: r.updatedAt })),
    ...data.trustees.map((r) => ({ path: `/trustees/${r.slug}`, updatedAt: r.updatedAt })),
    ...data.stories.map((r) => ({ path: `/stories/${r.slug}`, updatedAt: r.updatedAt })),
    ...data.albums.map((r) => ({ path: `/gallery/${r.slug}`, updatedAt: r.updatedAt })),
  ];

  return [...staticPaths, ...dynamic].flatMap(({ path, updatedAt }) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      lastModified: updatedAt,
      alternates: {
        languages: {
          ...Object.fromEntries(LOCALES.map((l) => [LOCALE_TAGS[l].lang, absoluteUrl(localePath(l, path))])),
          "x-default": absoluteUrl(localePath(DEFAULT_LOCALE, path)),
        },
      },
    })),
  );
}
