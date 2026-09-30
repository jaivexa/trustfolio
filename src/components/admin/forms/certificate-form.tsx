"use client";

import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { DateField, FieldGrid, SwitchField, TextareaField, TextField } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/media-field";
import type { ActionState } from "@/lib/action-state";

export type CertificateFormValues = {
  name: string;
  issuer: string;
  issuedAt: Date;
  expiresAt: Date | null;
  credentialId: string | null;
  verificationUrl: string | null;
  imageUrl: string | null;
  fileUrl: string | null;
  description: string | null;
  isPublished: boolean;
  sortOrder: number;
};

export function CertificateForm({
  action,
  certificate,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  certificate?: CertificateFormValues;
}) {
  return (
    <EntityForm
      action={action}
      cancelHref="/admin/certificates"
      successHref={certificate ? undefined : "/admin/certificates"}
      submitLabel={certificate ? "Save changes" : "Add certificate"}
    >
      <FormSection title="Credential">
        <FieldGrid>
          <TextField name="name" label="Certification name" required defaultValue={certificate?.name} />
          <TextField name="issuer" label="Issuer" required defaultValue={certificate?.issuer} />
        </FieldGrid>
        <FieldGrid>
          <DateField name="issuedAt" label="Issue date" required defaultValue={certificate?.issuedAt} />
          <DateField name="expiresAt" label="Expiry date" defaultValue={certificate?.expiresAt} description="Leave empty if it doesn't expire." />
        </FieldGrid>
        <FieldGrid>
          <TextField name="credentialId" label="Credential ID" defaultValue={certificate?.credentialId} />
          <TextField name="verificationUrl" label="Verification URL" type="url" defaultValue={certificate?.verificationUrl} placeholder="https://" />
        </FieldGrid>
        <TextareaField name="description" label="Description" rows={3} maxLength={600} defaultValue={certificate?.description} />
      </FormSection>
      <FormSection title="Files">
        <MediaField name="imageUrl" label="Certificate image" folder="certificates" defaultValue={certificate?.imageUrl} />
        <MediaField
          name="fileUrl"
          label="Certificate PDF"
          folder="documents"
          kind="document"
          accept="application/pdf"
          defaultValue={certificate?.fileUrl}
        />
      </FormSection>
      <FormSection title="Visibility">
        <FieldGrid>
          <SwitchField name="isPublished" label="Published" defaultChecked={certificate?.isPublished ?? true} />
          <TextField name="sortOrder" label="Sort order" type="number" min={0} defaultValue={certificate?.sortOrder ?? 0} />
        </FieldGrid>
      </FormSection>
    </EntityForm>
  );
}
