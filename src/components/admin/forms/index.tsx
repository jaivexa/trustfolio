import "server-only";
import type { ResourceKey } from "@/lib/admin-resources";
import {
  getActivityForEdit,
  getAlbumForEdit,
  getCertificateForEdit,
  getDocumentForEdit,
  getFaqForEdit,
  getHistoryForEdit,
  getMetricForEdit,
  getNewsForEdit,
  getObjectiveForEdit,
  getOptions,
  getProjectForEdit,
  getReportForEdit,
  getStoryForEdit,
  getTestimonialForEdit,
  getTrusteeForEdit,
  getVerificationForEdit,
} from "@/server/queries/admin";
import { AlbumForm, NewsForm } from "./content-forms";
import { CertificateForm, DocumentForm, ReportForm, VerificationForm } from "./evidence-forms";
import { FaqForm, HistoryForm, ObjectiveForm, TrusteeForm } from "./trust-forms";
import { ActivityForm, MetricForm, ProjectForm, StoryForm, TestimonialForm } from "./work-forms";

/**
 * Loads a record (or none, for "new") and renders its editor.
 * Returns `null` when an id is given but the record does not exist.
 */
export async function renderEditor(resource: ResourceKey, id: string | null): Promise<React.ReactNode | null> {
  const options = await getOptions();
  const load = async <T,>(loader: (id: string) => Promise<T | null>) => (id ? await loader(id) : null);

  switch (resource) {
    case "trustees": {
      const record = await load(getTrusteeForEdit);
      return id && !record ? null : <TrusteeForm id={id} record={record} options={options} />;
    }
    case "objectives": {
      const record = await load(getObjectiveForEdit);
      return id && !record ? null : <ObjectiveForm id={id} record={record} options={options} />;
    }
    case "history": {
      const record = await load(getHistoryForEdit);
      return id && !record ? null : <HistoryForm id={id} record={record} options={options} />;
    }
    case "faqs": {
      const record = await load(getFaqForEdit);
      return id && !record ? null : <FaqForm id={id} record={record} />;
    }
    case "projects": {
      const record = await load(getProjectForEdit);
      return id && !record ? null : <ProjectForm id={id} record={record} options={options} />;
    }
    case "activities": {
      const record = await load(getActivityForEdit);
      return id && !record ? null : <ActivityForm id={id} record={record} options={options} />;
    }
    case "metrics": {
      const record = await load(getMetricForEdit);
      return id && !record ? null : <MetricForm id={id} record={record} options={options} />;
    }
    case "testimonials": {
      const record = await load(getTestimonialForEdit);
      return id && !record ? null : <TestimonialForm id={id} record={record} options={options} />;
    }
    case "stories": {
      const record = await load(getStoryForEdit);
      return id && !record ? null : <StoryForm id={id} record={record} options={options} />;
    }
    case "documents": {
      const record = await load(getDocumentForEdit);
      return id && !record ? null : <DocumentForm id={id} record={record} options={options} />;
    }
    case "reports": {
      const record = await load(getReportForEdit);
      return id && !record ? null : <ReportForm id={id} record={record} options={options} />;
    }
    case "certificates": {
      const record = await load(getCertificateForEdit);
      return id && !record ? null : <CertificateForm id={id} record={record} options={options} />;
    }
    case "verification": {
      const record = await load(getVerificationForEdit);
      return id && !record ? null : <VerificationForm id={id} record={record} options={options} />;
    }
    case "albums": {
      const record = await load(getAlbumForEdit);
      return id && !record ? null : <AlbumForm id={id} record={record} options={options} />;
    }
    case "news": {
      const record = await load(getNewsForEdit);
      return id && !record ? null : <NewsForm id={id} record={record} options={options} />;
    }
  }
}
