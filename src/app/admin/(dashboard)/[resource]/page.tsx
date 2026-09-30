import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceTable } from "@/components/admin/resource-table";
import { RESOURCES, resourceFromSlug, type ResourceKey } from "@/lib/admin-resources";
import { listResourceRows } from "@/server/queries/admin";

const DESCRIPTIONS: Record<ResourceKey, string> = {
  trustees: "Board members and the founder. Profiles are published only with recorded consent.",
  objectives: "The trust's objects, as written in the trust deed.",
  history: "Milestones for the history timeline.",
  activities: "Individual programmes, camps and events that took place.",
  projects: "Longer-running initiatives with their need, approach and evidence.",
  metrics: "Impact figures with period, method and source. Only record what was counted.",
  testimonials: "Real words from beneficiaries and partners, with consent.",
  stories: "Beneficiary stories, published only with consent (anonymise where needed).",
  documents: "Document vault. Public files are redacted copies; originals stay private.",
  reports: "Annual reports with their English and Tamil PDFs.",
  certificates: "Certificates, awards and recognitions with issuer verification links.",
  verification: "Evidence Center entries: what can be checked, and where.",
  albums: "Photo albums for the public gallery.",
  news: "News updates and events.",
  faqs: "Frequently asked questions shown on the About page.",
};

async function resolve(params: Promise<{ resource: string }>) {
  const resource = resourceFromSlug((await params).resource);
  if (!resource) notFound();
  return resource;
}

export async function generateMetadata({ params }: PageProps<"/admin/[resource]">): Promise<Metadata> {
  const resource = resourceFromSlug((await params).resource);
  return { title: resource ? RESOURCES[resource].label : "Not found" };
}

export default async function ResourceListPage({ params }: PageProps<"/admin/[resource]">) {
  const resource = await resolve(params);
  const config = RESOURCES[resource];
  const rows = await listResourceRows(resource);

  return (
    <>
      <PageHeader
        title={config.label}
        description={DESCRIPTIONS[resource]}
        actions={
          <Button asChild>
            <Link prefetch={false} href={`${config.href}/new`}>
              <Plus aria-hidden="true" /> New {config.singular.toLowerCase()}
            </Link>
          </Button>
        }
      />
      <ResourceTable resource={resource} rows={rows} />
    </>
  );
}
