"use client";

import { useState } from "react";
import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { FieldGrid, ListField, SelectField, SwitchField, TextareaField, TextField } from "@/components/admin/fields";
import { SERVICE_ICON_NAMES } from "@/lib/constants";
import type { ActionState } from "@/lib/action-state";
import { slugify } from "@/lib/utils";

const ICON_OPTIONS = SERVICE_ICON_NAMES.map((name) => ({
  value: name,
  label: name.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
}));

export type ServiceFormValues = {
  title: string;
  slug: string;
  description: string;
  icon: string;
  features: string[];
  pricing: string | null;
  ctaLabel: string;
  ctaHref: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
};

export function ServiceForm({
  action,
  service,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  service?: ServiceFormValues;
}) {
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [touched, setTouched] = useState(Boolean(service));

  return (
    <EntityForm
      action={action}
      cancelHref="/admin/services"
      successHref={service ? undefined : "/admin/services"}
      submitLabel={service ? "Save changes" : "Create service"}
    >
      <FormSection title="Service">
        <FieldGrid>
          <TextField
            name="title"
            label="Name"
            required
            defaultValue={service?.title}
            maxLength={80}
            onChange={(e) => !touched && setSlug(slugify(e.target.value))}
          />
          <TextField
            name="slug"
            label="Slug"
            required
            value={slug}
            onChange={(e) => {
              setTouched(true);
              setSlug(e.target.value);
            }}
          />
        </FieldGrid>
        <TextareaField name="description" label="Description" required rows={3} maxLength={600} defaultValue={service?.description} />
        <ListField name="features" label="Features" rows={4} defaultValue={service?.features} description="One feature per line (up to 10)." />
        <FieldGrid>
          <SelectField name="icon" label="Icon" options={ICON_OPTIONS} defaultValue={service?.icon ?? "sparkles"} />
          <TextField name="pricing" label="Pricing" defaultValue={service?.pricing} placeholder="From €4,500" description="Optional. Leave empty for “Custom quote”." />
        </FieldGrid>
      </FormSection>
      <FormSection title="Call to action">
        <FieldGrid>
          <TextField name="ctaLabel" label="Button label" required defaultValue={service?.ctaLabel ?? "Start a project"} />
          <TextField name="ctaHref" label="Button link" required defaultValue={service?.ctaHref ?? "#contact"} description="#anchor, /path, mailto: or https://" />
        </FieldGrid>
      </FormSection>
      <FormSection title="Visibility">
        <FieldGrid cols={3}>
          <SwitchField name="isPublished" label="Published" defaultChecked={service?.isPublished ?? true} />
          <SwitchField name="isFeatured" label="Highlight" defaultChecked={service?.isFeatured ?? false} />
          <TextField name="sortOrder" label="Sort order" type="number" min={0} defaultValue={service?.sortOrder ?? 0} />
        </FieldGrid>
      </FormSection>
    </EntityForm>
  );
}
