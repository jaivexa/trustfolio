"use client";

import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SmartImage } from "@/components/shared/smart-image";

/** Thumbnail that opens the full certificate image in an accessible modal. */
export function CertificatePreview({
  title,
  issuer,
  imageUrl,
  alt,
  enlargeLabel,
}: {
  title: string;
  issuer: string;
  imageUrl: string;
  alt: string;
  enlargeLabel: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        className="group relative block aspect-[10/7] w-full cursor-zoom-in overflow-hidden bg-muted/60 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-inset"
        aria-label={enlargeLabel}
      >
        <SmartImage src={imageUrl} alt={alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]" />
        <span className="glass absolute right-3 bottom-3 grid size-8 place-items-center rounded-full border opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="size-3.5" aria-hidden="true" />
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{issuer}</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-[10/7] w-full overflow-hidden rounded-xl bg-muted">
          <SmartImage src={imageUrl} alt={alt} fill sizes="768px" className="object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
