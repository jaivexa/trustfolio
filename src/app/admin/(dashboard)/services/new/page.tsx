import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "@/components/admin/forms/service-form";
import { saveService } from "@/server/actions/admin/services";

export const metadata: Metadata = { title: "New service" };

export default function NewServicePage() {
  return (
    <>
      <PageHeader title="New service" backHref="/admin/services" backLabel="Services" />
      <ServiceForm action={saveService.bind(null, null)} />
    </>
  );
}
