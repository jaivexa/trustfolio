"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SmartImage } from "@/components/shared/smart-image";
import type { ProjectImageDTO } from "@/server/queries/types";

/** Responsive gallery grid with a keyboard-navigable lightbox. */
export function ProjectGallery({ images }: { images: ProjectImageDTO[] }) {
  const [active, setActive] = useState<number | null>(null);
  const current = active === null ? null : images[active];
  const step = (delta: number) =>
    setActive((index) => (index === null ? null : (index + delta + images.length) % images.length));

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <li key={image.id}>
            <figure>
              <button
                type="button"
                onClick={() => setActive(index)}
                className="group relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-2xl border bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                aria-label={`Open image: ${image.alt}`}
              >
                <SmartImage
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </button>
              {image.caption && <figcaption className="mt-2 text-sm text-muted-foreground">{image.caption}</figcaption>}
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
          <DialogTitle className="sr-only">{current?.alt ?? "Image"}</DialogTitle>
          <DialogDescription className="sr-only">
            Image {active === null ? 0 : active + 1} of {images.length}. Use the arrow keys to navigate.
          </DialogDescription>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
            <AnimatePresence mode="wait" initial={false}>
              {current && (
                <m.div
                  key={current.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SmartImage src={current.url} alt={current.alt} fill sizes="1024px" className="object-contain" />
                </m.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between gap-4 px-1">
            <p className="text-sm text-muted-foreground">{current?.caption ?? current?.alt}</p>
            {images.length > 1 && (
              <div className="flex shrink-0 gap-1.5">
                <Button variant="outline" size="icon-sm" onClick={() => step(-1)} aria-label="Previous image">
                  <ChevronLeft />
                </Button>
                <Button variant="outline" size="icon-sm" onClick={() => step(1)} aria-label="Next image">
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
