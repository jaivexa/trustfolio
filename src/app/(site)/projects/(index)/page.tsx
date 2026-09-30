import { Suspense } from "react";
import type { Metadata } from "next";
import { ProjectExplorer } from "@/components/sections/project-explorer";
import { ProjectGridSkeleton } from "@/components/sections/project-grid-skeleton";
import { Section, SectionHeading } from "@/components/site/section";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getPublishedProjects } from "@/server/queries/public";

export const metadata: Metadata = {
  title: "Projects & case studies",
  description: "Explore case studies across fintech, healthcare, SaaS and open source — with context, decisions and results.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <Section className="pt-12 sm:pt-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
        ])}
      />
      <SectionHeading
        as="h1"
        id="projects-title"
        eyebrow="Portfolio"
        title="Projects & case studies"
        description={`${projects.length} projects spanning product engineering, performance, design systems and platform work.`}
      />
      {/* useSearchParams in the explorer needs a Suspense boundary to keep this page static. */}
      <Suspense fallback={<ProjectGridSkeleton />}>
        <ProjectExplorer projects={projects} />
      </Suspense>
    </Section>
  );
}
