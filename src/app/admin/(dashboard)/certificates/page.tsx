import type { Metadata } from "next";
import Link from "next/link";
import { Award, ExternalLink, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { DataCard, PageHeader } from "@/components/admin/page-header";
import { DeleteButton, EditButton, ToggleAction } from "@/components/admin/row-actions";
import { formatMonthYear } from "@/lib/utils";
import { deleteCertificate, setCertificatePublished } from "@/server/actions/admin/certificates";
import { listCertificates } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Certificates" };

export default async function AdminCertificatesPage() {
  const certificates = await listCertificates();
  const now = new Date();

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Credentials with verification links and files."
        actions={
          <Button asChild>
            <Link href="/admin/certificates/new">
              <Plus aria-hidden="true" /> Add certificate
            </Link>
          </Button>
        }
      />
      {certificates.length === 0 ? (
        <EmptyState icon={Award} title="No certificates yet" description="Add verifiable credentials to strengthen trust." />
      ) : (
        <DataCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate</TableHead>
                <TableHead className="hidden md:table-cell">Issued</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((cert) => {
                const expired = cert.expiresAt ? cert.expiresAt < now : false;
                return (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <Link href={`/admin/certificates/${cert.id}`} className="font-medium hover:text-brand">
                        {cert.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {cert.issuer}
                        {cert.credentialId && <span className="font-mono"> · {cert.credentialId}</span>}
                      </p>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{formatMonthYear(cert.issuedAt)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {expired ? <Badge variant="destructive">Expired</Badge> : <Badge variant="success">Valid</Badge>}
                    </TableCell>
                    <TableCell>
                      <ToggleAction checked={cert.isPublished} action={setCertificatePublished.bind(null, cert.id)} label={`Publish ${cert.name}`} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-0.5">
                        {cert.verificationUrl && (
                          <Button asChild variant="ghost" size="icon-sm">
                            <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer" aria-label={`Verify ${cert.name}`}>
                              <ExternalLink />
                            </a>
                          </Button>
                        )}
                        <EditButton href={`/admin/certificates/${cert.id}`} label={`Edit ${cert.name}`} />
                        <DeleteButton action={deleteCertificate.bind(null, cert.id)} itemName={`“${cert.name}”`} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataCard>
      )}
    </>
  );
}
