import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "@/components/admin/forms/project-form";
import { saveProject } from "@/server/actions/admin/projects";
import { listProjectCategories, listTechnologyNames } from "@/server/queries/admin";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const [technologies, categories] = await Promise.all([listTechnologyNames(), listProjectCategories()]);
  return (
    <>
      <PageHeader title="New project" description="Draft a new case study. It stays private until you publish it." backHref="/admin/projects" backLabel="Projects" />
      <ProjectForm action={saveProject.bind(null, null)} technologies={technologies} categories={categories} />
    </>
  );
}
