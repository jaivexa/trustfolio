import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { ProjectCard } from "@/components/cards/cards";
import { FilterShell } from "@/components/filters/filter-shell";
import { categoryOptions, filterLabels, searchText } from "@/components/filters/filter-labels";
import { PageIntro, Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { getPageContext } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { getCategories, getProjects } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/projects", title: t.projects.title, description: t.projects.description });
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/projects">) {
  const { locale, t } = await getPageContext(params);
  const [projects, categories] = await Promise.all([getProjects(), getCategories("PROJECT")]);
  const used = categories.filter((c) => projects.some((p) => p.category?.slug === c.slug));

  return (
    <>
      <PageIntro
        eyebrow={t.home.workEyebrow}
        title={t.projects.title}
        description={t.projects.description}
        breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.projects.title }]}
      />
      <Section>
        {projects.length === 0 ? (
          <EmptyState icon={FolderOpen} title={t.empty.projects} />
        ) : (
          <FilterShell
            items={projects.map((p) => ({
              key: p.id,
              groups: [...(p.category ? [p.category.slug] : []), `phase-${p.phase}`],
              year: p.startDate ? new Date(p.startDate).getUTCFullYear() : null,
              text: searchText(p.title, p.summary, p.location, p.category?.name),
            }))}
            groups={categoryOptions(locale, used)}
            labels={filterLabels(t)}
          >
            {projects.map((project, i) => (
              <ProjectCard key={project.id} locale={locale} t={t} project={project} priority={i < 2} />
            ))}
          </FilterShell>
        )}
      </Section>
    </>
  );
}
