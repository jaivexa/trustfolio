import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderEditor } from "@/components/admin/forms";
import { RESOURCES, resourceFromSlug } from "@/lib/admin-resources";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]/new">): Promise<Metadata> {
  const resource = resourceFromSlug((await params).resource);
  return { title: resource ? `New ${RESOURCES[resource].singular.toLowerCase()}` : "Not found" };
}

export default async function NewResourcePage({ params }: PageProps<"/admin/[resource]/new">) {
  const resource = resourceFromSlug((await params).resource);
  if (!resource) notFound();
  return renderEditor(resource, null);
}
