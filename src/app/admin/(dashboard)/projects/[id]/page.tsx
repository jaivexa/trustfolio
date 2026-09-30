import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { DeleteRedirectButton } from "@/components/admin/delete-redirect-button";
import { ProjectForm } from "@/components/admin/forms/project-form";
import { deleteProject, saveProject } from "@/server/actions/admin/projects";
import { getProjectForEdit, listProjectCategories, listTechnologyNames } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const [project, technologies, categories] = await Promise.all([
    getProjectForEdit(id),
    listTechnologyNames(),
    listProjectCategories(),
  ]);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        title={project.title}
        description={project.isPublished ? "Published" : "Draft — not visible on the public site"}
        backHref="/admin/projects"
        backLabel="Projects"
        actions={
          <>
            {project.isPublished && (
              <Button asChild variant="outline">
                <Link href={`/projects/${project.slug}`} target="_blank">
                  View live <ExternalLink aria-hidden="true" />
                </Link>
              </Button>
            )}
            <DeleteRedirectButton action={deleteProject.bind(null, project.id)} itemName={`“${project.title}”`} redirectTo="/admin/projects" />
          </>
        }
      />
      <ProjectForm
        action={saveProject.bind(null, project.id)}
        technologies={technologies}
        categories={categories}
        project={{
          ...project,
          technologies: project.technologies.map((t) => t.name),
          images: project.images.map((image) => ({ url: image.url, alt: image.alt, caption: image.caption })),
        }}
      />
    </>
  );
}
