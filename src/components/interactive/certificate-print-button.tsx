"use client";

import { ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CertificateToolbar({
  pdfUrl,
  backUrl,
}: {
  pdfUrl: string;
  backUrl: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Button asChild variant="ghost" size="sm">
        <Link href={backUrl}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Link>
      </Button>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="gap-1.5 cursor-pointer"
        >
          <Printer className="size-4" aria-hidden="true" />
          Print
        </Button>
        <Button asChild size="sm" className="gap-1.5">
          <a href={pdfUrl} download>
            <Download className="size-4" aria-hidden="true" />
            Download PDF Certificate
          </a>
        </Button>
      </div>
    </div>
  );
}
