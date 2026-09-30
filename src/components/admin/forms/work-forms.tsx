import { BilingualField } from "@/components/admin/bilingual";
import { FormSection } from "@/components/admin/entity-form";
import { DateField, FieldGrid, RelationSelect, SelectField, SlugField, StatusField, SwitchField, TextField } from "@/components/admin/fields";
import { MediaPicker, RelationPicker } from "@/components/admin/pickers";
import { saveActivity, saveMetric, saveProject, saveStory, saveTestimonial } from "@/server/actions/admin/work";
import {
  pickedMedia,
  type AdminOptions,
  type getActivityForEdit,
  type getMetricForEdit,
  type getProjectForEdit,
  type getStoryForEdit,
  type getTestimonialForEdit,
} from "@/server/queries/admin";
import { BilingualSection, EditorFrame, PRIVACY_NOTE } from "./editor-frame";

type Loaded<F extends (...args: never[]) => Promise<unknown>> = NonNullable<Awaited<ReturnType<F>>>;

const PHASES = [
  { value: "PLANNED", label: "Planned" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PAUSED", label: "Paused" },
];

export function ProjectForm({ id, record, options }: { id: string | null; record: Loaded<typeof getProjectForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="projects"
      id={id}
      name={record?.titleEn}
      status={record?.status}
      publicHref={record ? `/projects/${record.slug}` : null}
      action={saveProject.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} />
            <SwitchField name="isFeatured" label="Featured" description="Highlighted on the home page." defaultChecked={record?.isFeatured ?? false} />
            <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={record?.sortOrder ?? 0} />
          </FormSection>
          <FormSection title="Classification">
            <SelectField name="phase" label="Phase" options={PHASES} defaultValue={record?.phase ?? "PLANNED"} />
            <RelationSelect name="categoryId" label="Category" options={options.categories.PROJECT} defaultValue={record?.categoryId} />
            <DateField name="startDate" label="Start date" defaultValue={record?.startDate} />
            <DateField name="endDate" label="End date" defaultValue={record?.endDate} />
          </FormSection>
          <FormSection title="Cover image">
            <MediaPicker name="coverId" label="Cover" initial={pickedMedia(record?.cover)} />
          </FormSection>
        </>
      }
    >
      <BilingualSection title="Overview">
        <BilingualField name="title" label="Title" required maxLength={200} defaultEn={record?.titleEn} defaultTa={record?.titleTa} />
        <BilingualField name="summary" label="Summary" kind="textarea" required rows={3} maxLength={400} defaultEn={record?.summaryEn} defaultTa={record?.summaryTa} />
        <BilingualField name="location" label="Location" maxLength={200} defaultEn={record?.locationEn} defaultTa={record?.locationTa} />
      </BilingualSection>
      <BilingualSection title="Project story" description="Describe what actually happened. Figures belong in Impact metrics with their source.">
        <BilingualField name="need" label="The need" kind="markdown" rows={6} maxLength={10000} defaultEn={record?.needEn} defaultTa={record?.needTa} />
        <BilingualField name="objectives" label="Objectives" kind="markdown" rows={5} maxLength={6000} defaultEn={record?.objectivesEn} defaultTa={record?.objectivesTa} />
        <BilingualField name="approach" label="Approach" kind="markdown" rows={6} maxLength={10000} defaultEn={record?.approachEn} defaultTa={record?.approachTa} />
        <BilingualField name="content" label="Further details" kind="markdown" rows={8} maxLength={20000} defaultEn={record?.contentEn} defaultTa={record?.contentTa} />
      </BilingualSection>
      <FormSection title="Evidence" description="Link the documents that support this project. Activities, metrics, stories and albums link to the project from their own forms.">
        <RelationPicker name="documentIds" label="Supporting documents" options={options.documents} initial={record?.documents.map((d) => d.id)} />
      </FormSection>
      <BilingualSection title="Link & search">
        <SlugField defaultValue={record?.slug} prefix="/projects" />
        <TextField name="externalUrl" label="External link" type="url" description="Optional, e.g. a partner page." defaultValue={record?.externalUrl} />
        <BilingualField name="externalUrlLabel" label="External link label" maxLength={80} defaultEn={record?.externalUrlLabelEn} defaultTa={record?.externalUrlLabelTa} />
        <BilingualField name="seoTitle" label="SEO title" maxLength={70} description="Optional. Defaults to the title." defaultEn={record?.seoTitleEn} defaultTa={record?.seoTitleTa} />
        <BilingualField name="seoDescription" label="SEO description" kind="textarea" rows={2} maxLength={170} description="Optional. Defaults to the summary." defaultEn={record?.seoDescriptionEn} defaultTa={record?.seoDescriptionTa} />
      </BilingualSection>
    </EditorFrame>
  );
}

export function ActivityForm({ id, record, options }: { id: string | null; record: Loaded<typeof getActivityForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="activities"
      id={id}
      name={record?.titleEn}
      status={record?.status}
      publicHref={record ? `/activities/${record.slug}` : null}
      action={saveActivity.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} />
            <DateField name="date" label="Date" required defaultValue={record?.date} />
            <DateField name="endDate" label="End date" description="For multi-day activities." defaultValue={record?.endDate} />
          </FormSection>
          <FormSection title="Classification">
            <RelationSelect name="categoryId" label="Category" options={options.categories.ACTIVITY} defaultValue={record?.categoryId} />
            <RelationSelect name="projectId" label="Part of project" options={options.projects} defaultValue={record?.projectId} />
          </FormSection>
          <FormSection title="Cover image">
            <MediaPicker name="coverId" label="Cover" initial={pickedMedia(record?.cover)} />
          </FormSection>
        </>
      }
    >
      <BilingualSection title="Activity">
        <BilingualField name="title" label="Title" required maxLength={200} defaultEn={record?.titleEn} defaultTa={record?.titleTa} />
        <BilingualField name="summary" label="Summary" kind="textarea" required rows={3} maxLength={400} defaultEn={record?.summaryEn} defaultTa={record?.summaryTa} />
        <BilingualField name="location" label="Location" maxLength={200} defaultEn={record?.locationEn} defaultTa={record?.locationTa} />
        <BilingualField name="description" label="Description" kind="markdown" rows={8} maxLength={20000} defaultEn={record?.descriptionEn} defaultTa={record?.descriptionTa} />
        <BilingualField name="impact" label="Outcome" kind="markdown" rows={5} maxLength={6000} defaultEn={record?.impactEn} defaultTa={record?.impactTa} />
      </BilingualSection>
      <BilingualSection title="Beneficiaries" description="Only enter a number that was actually counted (attendance list, register…).">
        <TextField name="beneficiaries" label="Number of beneficiaries" type="number" min={0} defaultValue={record?.beneficiaries} />
        <BilingualField name="beneficiariesNote" label="Note on beneficiaries" maxLength={300} placeholder="e.g. Counted from the attendance register" defaultEn={record?.beneficiariesNoteEn} defaultTa={record?.beneficiariesNoteTa} />
      </BilingualSection>
      <FormSection title="Link & evidence">
        <SlugField defaultValue={record?.slug} prefix="/activities" />
        <RelationPicker name="documentIds" label="Supporting documents" options={options.documents} initial={record?.documents.map((d) => d.id)} />
      </FormSection>
    </EditorFrame>
  );
}

export function MetricForm({ id, record, options }: { id: string | null; record: Loaded<typeof getMetricForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="metrics"
      id={id}
      name={record ? `${record.labelEn}` : undefined}
      status={record?.status}
      action={saveMetric.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} description="Published figures need a method or a source document/report." />
            <SwitchField name="isHeadline" label="Headline figure" description="Shown on the home page (latest period per key)." defaultChecked={record?.isHeadline ?? false} />
            <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={record?.sortOrder ?? 0} />
          </FormSection>
          <FormSection title="Period">
            <DateField name="periodStart" label="From" defaultValue={record?.periodStart} />
            <DateField name="periodEnd" label="To" defaultValue={record?.periodEnd} />
          </FormSection>
        </>
      }
    >
      <p role="note" className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
        Enter only figures the trust can support with records. Every published figure shows its method and source to visitors.
      </p>
      <BilingualSection title="Figure">
        <TextField
          name="metricKey"
          label="Metric key"
          required
          placeholder="e.g. students-supported"
          description="Stable key that groups the same figure across periods (lowercase, hyphens)."
          defaultValue={record?.metricKey}
        />
        <FieldGrid cols={3}>
          <TextField name="prefix" label="Prefix" maxLength={8} placeholder="e.g. ₹" defaultValue={record?.prefix} />
          <TextField name="value" label="Value" type="number" step="any" min={0} required defaultValue={record?.value} />
          <TextField name="suffix" label="Suffix" maxLength={8} placeholder="e.g. +" defaultValue={record?.suffix} />
        </FieldGrid>
        <BilingualField name="label" label="Label" required maxLength={120} placeholder="e.g. Students supported" defaultEn={record?.labelEn} defaultTa={record?.labelTa} />
        <BilingualField name="unit" label="Unit" maxLength={40} placeholder="e.g. students" defaultEn={record?.unitEn} defaultTa={record?.unitTa} />
        <BilingualField name="periodLabel" label="Period label" maxLength={60} placeholder="e.g. 2023–24" defaultEn={record?.periodLabelEn} defaultTa={record?.periodLabelTa} />
      </BilingualSection>
      <BilingualSection title="Method & sources">
        <BilingualField name="methodology" label="How this was counted" kind="textarea" rows={4} maxLength={3000} defaultEn={record?.methodologyEn} defaultTa={record?.methodologyTa} />
        <FieldGrid>
          <RelationSelect name="sourceDocumentId" label="Source document" options={options.documents} defaultValue={record?.sourceDocumentId} />
          <RelationSelect name="reportId" label="Annual report" options={options.reports} defaultValue={record?.reportId} />
          <RelationSelect name="projectId" label="Project" options={options.projects} defaultValue={record?.projectId} />
          <RelationSelect name="categoryId" label="Area of work" options={options.categories.ACTIVITY} defaultValue={record?.categoryId} />
        </FieldGrid>
        <RelationPicker name="activityIds" label="Activities counted" options={options.activities} initial={record?.activities.map((a) => a.id)} />
      </BilingualSection>
    </EditorFrame>
  );
}

export function TestimonialForm({ id, record, options }: { id: string | null; record: Loaded<typeof getTestimonialForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="testimonials"
      id={id}
      name={record?.nameEn}
      status={record?.status}
      action={saveTestimonial.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} description="Only real testimonials, published with the person's consent." />
            <SwitchField name="consentObtained" label="Consent recorded" description="The person agreed to publish their words and name." defaultChecked={record?.consentObtained ?? false} />
            <SwitchField
              name="relationshipVerified"
              label="Relationship confirmed"
              description="The trust confirmed this person's connection (beneficiary, partner…)."
              defaultChecked={record?.relationshipVerified ?? false}
            />
            <DateField name="date" label="Date given" required defaultValue={record?.date} />
            <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={record?.sortOrder ?? 0} />
          </FormSection>
          <FormSection title="Photo">
            <MediaPicker name="photoId" label="Photo" description="Optional, with consent." initial={pickedMedia(record?.photo)} />
          </FormSection>
        </>
      }
    >
      <p role="note" className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
        {PRIVACY_NOTE}
      </p>
      <BilingualSection title="Testimonial">
        <BilingualField name="content" label="Words" kind="textarea" required rows={5} maxLength={3000} description="As given — translate faithfully, do not embellish." defaultEn={record?.contentEn} defaultTa={record?.contentTa} />
        <BilingualField name="name" label="Name" required maxLength={120} defaultEn={record?.nameEn} defaultTa={record?.nameTa} />
        <BilingualField name="role" label="Role" maxLength={120} defaultEn={record?.roleEn} defaultTa={record?.roleTa} />
        <BilingualField name="organization" label="Organisation" maxLength={160} defaultEn={record?.organizationEn} defaultTa={record?.organizationTa} />
        <BilingualField name="relationship" label="Relationship to the trust" maxLength={160} placeholder="e.g. Parent of a scholarship student" defaultEn={record?.relationshipEn} defaultTa={record?.relationshipTa} />
      </BilingualSection>
      <FormSection title="Context">
        <FieldGrid>
          <RelationSelect name="projectId" label="Project" options={options.projects} defaultValue={record?.projectId} />
          <RelationSelect name="activityId" label="Activity" options={options.activities} defaultValue={record?.activityId} />
        </FieldGrid>
      </FormSection>
    </EditorFrame>
  );
}

export function StoryForm({ id, record, options }: { id: string | null; record: Loaded<typeof getStoryForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="stories"
      id={id}
      name={record?.titleEn}
      status={record?.status}
      publicHref={record ? `/stories/${record.slug}` : null}
      action={saveStory.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} description="Stories cannot be published without recorded consent." />
            <SwitchField name="consentObtained" label="Consent recorded" description="The person (or guardian) agreed to this story being published." defaultChecked={record?.consentObtained ?? false} />
            <SwitchField name="anonymized" label="Anonymised" description="Names and identifying details were changed or removed." defaultChecked={record?.anonymized ?? false} />
          </FormSection>
          <FormSection title="Cover image">
            <MediaPicker name="coverId" label="Cover" initial={pickedMedia(record?.cover)} />
          </FormSection>
        </>
      }
    >
      <p role="note" className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
        {PRIVACY_NOTE} For children, use first names only or anonymise.
      </p>
      <BilingualSection title="Story">
        <BilingualField name="title" label="Title" required maxLength={200} defaultEn={record?.titleEn} defaultTa={record?.titleTa} />
        <BilingualField name="summary" label="Summary" kind="textarea" required rows={3} maxLength={500} defaultEn={record?.summaryEn} defaultTa={record?.summaryTa} />
        <BilingualField name="subject" label="Who this is about" maxLength={200} placeholder="e.g. A first-generation college student" defaultEn={record?.subjectEn} defaultTa={record?.subjectTa} />
        <BilingualField name="challenge" label="The challenge" kind="markdown" rows={5} maxLength={8000} defaultEn={record?.challengeEn} defaultTa={record?.challengeTa} />
        <BilingualField name="support" label="Support given" kind="markdown" rows={5} maxLength={8000} defaultEn={record?.supportEn} defaultTa={record?.supportTa} />
        <BilingualField name="journey" label="Journey" kind="markdown" rows={5} maxLength={8000} defaultEn={record?.journeyEn} defaultTa={record?.journeyTa} />
        <BilingualField name="outcome" label="Outcome" kind="markdown" rows={5} maxLength={8000} defaultEn={record?.outcomeEn} defaultTa={record?.outcomeTa} />
      </BilingualSection>
      <FormSection title="Link & context">
        <SlugField defaultValue={record?.slug} prefix="/stories" />
        <FieldGrid cols={3}>
          <RelationSelect name="projectId" label="Project" options={options.projects} defaultValue={record?.projectId} />
          <RelationSelect name="activityId" label="Activity" options={options.activities} defaultValue={record?.activityId} />
          <RelationSelect name="albumId" label="Photo album" options={options.albums} defaultValue={record?.albumId} />
        </FieldGrid>
      </FormSection>
    </EditorFrame>
  );
}
