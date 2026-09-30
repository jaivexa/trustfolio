import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { CertificateForm } from "@/components/admin/forms/certificate-form";
import { saveCertificate } from "@/server/actions/admin/certificates";

export const metadata: Metadata = { title: "Add certificate" };

export default function NewCertificatePage() {
  return (
    <>
      <PageHeader title="Add certificate" backHref="/admin/certificates" backLabel="Certificates" />
      <CertificateForm action={saveCertificate.bind(null, null)} />
    </>
  );
}
