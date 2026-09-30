import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/sections/project-card";
import { Section, SectionHeading } from "@/components/site/section";
import type { ProjectCardDTO } from "@/server/queries/types";

export function FeaturedProjectsSection({ projects, total }: { projects: ProjectCardDTO[]; total: number }) {
  return (
    <Section id="projects" labelledBy="projects-title">
      <SectionHeading
        id="projects-title"
        eyebrow="Selected work"
        title="Case studies with measurable outcomes"
        description="A few engagements I'm proud of — each with the context, decisions and results behind it."
        action={
          total > projects.length ? (
            <Button asChild variant="outline">
              <Link href="/projects">
                All {total} projects <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ) : undefined
        }
      />
      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="Projects are on their way" description="Case studies will appear here soon." />
      ) : (
        <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <StaggerItem as="li" key={project.id}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </Section>
  );
}
