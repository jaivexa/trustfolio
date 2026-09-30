import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { TestimonialForm } from "@/components/admin/forms/testimonial-form";
import { saveTestimonial } from "@/server/actions/admin/testimonials";
import { listProjectOptions } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Add testimonial" };

export default async function NewTestimonialPage() {
  const projects = await listProjectOptions();
  return (
    <>
      <PageHeader title="Add testimonial" backHref="/admin/testimonials" backLabel="Testimonials" />
      <TestimonialForm action={saveTestimonial.bind(null, null)} projects={projects} />
    </>
  );
}
