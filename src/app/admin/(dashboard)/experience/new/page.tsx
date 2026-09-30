import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { ExperienceForm } from "@/components/admin/forms/experience-form";
import { saveExperience } from "@/server/actions/admin/experience";
import { listTechnologyNames } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Add experience" };

export default async function NewExperiencePage() {
  const technologies = await listTechnologyNames();
  return (
    <>
      <PageHeader title="Add experience" backHref="/admin/experience" backLabel="Experience" />
      <ExperienceForm action={saveExperience.bind(null, null)} technologies={technologies} />
    </>
  );
}
