"use client";

import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { DateField, FieldGrid, ListField, SelectField, SwitchField, TextareaField, TextField } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-field";
import { TagsField } from "@/components/admin/tags-field";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";
import type { ActionState } from "@/lib/action-state";

const EMPLOYMENT_OPTIONS = Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export type ExperienceFormValues = {
  company: string;
  companyUrl: string | null;
  logoUrl: string | null;
  position: string;
  location: string | null;
  employmentType: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  achievements: string[];
  technologies: string[];
  isPublished: boolean;
  sortOrder: number;
};

export function ExperienceForm({
  action,
  experience,
  technologies,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  experience?: ExperienceFormValues;
  technologies: string[];
}) {
  return (
    <EntityForm
      action={action}
      cancelHref="/admin/experience"
      successHref={experience ? undefined : "/admin/experience"}
      submitLabel={experience ? "Save changes" : "Add experience"}
    >
      <FormSection title="Role">
        <FieldGrid>
          <TextField name="position" label="Position" required defaultValue={experience?.position} />
          <SelectField name="employmentType" label="Employment type" options={EMPLOYMENT_OPTIONS} defaultValue={experience?.employmentType ?? "FULL_TIME"} />
        </FieldGrid>
        <FieldGrid>
          <DateField name="startDate" label="Start date" required defaultValue={experience?.startDate} />
          <DateField name="endDate" label="End date" defaultValue={experience?.endDate} description="Leave empty for your current role." />
        </FieldGrid>
        <TextareaField name="description" label="Description" required rows={4} maxLength={4000} defaultValue={experience?.description} />
        <ListField name="achievements" label="Key achievements" rows={5} defaultValue={experience?.achievements} description="One achievement per line. Lead with impact and numbers." />
        <TagsField name="technologies" label="Technologies" defaultValue={experience?.technologies} suggestions={technologies} />
      </FormSection>
      <FormSection title="Company">
        <FieldGrid>
          <TextField name="company" label="Company" required defaultValue={experience?.company} />
          <TextField name="location" label="Location" defaultValue={experience?.location} placeholder="Remote" />
        </FieldGrid>
        <TextField name="companyUrl" label="Company website" type="url" defaultValue={experience?.companyUrl} placeholder="https://" />
        <MediaField name="logoUrl" label="Company logo" folder="misc" defaultValue={experience?.logoUrl} />
      </FormSection>
      <FormSection title="Visibility">
        <FieldGrid>
          <SwitchField name="isPublished" label="Visible on site" defaultChecked={experience?.isPublished ?? true} />
          <TextField name="sortOrder" label="Sort order" type="number" min={0} defaultValue={experience?.sortOrder ?? 0} description="Lower first; ties sort by start date." />
        </FieldGrid>
      </FormSection>
    </EntityForm>
  );
}
