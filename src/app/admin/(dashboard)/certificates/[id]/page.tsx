import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { DeleteRedirectButton } from "@/components/admin/delete-redirect-button";
import { CertificateForm } from "@/components/admin/forms/certificate-form";
import { deleteCertificate, saveCertificate } from "@/server/actions/admin/certificates";
import { getCertificateForEdit } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Edit certificate" };

export default async function EditCertificatePage({ params }: PageProps<"/admin/certificates/[id]">) {
  const { id } = await params;
  const certificate = await getCertificateForEdit(id);
  if (!certificate) notFound();

  return (
    <>
      <PageHeader
        title={certificate.name}
        backHref="/admin/certificates"
        backLabel="Certificates"
        actions={
          <DeleteRedirectButton action={deleteCertificate.bind(null, certificate.id)} itemName={`“${certificate.name}”`} redirectTo="/admin/certificates" />
        }
      />
      <CertificateForm action={saveCertificate.bind(null, certificate.id)} certificate={certificate} />
    </>
  );
}
