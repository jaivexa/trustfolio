import { BilingualField } from "@/components/admin/bilingual";
import { FormSection } from "@/components/admin/entity-form";
import { DateField, FieldGrid, RelationSelect, SelectField, SlugField, StatusField, SwitchField, TextField } from "@/components/admin/fields";
import { MediaPicker } from "@/components/admin/pickers";
import { saveCertificate, saveDocument, saveReport, saveVerificationRecord } from "@/server/actions/admin/evidence";
import {
  pickedMedia,
  type AdminOptions,
  type getCertificateForEdit,
  type getDocumentForEdit,
  type getReportForEdit,
  type getVerificationForEdit,
} from "@/server/queries/admin";
import { BilingualSection, EditorFrame } from "./editor-frame";

type Loaded<F extends (...args: never[]) => Promise<unknown>> = NonNullable<Awaited<ReturnType<F>>>;

const LANGUAGES = [
  { value: "EN", label: "English" },
  { value: "TA", label: "Tamil" },
  { value: "BILINGUAL", label: "English & Tamil" },
  { value: "OTHER", label: "Other" },
];

const VISIBILITY = [
  { value: "PUBLIC", label: "Public — listed in the document vault" },
  { value: "PRIVATE", label: "Private — administrators only" },
];

export function DocumentForm({ id, record, options }: { id: string | null; record: Loaded<typeof getDocumentForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="documents"
      id={id}
      name={record?.titleEn}
      status={record?.status}
      isDemo={record?.isDemo}
      publicHref={record && record.visibility === "PUBLIC" ? `/documents/${record.slug}` : null}
      action={saveDocument.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} />
            <SelectField name="visibility" label="Visibility" options={VISIBILITY} defaultValue={record?.visibility ?? "PUBLIC"} />
            <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={record?.sortOrder ?? 0} />
          </FormSection>
          <FormSection title="Personal information" description="Documents with Aadhaar, ID numbers, signatures, private phone numbers or home addresses must only be published as a redacted copy.">
            <SwitchField
              name="containsPersonalData"
              label="Original contains personal data"
              description="Then the public file must be a redacted copy."
              defaultChecked={record?.containsPersonalData ?? false}
            />
            <SwitchField name="isRedacted" label="Public file is redacted" description="Personal details are blacked out in the public file." defaultChecked={record?.isRedacted ?? false} />
          </FormSection>
        </>
      }
    >
      <FormSection title="Files" description="The public website only ever serves the public file. The original is stored privately and is visible to signed-in administrators only.">
        <MediaPicker
          name="fileId"
          label="Public file (redacted where needed)"
          kind="document"
          visibility="PUBLIC"
          description="PDF or image. Required to publish a public document."
          initial={pickedMedia(record?.file)}
        />
        <MediaPicker
          name="originalFileId"
          label="Original document"
          kind="document"
          visibility="PRIVATE"
          description="Optional. Never shown on the website."
          initial={pickedMedia(record?.originalFile)}
        />
        <MediaPicker name="thumbnailId" label="Thumbnail" kind="image" description="Optional preview image (must not show personal details)." initial={pickedMedia(record?.thumbnail)} />
      </FormSection>
      <BilingualSection title="Description" description="Official document titles should match the document. Leave Tamil empty rather than guess an official translation.">
        <BilingualField name="title" label="Title" required maxLength={250} defaultEn={record?.titleEn} defaultTa={record?.titleTa} />
        <BilingualField name="description" label="Description" kind="textarea" maxLength={4000} defaultEn={record?.descriptionEn} defaultTa={record?.descriptionTa} />
        <BilingualField name="source" label="Issued by / source" maxLength={250} placeholder="e.g. Sub-Registrar Office" defaultEn={record?.sourceEn} defaultTa={record?.sourceTa} />
      </BilingualSection>
      <FormSection title="Details">
        <SlugField defaultValue={record?.slug} prefix="/documents" />
        <FieldGrid cols={3}>
          <RelationSelect name="categoryId" label="Category" options={options.categories.DOCUMENT} defaultValue={record?.categoryId} />
          <SelectField name="language" label="Language" options={LANGUAGES} defaultValue={record?.language ?? "EN"} />
          <TextField name="version" label="Version" maxLength={40} defaultValue={record?.version} />
          <TextField name="year" label="Year" type="number" min={1900} max={2200} defaultValue={record?.year} />
          <DateField name="documentDate" label="Document date" defaultValue={record?.documentDate} />
        </FieldGrid>
      </FormSection>
    </EditorFrame>
  );
}

export function ReportForm({ id, record, options }: { id: string | null; record: Loaded<typeof getReportForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="reports"
      id={id}
      name={record ? `${record.periodLabel} — ${record.titleEn}` : undefined}
      status={record?.status}
      isDemo={record?.isDemo}
      publicHref={record ? `/reports/${record.slug}` : null}
      action={saveReport.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} />
            <TextField name="periodLabel" label="Period" required placeholder="e.g. 2023–24" defaultValue={record?.periodLabel} />
            <TextField name="startYear" label="Start year" type="number" required min={1900} max={2200} defaultValue={record?.startYear ?? new Date().getFullYear() - 1} />
          </FormSection>
          <FormSection title="Cover image">
            <MediaPicker name="coverId" label="Cover" initial={pickedMedia(record?.cover)} />
          </FormSection>
        </>
      }
    >
      <FormSection title="Report files" description="Upload the PDFs in the Documents section first, then choose them here.">
        <FieldGrid>
          <RelationSelect name="documentEnId" label="English report (document)" options={options.documents} defaultValue={record?.documentEnId} />
          <RelationSelect name="documentTaId" label="Tamil report (document)" options={options.documents} defaultValue={record?.documentTaId} />
        </FieldGrid>
      </FormSection>
      <BilingualSection title="Report">
        <BilingualField name="title" label="Title" required maxLength={200} defaultEn={record?.titleEn} defaultTa={record?.titleTa} />
        <BilingualField name="summary" label="Summary" kind="markdown" rows={4} maxLength={4000} defaultEn={record?.summaryEn} defaultTa={record?.summaryTa} />
        <BilingualField name="highlights" label="Highlights" kind="markdown" rows={5} maxLength={8000} defaultEn={record?.highlightsEn} defaultTa={record?.highlightsTa} />
        <BilingualField name="impact" label="Impact" kind="markdown" rows={5} maxLength={8000} defaultEn={record?.impactEn} defaultTa={record?.impactTa} />
        <BilingualField
          name="financial"
          label="Financial summary"
          kind="markdown"
          rows={5}
          maxLength={8000}
          description="Only figures from the audited statements, with the auditor named."
          defaultEn={record?.financialEn}
          defaultTa={record?.financialTa}
        />
      </BilingualSection>
      <FormSection title="Link">
        <SlugField defaultValue={record?.slug} prefix="/reports" />
      </FormSection>
    </EditorFrame>
  );
}

const CERTIFICATE_KINDS = [
  { value: "CERTIFICATE", label: "Certificate" },
  { value: "AWARD", label: "Award" },
  { value: "RECOGNITION", label: "Recognition" },
];

export function CertificateForm({ id, record, options }: { id: string | null; record: Loaded<typeof getCertificateForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="certificates"
      id={id}
      name={record?.titleEn}
      status={record?.status}
      isDemo={record?.isDemo}
      publicHref={record ? "/certificates" : null}
      action={saveCertificate.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} />
            <SelectField name="kind" label="Type" options={CERTIFICATE_KINDS} defaultValue={record?.kind ?? "CERTIFICATE"} />
            <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={record?.sortOrder ?? 0} />
          </FormSection>
          <FormSection title="Image">
            <MediaPicker name="imageId" label="Certificate image" description="Redact personal details before uploading." initial={pickedMedia(record?.image)} />
          </FormSection>
        </>
      }
    >
      <BilingualSection title="Certificate">
        <BilingualField name="title" label="Title" required maxLength={200} defaultEn={record?.titleEn} defaultTa={record?.titleTa} />
        <BilingualField name="issuer" label="Issued by" required maxLength={200} defaultEn={record?.issuerEn} defaultTa={record?.issuerTa} />
        <BilingualField name="description" label="Description" kind="textarea" maxLength={2000} defaultEn={record?.descriptionEn} defaultTa={record?.descriptionTa} />
      </BilingualSection>
      <FormSection title="Verification" description="A visitor can check the certificate with the issuer through this link.">
        <FieldGrid>
          <DateField name="issuedAt" label="Issued" defaultValue={record?.issuedAt} />
          <DateField name="expiresAt" label="Expires" defaultValue={record?.expiresAt} />
          <TextField name="credentialId" label="Certificate / reference number" defaultValue={record?.credentialId} />
          <TextField name="verificationUrl" label="Issuer verification link" type="url" defaultValue={record?.verificationUrl} />
        </FieldGrid>
        <RelationSelect name="documentId" label="Document (PDF)" options={options.documents} defaultValue={record?.documentId} />
      </FormSection>
    </EditorFrame>
  );
}

const AREAS = [
  { value: "IDENTITY", label: "Identity" },
  { value: "REGISTRATION", label: "Registration & legal" },
  { value: "LEADERSHIP", label: "Leadership" },
  { value: "PROJECTS", label: "Projects" },
  { value: "ACTIVITIES", label: "Activities" },
  { value: "FINANCIAL", label: "Financial" },
  { value: "CERTIFICATES", label: "Certificates" },
  { value: "OTHER", label: "Other" },
];

const METHODS = [
  { value: "OFFICIAL_DOCUMENT", label: "Official document" },
  { value: "PUBLIC_REGISTRY", label: "Public registry (link required)" },
  { value: "ISSUER_WEBSITE", label: "Issuer website (link required)" },
  { value: "OTHER", label: "Other" },
];

export function VerificationForm({ id, record, options }: { id: string | null; record: Loaded<typeof getVerificationForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="verification"
      id={id}
      name={record?.titleEn}
      status={record?.status}
      isDemo={record?.isDemo}
      publicHref={record ? "/verification" : null}
      action={saveVerificationRecord.bind(null, id)}
      aside={
        <FormSection title="Publishing">
          <StatusField defaultValue={record?.status} description="A published record must point to a document or an external source." />
          <SelectField name="area" label="Evidence area" options={AREAS} defaultValue={record?.area ?? "REGISTRATION"} />
          <SelectField name="method" label="How it can be verified" options={METHODS} defaultValue={record?.method ?? "OFFICIAL_DOCUMENT"} />
          <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={record?.sortOrder ?? 0} />
        </FormSection>
      }
    >
      <p role="note" className="rounded-xl border bg-muted/40 p-3 text-sm">
        A verification record tells visitors <strong>what</strong> can be checked and <strong>where</strong>. It never says “verified” on its own — it shows the source.
      </p>
      <BilingualSection title="Record">
        <BilingualField name="title" label="Title" required maxLength={200} placeholder="e.g. Trust registration" defaultEn={record?.titleEn} defaultTa={record?.titleTa} />
        <BilingualField name="description" label="Description" kind="textarea" maxLength={2000} defaultEn={record?.descriptionEn} defaultTa={record?.descriptionTa} />
        <BilingualField name="issuingAuthority" label="Issuing authority" maxLength={200} defaultEn={record?.issuingAuthorityEn} defaultTa={record?.issuingAuthorityTa} />
      </BilingualSection>
      <FormSection title="Source">
        <FieldGrid>
          <TextField name="referenceNumber" label="Reference number" description="Registration or certificate number, as printed." defaultValue={record?.referenceNumber} />
          <DateField name="issuedAt" label="Issued" defaultValue={record?.issuedAt} />
          <TextField name="externalUrl" label="Registry / issuer link" type="url" defaultValue={record?.externalUrl} />
          <DateField name="lastCheckedAt" label="Last checked" description="When someone at the trust last confirmed the link." defaultValue={record?.lastCheckedAt} />
        </FieldGrid>
        <FieldGrid>
          <RelationSelect name="documentId" label="Document" options={options.documents} defaultValue={record?.documentId} />
          <RelationSelect name="certificateId" label="Certificate" options={options.certificates} defaultValue={record?.certificateId} />
          <RelationSelect name="projectId" label="Project" options={options.projects} defaultValue={record?.projectId} />
          <RelationSelect name="trusteeId" label="Trustee" options={options.trustees} defaultValue={record?.trusteeId} />
        </FieldGrid>
      </FormSection>
    </EditorFrame>
  );
}
