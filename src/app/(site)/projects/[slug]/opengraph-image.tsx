import { OG_SIZE, renderOgImage, truncate } from "@/lib/og";
import { getProfile, getProjectBySlug } from "@/server/queries/public";

export const alt = "Case study preview";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function ProjectOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, profile] = await Promise.all([getProjectBySlug(slug), getProfile()]);
  return renderOgImage({
    eyebrow: project ? `Case study · ${project.category}` : "Case study",
    title: truncate(project?.title ?? "Project", 80),
    subtitle: project ? truncate(project.summary, 150) : undefined,
    footer: profile?.fullName ?? "Portfolio",
  });
}
