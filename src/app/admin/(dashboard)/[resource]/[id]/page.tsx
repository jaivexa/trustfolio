import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderEditor } from "@/components/admin/forms";
import { RESOURCES, resourceFromSlug } from "@/lib/admin-resources";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]/[id]">): Promise<Metadata> {
  const resource = resourceFromSlug((await params).resource);
  return { title: resource ? `Edit ${RESOURCES[resource].singular.toLowerCase()}` : "Not found" };
}

export default async function EditResourcePage({ params }: PageProps<"/admin/[resource]/[id]">) {
  const { resource: slug, id } = await params;
  const resource = resourceFromSlug(slug);
  if (!resource || id.length > 64) notFound();
  const editor = await renderEditor(resource, id);
  if (!editor) notFound();
  return editor;
}
