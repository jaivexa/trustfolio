"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { BadgeCheck, ChevronLeft, ChevronRight, Pause, Play, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

export type CarouselItem = {
  id: string;
  quote: { text: string; lang?: string };
  name: { text: string; lang?: string };
  meta: string;
  date: string;
  dateLabel: string;
  photoUrl: string | null;
  verifiedLabel: string | null;
};

const AUTOPLAY_MS = 8000;

/**
 * Accessible carousel (WAI-ARIA APG): labelled slides, previous/next and dot
 * controls, arrow keys, pause on hover/focus and an explicit pause button.
 * No autoplay for users who prefer reduced motion.
 */
export function TestimonialCarousel({
  items,
  labels,
}: {
  items: CarouselItem[];
  labels: { region: string; slide: string; choose: string; show: string; pause: string; play: string; previous: string; next: string };
}) {
  const reduceMotion = useReducedMotion();
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const count = items.length;
  const autoplay = count > 1 && !reduceMotion && !paused && !hovered;

  const go = useCallback((delta: number) => setState(([current]) => [(current + delta + count) % count, delta]), [count]);

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(() => go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [autoplay, go, index]);

  const current = items[index]!;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.region}
      className="mx-auto max-w-3xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(1);
        if (event.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="relative overflow-hidden rounded-3xl border bg-card p-7 shadow-soft sm:p-12" aria-live={autoplay ? "off" : "polite"}>
        <Quote className="absolute top-6 right-6 size-14 text-gold/20" aria-hidden="true" />
        <AnimatePresence mode="wait" initial={false}>
          <m.figure
            key={current.id}
            role="group"
            aria-roledescription="slide"
            aria-label={labels.slide.replace("{current}", String(index + 1)).replace("{total}", String(count))}
            initial={{ opacity: 0, x: direction >= 0 ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -20 : 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <blockquote lang={current.quote.lang} className="font-display text-xl leading-relaxed sm:text-2xl">
              <p>&ldquo;{current.quote.text}&rdquo;</p>
            </blockquote>
            <figcaption className="mt-7 flex items-center gap-3.5">
              <Avatar className="size-11 border">
                {current.photoUrl && <AvatarImage src={current.photoUrl} alt="" />}
                <AvatarFallback className="bg-brand-soft text-brand">{initials(current.name.text)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-sm">
                <p lang={current.name.lang} className="font-semibold">
                  {current.name.text}
                </p>
                <p className="text-muted-foreground">
                  {current.meta}
                  {current.meta && <span aria-hidden="true"> · </span>}
                  <time dateTime={current.date}>{current.dateLabel}</time>
                </p>
                {current.verifiedLabel && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-success">
                    <BadgeCheck className="size-3.5" aria-hidden="true" /> {current.verifiedLabel}
                  </p>
                )}
              </div>
            </figcaption>
          </m.figure>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5" role="group" aria-label={labels.choose}>
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setState([i, i > index ? 1 : -1])}
                aria-label={labels.show.replace("{n}", String(i + 1))}
                aria-current={i === index ? "true" : undefined}
                className="group grid h-6 cursor-pointer place-items-center px-0.5"
              >
                <span className={cn("block h-1.5 rounded-full transition-all duration-300", i === index ? "w-6 bg-brand" : "w-1.5 bg-border group-hover:bg-muted-foreground")} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {!reduceMotion && (
              <Button variant="ghost" size="icon-sm" onClick={() => setPaused((v) => !v)} aria-label={paused ? labels.play : labels.pause}>
                {paused ? <Play /> : <Pause />}
              </Button>
            )}
            <Button variant="outline" size="icon-sm" onClick={() => go(-1)} aria-label={labels.previous}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => go(1)} aria-label={labels.next}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
