"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SmartImage } from "@/components/shared/smart-image";

export type GalleryItem = {
  id: string;
  url: string;
  alt: string;
  altLang?: string;
  caption: string | null;
  captionLang?: string;
  width: number | null;
  height: number | null;
};

/**
 * Masonry-style gallery (CSS columns) with a keyboard-navigable lightbox.
 * Images keep their aspect ratio when dimensions are known, avoiding layout shift.
 */
export function GalleryGrid({
  images,
  labels,
  variant = "masonry",
}: {
  images: GalleryItem[];
  labels: { open: string; counter: string; hint: string; previous: string; next: string };
  variant?: "masonry" | "grid";
}) {
  const [active, setActive] = useState<number | null>(null);
  const current = active === null ? null : images[active];
  const step = (delta: number) => setActive((i) => (i === null ? null : (i + delta + images.length) % images.length));

  return (
    <>
      <ul className={variant === "masonry" ? "columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
        {images.map((image, index) => (
          <li key={image.id}>
            <figure>
              <button
                type="button"
                onClick={() => setActive(index)}
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                style={{ aspectRatio: variant === "grid" ? "4 / 3" : image.width && image.height ? `${image.width} / ${image.height}` : "4 / 3" }}
                aria-label={labels.open.replace("{alt}", image.alt)}
              >
                <SmartImage
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </button>
              {image.caption && (
                <figcaption lang={image.captionLang} className="mt-2 text-sm text-muted-foreground">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent
          className="max-w-5xl p-3 sm:p-4"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") step(1);
            if (event.key === "ArrowLeft") step(-1);
          }}
        >
          <DialogTitle className="sr-only" lang={current?.altLang}>
            {current?.alt}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {labels.counter.replace("{current}", String((active ?? 0) + 1)).replace("{total}", String(images.length))}. {labels.hint}
          </DialogDescription>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted sm:aspect-[16/10]">
            <AnimatePresence mode="wait" initial={false}>
              {current && (
                <m.div key={current.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <SmartImage src={current.url} alt={current.alt} fill sizes="1024px" className="object-contain" />
                </m.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between gap-4 px-1">
            <p className="min-w-0 text-sm text-muted-foreground" lang={current?.caption ? current.captionLang : current?.altLang}>
              {current?.caption ?? current?.alt}
            </p>
            {images.length > 1 && (
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {(active ?? 0) + 1}/{images.length}
                </span>
                <Button variant="outline" size="icon-sm" onClick={() => step(-1)} aria-label={labels.previous}>
                  <ChevronLeft />
                </Button>
                <Button variant="outline" size="icon-sm" onClick={() => step(1)} aria-label={labels.next}>
                  <ChevronRight />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
