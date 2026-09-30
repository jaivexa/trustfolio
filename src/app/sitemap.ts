import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";
import { getProfile, getProjectSitemapEntries } from "@/server/queries/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, profile] = await Promise.all([getProjectSitemapEntries(), getProfile()]);
  const latestProject = projects.map((p) => p.updatedAt).sort().at(-1);

  return [
    { url: absoluteUrl("/"), lastModified: profile?.updatedAt, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/projects"), lastModified: latestProject, changeFrequency: "weekly", priority: 0.9 },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
