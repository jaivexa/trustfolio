import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media-library";
import { PageHeader } from "@/components/admin/page-header";
import { listMedia } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaPage() {
  const items = await listMedia();
  return (
    <>
      <PageHeader title="Media library" description="Every uploaded image and PDF. Alt text and captions are edited here once, in English and Tamil." />
      <MediaLibrary items={items} />
    </>
  );
}
