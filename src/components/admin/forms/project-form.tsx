"use client";

import { useState } from "react";
import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { DateField, FieldGrid, SwitchField, TextareaField, TextField } from "@/components/admin/fields";
import { GalleryEditor, MetricsEditor } from "@/components/admin/list-editors";
import { MarkdownField } from "@/components/admin/markdown-field";
import { MediaField } from "@/components/admin/media-field";
import { TagsField } from "@/components/admin/tags-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ActionState } from "@/lib/action-state";
import { slugify } from "@/lib/utils";

export type ProjectFormValues = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  thumbnailUrl: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  completedAt: Date | null;
  clientName: string | null;
  clientIndustry: string | null;
  clientUrl: string | null;
  role: string | null;
  duration: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  technologies: string[];
  metrics: { label: string; value: string }[];
  images: { url: string; alt: string; caption: string | null }[];
};

/**
 * Rich project editor. Tabs keep a long form manageable; every tab stays
 * mounted (hidden) so all fields submit together.
 */
export function ProjectForm({
  action,
  project,
  technologies,
  categories,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  project?: ProjectFormValues;
  technologies: string[];
  categories: string[];
}) {
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));

  return (
    <EntityForm
      action={action}
      cancelHref="/admin/projects"
      successHref={project ? undefined : "/admin/projects/{id}"}
      submitLabel={project ? "Save changes" : "Create project"}
    >
      <Tabs defaultValue="basics">
        <TabsList>
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="case-study">Case study</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="client">Client & links</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" forceMount className="space-y-6 data-[state=inactive]:hidden">
          <FormSection title="Project details">
            <FieldGrid>
              <TextField
                name="title"
                label="Title"
                required
                defaultValue={project?.title}
                maxLength={120}
                onChange={(event) => {
                  if (!slugTouched) setSlug(slugify(event.target.value));
                }}
              />
              <TextField
                name="slug"
                label="URL slug"
                required
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                description={`/projects/${slug || "your-project"}`}
              />
            </FieldGrid>
            <FieldGrid>
              <TextField
                name="category"
                label="Category"
                required
                defaultValue={project?.category}
                list="project-categories"
                description="E.g. Fintech, SaaS, Open Source"
              />
              <DateField name="completedAt" label="Completion date" defaultValue={project?.completedAt} />
            </FieldGrid>
            <datalist id="project-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <TextareaField
              name="summary"
              label="Summary"
              required
              rows={2}
              maxLength={300}
              defaultValue={project?.summary}
              description="One or two sentences shown on project cards."
            />
            <MarkdownField name="description" label="Description" required defaultValue={project?.description} maxLength={20000} rows={10} />
            <TagsField name="technologies" label="Technologies" defaultValue={project?.technologies} suggestions={technologies} />
          </FormSection>
          <FormSection title="Visibility">
            <FieldGrid>
              <SwitchField name="isPublished" label="Published" description="Visible on the public site." defaultChecked={project?.isPublished ?? false} />
              <SwitchField name="isFeatured" label="Featured" description="Highlighted on the home page." defaultChecked={project?.isFeatured ?? false} />
            </FieldGrid>
            <TextField name="sortOrder" label="Sort order" type="number" min={0} defaultValue={project?.sortOrder ?? 0} description="Lower numbers appear first." className="max-w-40" />
          </FormSection>
        </TabsContent>

        <TabsContent value="case-study" forceMount className="space-y-6 data-[state=inactive]:hidden">
          <FormSection title="Case study" description="Tell the story: the problem, your approach, and the measurable outcome.">
            <MarkdownField name="challenge" label="Challenge" defaultValue={project?.challenge} maxLength={10000} />
            <MarkdownField name="solution" label="Approach" defaultValue={project?.solution} maxLength={10000} />
            <MarkdownField name="results" label="Results" defaultValue={project?.results} maxLength={10000} />
          </FormSection>
          <FormSection title="Key metrics" description="Up to 8 headline numbers shown prominently on the project page.">
            <MetricsEditor defaultValue={project?.metrics} />
          </FormSection>
        </TabsContent>

        <TabsContent value="media" forceMount className="space-y-6 data-[state=inactive]:hidden">
          <FormSection title="Thumbnail" description="Used on cards and as the cover image. 1200×750 or larger recommended.">
            <MediaField name="thumbnailUrl" label="Thumbnail" folder="projects" defaultValue={project?.thumbnailUrl} />
          </FormSection>
          <FormSection title="Gallery" description="Screenshots and diagrams. Write descriptive alt text for accessibility.">
            <GalleryEditor defaultValue={project?.images} />
          </FormSection>
        </TabsContent>

        <TabsContent value="client" forceMount className="space-y-6 data-[state=inactive]:hidden">
          <FormSection title="Client">
            <FieldGrid>
              <TextField name="clientName" label="Client name" defaultValue={project?.clientName} />
              <TextField name="clientIndustry" label="Industry" defaultValue={project?.clientIndustry} />
            </FieldGrid>
            <TextField name="clientUrl" label="Client website" type="url" defaultValue={project?.clientUrl} placeholder="https://" />
            <FieldGrid>
              <TextField name="role" label="Your role" defaultValue={project?.role} placeholder="Lead engineer" />
              <TextField name="duration" label="Duration" defaultValue={project?.duration} placeholder="6 months" />
            </FieldGrid>
          </FormSection>
          <FormSection title="Links">
            <FieldGrid>
              <TextField name="liveUrl" label="Live URL" type="url" defaultValue={project?.liveUrl} placeholder="https://" />
              <TextField name="githubUrl" label="GitHub URL" type="url" defaultValue={project?.githubUrl} placeholder="https://github.com/…" />
            </FieldGrid>
          </FormSection>
        </TabsContent>

        <TabsContent value="seo" forceMount className="space-y-6 data-[state=inactive]:hidden">
          <FormSection title="Search & social" description="Optional overrides. Defaults to the title and summary.">
            <TextField name="seoTitle" label="SEO title" defaultValue={project?.seoTitle} maxLength={70} description="Up to 70 characters." />
            <TextareaField name="seoDescription" label="SEO description" rows={3} defaultValue={project?.seoDescription} maxLength={170} description="Up to 170 characters." />
          </FormSection>
        </TabsContent>
      </Tabs>
    </EntityForm>
  );
}
