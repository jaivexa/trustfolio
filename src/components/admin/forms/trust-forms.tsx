import { BilingualField } from "@/components/admin/bilingual";
import { FormSection } from "@/components/admin/entity-form";
import { DateField, FieldGrid, RelationSelect, SelectField, SlugField, StatusField, SwitchField, TextField } from "@/components/admin/fields";
import { MediaPicker, RelationPicker } from "@/components/admin/pickers";
import { OBJECTIVE_ICON_NAMES } from "@/lib/constants";
import { saveFaq, saveHistoryEvent, saveObjective, saveTrustee } from "@/server/actions/admin/trust";
import {
  pickedMedia,
  type AdminOptions,
  type getFaqForEdit,
  type getHistoryForEdit,
  type getObjectiveForEdit,
  type getTrusteeForEdit,
} from "@/server/queries/admin";
import { BilingualSection, EditorFrame, PRIVACY_NOTE } from "./editor-frame";

type Loaded<F extends (...args: never[]) => Promise<unknown>> = NonNullable<Awaited<ReturnType<F>>>;

export function TrusteeForm({ id, record, options }: { id: string | null; record: Loaded<typeof getTrusteeForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="trustees"
      id={id}
      name={record?.nameEn}
      status={record?.status}
      publicHref={record ? `/trustees/${record.slug}` : null}
      action={saveTrustee.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} description="A profile can only be published after the person's consent is recorded." />
            <SwitchField
              name="publicationConsent"
              label="Consent to publish recorded"
              description="The trustee has agreed to the details, photo and links shown on this profile."
              defaultChecked={record?.publicationConsent ?? false}
            />
            <SwitchField name="isFounder" label="Founder" description="Shown as the founder on the home and about pages. Only one founder." defaultChecked={record?.isFounder ?? false} />
            <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={record?.sortOrder ?? 0} />
          </FormSection>
          <FormSection title="Photo">
            <MediaPicker name="photoId" label="Portrait" description="Only with the person's consent. Leave empty to show initials." initial={pickedMedia(record?.photo)} />
          </FormSection>
        </>
      }
    >
      <p role="note" className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
        {PRIVACY_NOTE}
      </p>
      <BilingualSection title="Profile">
        <BilingualField name="name" label="Full name" required maxLength={120} defaultEn={record?.nameEn} defaultTa={record?.nameTa} />
        <BilingualField name="position" label="Position in the trust" required maxLength={120} placeholder="e.g. Managing Trustee" defaultEn={record?.positionEn} defaultTa={record?.positionTa} />
        <BilingualField name="bio" label="Biography" kind="markdown" rows={8} maxLength={10000} defaultEn={record?.bioEn} defaultTa={record?.bioTa} />
        <BilingualField name="vision" label="Personal vision / message" kind="textarea" maxLength={2000} defaultEn={record?.visionEn} defaultTa={record?.visionTa} />
        <BilingualField name="contribution" label="Contribution to the trust" kind="markdown" rows={6} maxLength={6000} defaultEn={record?.contributionEn} defaultTa={record?.contributionTa} />
        <BilingualField
          name="responsibilities"
          label="Responsibilities"
          kind="list"
          rows={5}
          description="Up to 15."
          defaultEn={record?.responsibilitiesEn.join("\n")}
          defaultTa={record?.responsibilitiesTa.join("\n")}
        />
      </BilingualSection>
      <FormSection title="Details & public links" description="Only public, official contact details.">
        <SlugField defaultValue={record?.slug} source="nameEn" prefix="/trustees" />
        <FieldGrid>
          <DateField name="joinedAt" label="Joined the trust" defaultValue={record?.joinedAt} />
          <TextField name="publicEmail" label="Public email" type="email" defaultValue={record?.publicEmail} />
          <TextField name="linkedinUrl" label="LinkedIn URL" type="url" defaultValue={record?.linkedinUrl} />
          <TextField name="websiteUrl" label="Website" type="url" defaultValue={record?.websiteUrl} />
        </FieldGrid>
      </FormSection>
      <FormSection title="Evidence">
        <RelationPicker
          name="documentIds"
          label="Related documents"
          description="e.g. the trust deed or resolution naming this trustee. Only public, published documents appear on the site."
          options={options.documents}
          initial={record?.documents.map((d) => d.id)}
        />
      </FormSection>
    </EditorFrame>
  );
}

const ICON_OPTIONS = OBJECTIVE_ICON_NAMES.map((name) => ({ value: name, label: name.replace(/-/g, " ") }));

export function ObjectiveForm({ id, record, options }: { id: string | null; record: Loaded<typeof getObjectiveForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="objectives"
      id={id}
      name={record?.titleEn}
      status={record?.status}
      action={saveObjective.bind(null, id)}
      aside={
        <FormSection title="Publishing">
          <StatusField defaultValue={record?.status} />
          <SelectField name="icon" label="Icon" options={ICON_OPTIONS} defaultValue={record?.icon ?? "heart-handshake"} />
          <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={record?.sortOrder ?? 0} />
        </FormSection>
      }
    >
      <BilingualSection title="Objective" description="Use the wording of the trust deed. Do not paraphrase legal objectives into new claims.">
        <BilingualField name="title" label="Objective" required maxLength={160} defaultEn={record?.titleEn} defaultTa={record?.titleTa} />
        <BilingualField name="description" label="Explanation" kind="textarea" maxLength={2000} defaultEn={record?.descriptionEn} defaultTa={record?.descriptionTa} />
      </BilingualSection>
      <FormSection title="Source">
        <TextField name="sourceReference" label="Source reference" placeholder="e.g. Trust deed, clause 3(a)" defaultValue={record?.sourceReference} />
        <RelationSelect name="sourceDocumentId" label="Source document" options={options.documents} defaultValue={record?.sourceDocumentId} />
      </FormSection>
    </EditorFrame>
  );
}

export function HistoryForm({ id, record, options }: { id: string | null; record: Loaded<typeof getHistoryForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="history"
      id={id}
      name={record?.titleEn}
      status={record?.status}
      action={saveHistoryEvent.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} />
            <DateField name="date" label="Date" required defaultValue={record?.date} />
          </FormSection>
          <FormSection title="Image">
            <MediaPicker name="imageId" label="Image" initial={pickedMedia(record?.image)} />
          </FormSection>
        </>
      }
    >
      <BilingualSection title="Milestone">
        <BilingualField name="dateLabel" label="Date label" maxLength={60} placeholder="e.g. 2019 or March 2019" description="Optional. Shown instead of the exact date." defaultEn={record?.dateLabelEn} defaultTa={record?.dateLabelTa} />
        <BilingualField name="title" label="Title" required maxLength={200} defaultEn={record?.titleEn} defaultTa={record?.titleTa} />
        <BilingualField name="description" label="Description" kind="textarea" maxLength={3000} defaultEn={record?.descriptionEn} defaultTa={record?.descriptionTa} />
      </BilingualSection>
      <FormSection title="Evidence">
        <FieldGrid>
          <RelationSelect name="documentId" label="Supporting document" options={options.documents} defaultValue={record?.documentId} />
          <RelationSelect name="trusteeId" label="Related trustee" options={options.trustees} defaultValue={record?.trusteeId} />
        </FieldGrid>
        <TextField name="evidenceUrl" label="External evidence link" type="url" description="e.g. a news article or official notice." defaultValue={record?.evidenceUrl} />
      </FormSection>
    </EditorFrame>
  );
}

export function FaqForm({ id, record }: { id: string | null; record: Loaded<typeof getFaqForEdit> | null }) {
  return (
    <EditorFrame
      resource="faqs"
      id={id}
      name={record?.questionEn}
      status={record?.status}
      action={saveFaq.bind(null, id)}
      aside={
        <FormSection title="Publishing">
          <StatusField defaultValue={record?.status} />
          <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={record?.sortOrder ?? 0} />
        </FormSection>
      }
    >
      <BilingualSection title="Question">
        <BilingualField name="question" label="Question" required maxLength={300} defaultEn={record?.questionEn} defaultTa={record?.questionTa} />
        <BilingualField name="answer" label="Answer" kind="markdown" required rows={6} maxLength={4000} defaultEn={record?.answerEn} defaultTa={record?.answerTa} />
      </BilingualSection>
    </EditorFrame>
  );
}
