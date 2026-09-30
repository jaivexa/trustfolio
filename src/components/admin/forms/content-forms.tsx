import { BilingualField } from "@/components/admin/bilingual";
import { FormSection } from "@/components/admin/entity-form";
import { DateField, FieldGrid, RelationSelect, SelectField, SlugField, StatusField, TextField } from "@/components/admin/fields";
import { MediaListPicker, MediaPicker } from "@/components/admin/pickers";
import { saveAlbum, saveNews } from "@/server/actions/admin/media";
import { pickedMedia, type AdminOptions, type getAlbumForEdit, type getNewsForEdit } from "@/server/queries/admin";
import { BilingualSection, EditorFrame } from "./editor-frame";

type Loaded<F extends (...args: never[]) => Promise<unknown>> = NonNullable<Awaited<ReturnType<F>>>;

export function AlbumForm({ id, record, options }: { id: string | null; record: Loaded<typeof getAlbumForEdit> | null; options: AdminOptions }) {
  const images = (record?.images ?? []).flatMap(({ media }) => {
    const picked = pickedMedia(media);
    return picked ? [picked] : [];
  });
  return (
    <EditorFrame
      resource="albums"
      id={id}
      name={record?.titleEn}
      status={record?.status}
      publicHref={record ? `/gallery/${record.slug}` : null}
      action={saveAlbum.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} />
            <DateField name="date" label="Date" defaultValue={record?.date} />
            <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={record?.sortOrder ?? 0} />
          </FormSection>
          <FormSection title="Cover">
            <MediaPicker name="coverId" label="Cover photo" description="Defaults to the first photo." initial={pickedMedia(record?.cover)} />
          </FormSection>
        </>
      }
    >
      <FormSection title="Photos" description="Only photos the trust may publish. Avoid identifiable children's faces without guardian consent.">
        <MediaListPicker name="imageIds" label="Photos in this album" initial={images} />
      </FormSection>
      <BilingualSection title="Album">
        <BilingualField name="title" label="Title" required maxLength={200} defaultEn={record?.titleEn} defaultTa={record?.titleTa} />
        <BilingualField name="description" label="Description" kind="textarea" maxLength={3000} defaultEn={record?.descriptionEn} defaultTa={record?.descriptionTa} />
        <BilingualField name="location" label="Location" maxLength={200} defaultEn={record?.locationEn} defaultTa={record?.locationTa} />
      </BilingualSection>
      <FormSection title="Link & context">
        <SlugField defaultValue={record?.slug} prefix="/gallery" />
        <FieldGrid cols={3}>
          <RelationSelect name="categoryId" label="Category" options={options.categories.GALLERY} defaultValue={record?.categoryId} />
          <RelationSelect name="projectId" label="Project" options={options.projects} defaultValue={record?.projectId} />
          <RelationSelect name="activityId" label="Activity" options={options.activities} defaultValue={record?.activityId} />
        </FieldGrid>
      </FormSection>
    </EditorFrame>
  );
}

const KINDS = [
  { value: "NEWS", label: "News / update" },
  { value: "EVENT", label: "Event" },
];

export function NewsForm({ id, record, options }: { id: string | null; record: Loaded<typeof getNewsForEdit> | null; options: AdminOptions }) {
  return (
    <EditorFrame
      resource="news"
      id={id}
      name={record?.titleEn}
      status={record?.status}
      publicHref={record ? `/news/${record.slug}` : null}
      action={saveNews.bind(null, id)}
      aside={
        <>
          <FormSection title="Publishing">
            <StatusField defaultValue={record?.status} />
            <SelectField name="kind" label="Type" options={KINDS} defaultValue={record?.kind ?? "NEWS"} />
            <DateField name="date" label="Publication date" required defaultValue={record?.date ?? new Date()} />
            <TextField name="authorName" label="Author" defaultValue={record?.authorName} />
          </FormSection>
          <FormSection title="Cover image">
            <MediaPicker name="coverId" label="Cover" initial={pickedMedia(record?.cover)} />
          </FormSection>
        </>
      }
    >
      <BilingualSection title="Post">
        <BilingualField name="title" label="Title" required maxLength={200} defaultEn={record?.titleEn} defaultTa={record?.titleTa} />
        <BilingualField name="excerpt" label="Excerpt" kind="textarea" required rows={3} maxLength={400} defaultEn={record?.excerptEn} defaultTa={record?.excerptTa} />
        <BilingualField name="content" label="Content" kind="markdown" required rows={12} maxLength={30000} defaultEn={record?.contentEn} defaultTa={record?.contentTa} />
      </BilingualSection>
      <BilingualSection title="Event details" description="Only for events.">
        <FieldGrid>
          <DateField name="eventStart" label="Starts" defaultValue={record?.eventStart} />
          <DateField name="eventEnd" label="Ends" defaultValue={record?.eventEnd} />
        </FieldGrid>
        <BilingualField name="eventLocation" label="Venue" maxLength={200} defaultEn={record?.eventLocationEn} defaultTa={record?.eventLocationTa} />
      </BilingualSection>
      <FormSection title="Link & context">
        <SlugField defaultValue={record?.slug} prefix="/news" />
        <FieldGrid cols={3}>
          <RelationSelect name="categoryId" label="Category" options={options.categories.NEWS} defaultValue={record?.categoryId} />
          <RelationSelect name="projectId" label="Project" options={options.projects} defaultValue={record?.projectId} />
          <RelationSelect name="activityId" label="Activity" options={options.activities} defaultValue={record?.activityId} />
        </FieldGrid>
      </FormSection>
    </EditorFrame>
  );
}
