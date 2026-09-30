import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { DeleteRedirectButton } from "@/components/admin/delete-redirect-button";
import { TestimonialForm } from "@/components/admin/forms/testimonial-form";
import { deleteTestimonial, saveTestimonial } from "@/server/actions/admin/testimonials";
import { getTestimonialForEdit, listProjectOptions } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Edit testimonial" };

export default async function EditTestimonialPage({ params }: PageProps<"/admin/testimonials/[id]">) {
  const { id } = await params;
  const [testimonial, projects] = await Promise.all([getTestimonialForEdit(id), listProjectOptions()]);
  if (!testimonial) notFound();

  return (
    <>
      <PageHeader
        title={`Testimonial from ${testimonial.name}`}
        backHref="/admin/testimonials"
        backLabel="Testimonials"
        actions={
          <DeleteRedirectButton
            action={deleteTestimonial.bind(null, testimonial.id)}
            itemName={`the testimonial from ${testimonial.name}`}
            redirectTo="/admin/testimonials"
          />
        }
      />
      <TestimonialForm action={saveTestimonial.bind(null, testimonial.id)} testimonial={testimonial} projects={projects} />
    </>
  );
}
