import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { DeleteRedirectButton } from "@/components/admin/delete-redirect-button";
import { ExperienceForm } from "@/components/admin/forms/experience-form";
import { deleteExperience, saveExperience } from "@/server/actions/admin/experience";
import { getExperienceForEdit, listTechnologyNames } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Edit experience" };

export default async function EditExperiencePage({ params }: PageProps<"/admin/experience/[id]">) {
  const { id } = await params;
  const [experience, technologies] = await Promise.all([getExperienceForEdit(id), listTechnologyNames()]);
  if (!experience) notFound();

  return (
    <>
      <PageHeader
        title={`${experience.position} · ${experience.company}`}
        backHref="/admin/experience"
        backLabel="Experience"
        actions={
          <DeleteRedirectButton
            action={deleteExperience.bind(null, experience.id)}
            itemName={`${experience.position} at ${experience.company}`}
            redirectTo="/admin/experience"
          />
        }
      />
      <ExperienceForm
        action={saveExperience.bind(null, experience.id)}
        technologies={technologies}
        experience={{ ...experience, technologies: experience.technologies.map((t) => t.name) }}
      />
    </>
  );
}
