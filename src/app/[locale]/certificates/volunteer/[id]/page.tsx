import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, CheckCircle2, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { getPageContext } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { formatDate } from "@/lib/utils";
import { getTrust } from "@/server/queries/public";
import { CertificateToolbar } from "@/components/interactive/certificate-print-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const volunteer = await db.volunteerApplication.findUnique({
    where: { id },
    select: { fullName: true, status: true, isDeleted: true },
  });

  if (!volunteer || volunteer.isDeleted || volunteer.status !== "APPROVED") {
    return { title: "Certificate Not Found" };
  }

  return {
    title: `Volunteer Certificate · ${volunteer.fullName}`,
    description: `Official volunteer appreciation certificate for ${volunteer.fullName}.`,
  };
}

export default async function VolunteerCertificatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await getPageContext(params);
  const { id } = await params;

  const volunteer = await db.volunteerApplication.findUnique({
    where: { id },
    include: {
      activity: {
        select: { titleEn: true, titleTa: true },
      },
    },
  });

  if (!volunteer || volunteer.isDeleted || volunteer.status !== "APPROVED") {
    notFound();
  }

  const trust = await getTrust();
  const trustName = trust.namePending ? "Trustfolio" : (trust.name.en || "Public Charitable Trust");
  const credentialId = `VOL-${volunteer.id.slice(-6).toUpperCase()}`;
  const issueDate = formatDate(volunteer.updatedAt || new Date());
  const activityTitle = volunteer.activity?.titleEn || "Community Engagement & Volunteering";
  const pdfUrl = `/api/volunteers/${volunteer.id}/certificate/pdf`;
  const backUrl = localePath(locale, "/");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Client Toolbar for Print and Download */}
      <CertificateToolbar pdfUrl={pdfUrl} backUrl={backUrl} />

      {/* Printable Certificate Frame */}
      <div
        id="printable-certificate"
        className="relative overflow-hidden rounded-2xl border-8 border-primary/90 bg-[#fdfbf7] p-6 text-foreground shadow-lift sm:p-12 md:p-16 dark:bg-card dark:border-primary/60"
      >
        {/* Inner Gold Inset Border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-xl border-2 border-amber-500/70 dark:border-amber-400/40"
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Header */}
          <div className="flex flex-col items-center">
            <span className="grid size-12 place-items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="size-6" aria-hidden="true" />
            </span>
            <p className="tracking-eyebrow mt-3 text-xs font-bold text-amber-600 dark:text-amber-400">
              {trustName}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
              Certificate of Volunteering
            </h1>
            <p className="mt-2 text-xs font-medium tracking-widest text-muted-foreground uppercase sm:text-sm">
              This certificate is proudly presented to
            </p>
          </div>

          {/* Recipient */}
          <div className="my-6 w-full max-w-xl border-b-2 border-border pb-3 sm:my-8">
            <p className="font-display text-2xl font-bold text-foreground sm:text-4xl md:text-5xl">
              {volunteer.fullName}
            </p>
          </div>

          {/* Body Citation */}
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            In grateful appreciation and official recognition of your commitment, dedication, and valuable voluntary service rendered for:
          </p>

          <p className="mt-3 font-display text-lg font-semibold text-primary sm:text-2xl">
            {activityTitle}
          </p>

          {/* Verification Badge */}
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Official Verified Volunteer Record
          </div>

          {/* Footer Metadata & Signatures */}
          <div className="mt-10 grid w-full grid-cols-1 items-end gap-6 border-t pt-8 sm:mt-14 sm:grid-cols-3 sm:gap-4">
            {/* Left: Credential details */}
            <div className="text-left text-xs text-muted-foreground">
              <p className="font-bold tracking-wider uppercase text-foreground">Credential ID</p>
              <p className="font-mono text-sm font-semibold text-foreground">{credentialId}</p>
              <p className="mt-1 text-[11px]">Issued: {issueDate}</p>
            </div>

            {/* Center: Official Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="grid size-16 place-items-center rounded-full border-2 border-dashed border-amber-500/80 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="size-8" aria-hidden="true" />
              </div>
              <p className="mt-1 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                Authorized Seal
              </p>
            </div>

            {/* Right: Signature */}
            <div className="flex flex-col items-center sm:items-end">
              <div className="w-36 border-b border-border pb-1 text-center sm:text-right">
                <p className="font-display italic text-muted-foreground">Board of Trustees</p>
              </div>
              <p className="mt-1 text-xs font-semibold text-foreground">{trustName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
