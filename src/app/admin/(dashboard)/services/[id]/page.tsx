import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { DeleteRedirectButton } from "@/components/admin/delete-redirect-button";
import { ServiceForm } from "@/components/admin/forms/service-form";
import { deleteService, saveService } from "@/server/actions/admin/services";
import { getServiceForEdit } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: PageProps<"/admin/services/[id]">) {
  const { id } = await params;
  const service = await getServiceForEdit(id);
  if (!service) notFound();

  return (
    <>
      <PageHeader
        title={service.title}
        backHref="/admin/services"
        backLabel="Services"
        actions={<DeleteRedirectButton action={deleteService.bind(null, service.id)} itemName={`“${service.title}”`} redirectTo="/admin/services" />}
      />
      <ServiceForm action={saveService.bind(null, service.id)} service={service} />
    </>
  );
}
