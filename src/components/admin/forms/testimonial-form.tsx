"use client";

import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { DateField, FieldGrid, SelectField, SwitchField, TextareaField, TextField } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-field";
import type { ActionState } from "@/lib/action-state";

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${"★".repeat(n)}${"☆".repeat(5 - n)}  (${n})` }));

export type TestimonialFormValues = {
  name: string;
  role: string | null;
  company: string | null;
  avatarUrl: string | null;
  content: string;
  rating: number;
  date: Date;
  projectId: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

export function TestimonialForm({
  action,
  testimonial,
  projects,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  testimonial?: TestimonialFormValues;
  projects: { id: string; title: string }[];
}) {
  const projectOptions = [{ value: "none", label: "No linked project" }, ...projects.map((p) => ({ value: p.id, label: p.title }))];

  return (
    <EntityForm
      action={action}
      cancelHref="/admin/testimonials"
      successHref={testimonial ? undefined : "/admin/testimonials"}
      submitLabel={testimonial ? "Save changes" : "Add testimonial"}
    >
      <FormSection title="Testimonial">
        <TextareaField name="content" label="Testimonial" required rows={5} maxLength={1500} defaultValue={testimonial?.content} />
        <FieldGrid>
          <SelectField name="rating" label="Rating" options={RATING_OPTIONS} defaultValue={String(testimonial?.rating ?? 5)} />
          <DateField name="date" label="Date" required defaultValue={testimonial?.date ?? new Date()} />
        </FieldGrid>
        <SelectField
          name="projectId"
          label="Related project"
          options={projectOptions}
          defaultValue={testimonial?.projectId ?? "none"}
          description="Linked testimonials also appear on the project's case study."
        />
      </FormSection>
      <FormSection title="Author">
        <FieldGrid cols={3}>
          <TextField name="name" label="Name" required defaultValue={testimonial?.name} />
          <TextField name="role" label="Role" defaultValue={testimonial?.role} />
          <TextField name="company" label="Company" defaultValue={testimonial?.company} />
        </FieldGrid>
        <MediaField name="avatarUrl" label="Avatar" folder="testimonials" defaultValue={testimonial?.avatarUrl} />
      </FormSection>
      <FormSection title="Visibility">
        <FieldGrid cols={3}>
          <SwitchField name="isPublished" label="Published" defaultChecked={testimonial?.isPublished ?? false} />
          <SwitchField name="isFeatured" label="Featured" description="Shown first in the carousel." defaultChecked={testimonial?.isFeatured ?? false} />
          <TextField name="sortOrder" label="Sort order" type="number" min={0} defaultValue={testimonial?.sortOrder ?? 0} />
        </FieldGrid>
      </FormSection>
    </EntityForm>
  );
}
