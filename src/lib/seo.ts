import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/utils";
import type { ProfileDTO, ProjectDetailDTO, SiteSettingsDTO } from "@/server/queries/types";

/** Base metadata shared by every public page. */
export function buildRootMetadata(settings: SiteSettingsDTO, profile: ProfileDTO | null): Metadata {
  const ogImage = absoluteUrl(settings.ogImageUrl ?? "/og");
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: settings.seoTitle, template: `%s · ${settings.siteName}` },
    description: settings.seoDescription,
    applicationName: settings.siteName,
    keywords: settings.seoKeywords,
    authors: profile ? [{ name: profile.fullName, url: getSiteUrl() }] : undefined,
    creator: profile?.fullName,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title: settings.seoTitle,
      description: settings.seoDescription,
      url: "/",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: settings.seoTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle,
      description: settings.seoDescription,
      ...(settings.twitterHandle ? { creator: settings.twitterHandle, site: settings.twitterHandle } : {}),
      images: [ogImage],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    formatDetection: { telephone: false },
  };
}

export function buildProjectMetadata(project: ProjectDetailDTO, settings: SiteSettingsDTO): Metadata {
  const title = project.seoTitle ?? project.title;
  const description = project.seoDescription ?? project.summary;
  const url = `/projects/${project.slug}`;
  return {
    title,
    description,
    keywords: [project.category, ...project.technologies],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: settings.siteName,
      modifiedTime: project.updatedAt,
      ...(project.publishedAt ? { publishedTime: project.publishedAt } : {}),
      tags: project.technologies,
      // Images come from the route's generated `opengraph-image`.
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

type JsonLd = Record<string, unknown>;

export function personJsonLd(profile: ProfileDTO): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: profile.heroEyebrow ?? profile.headline,
    description: profile.shortBio,
    url: getSiteUrl(),
    email: `mailto:${profile.email}`,
    ...(profile.avatarUrl ? { image: absoluteUrl(profile.avatarUrl) } : {}),
    ...(profile.location ? { address: { "@type": "PostalAddress", addressLocality: profile.location } } : {}),
    sameAs: profile.socialLinks.filter((l) => l.url.startsWith("https://")).map((l) => l.url),
  };
}

export function websiteJsonLd(settings: SiteSettingsDTO): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    description: settings.siteDescription,
    url: getSiteUrl(),
  };
}

export function projectJsonLd(project: ProjectDetailDTO, profile: ProfileDTO | null): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.slug}`),
    genre: project.category,
    keywords: project.technologies.join(", "),
    dateModified: project.updatedAt,
    ...(project.completedAt ? { dateCreated: project.completedAt } : {}),
    ...(project.thumbnailUrl ? { image: absoluteUrl(project.thumbnailUrl) } : {}),
    ...(profile ? { creator: { "@type": "Person", name: profile.fullName, url: getSiteUrl() } } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
