"use client";

import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SmartImage } from "@/components/shared/smart-image";

/** Thumbnail that opens the full certificate in an accessible modal. */
export function CertificatePreview({
  name,
  issuer,
  imageUrl,
  children,
}: {
  name: string;
  issuer: string;
  imageUrl: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger
        className="relative block aspect-[16/9] w-full cursor-zoom-in overflow-hidden bg-muted/60 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-inset"
        aria-label={`Enlarge ${name} certificate`}
      >
        {children}
        <span className="glass absolute right-3 bottom-3 grid size-8 place-items-center rounded-full border opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-3.5" aria-hidden="true" />
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Issued by {issuer}</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-[10/7] w-full overflow-hidden rounded-xl bg-muted">
          <SmartImage src={imageUrl} alt={`${name} certificate`} fill sizes="768px" className="object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
