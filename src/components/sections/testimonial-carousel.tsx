"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { ChevronLeft, ChevronRight, Pause, Play, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatMonthYear, initials } from "@/lib/utils";
import type { TestimonialDTO } from "@/server/queries/types";

const AUTOPLAY_MS = 7000;

/**
 * Accessible carousel (WAI-ARIA APG pattern): labelled slides, previous/next
 * and dot controls, keyboard arrows, pause on hover/focus, and an explicit
 * pause button. Autoplay is disabled for users who prefer reduced motion.
 */
export function TestimonialCarousel({ testimonials }: { testimonials: TestimonialDTO[] }) {
  const reduceMotion = useReducedMotion();
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const count = testimonials.length;
  const autoplay = count > 1 && !reduceMotion && !paused && !hovered;

  const go = useCallback(
    (delta: number) => setState(([current]) => [(current + delta + count) % count, delta]),
    [count],
  );

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(() => go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [autoplay, go, index]);

  const current = testimonials[index]!;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
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
        <Quote className="absolute top-6 right-6 size-16 text-brand/10 sm:size-20" aria-hidden="true" />
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <m.figure
            key={current.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -24 : 24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="flex gap-0.5" role="img" aria-label={`Rated ${current.rating} out of 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn("size-4", i < current.rating ? "fill-warning text-warning" : "text-muted")}
                  aria-hidden="true"
                />
              ))}
            </div>
            <blockquote className="mt-5 text-lg leading-relaxed text-pretty sm:text-xl">
              <p>&ldquo;{current.content}&rdquo;</p>
            </blockquote>
            <figcaption className="mt-7 flex items-center gap-3.5">
              <Avatar className="size-11 border">
                {current.avatarUrl && <AvatarImage src={current.avatarUrl} alt="" />}
                <AvatarFallback className="bg-brand-soft text-brand">{initials(current.name)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-semibold">{current.name}</p>
                <p className="text-muted-foreground">
                  {[current.role, current.company].filter(Boolean).join(", ")}
                  <span aria-hidden="true"> · </span>
                  <time dateTime={current.date}>{formatMonthYear(current.date)}</time>
                </p>
              </div>
            </figcaption>
          </m.figure>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5" role="group" aria-label="Choose testimonial">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setState([i, i > index ? 1 : -1])}
                aria-label={`Show testimonial ${i + 1} from ${t.name}`}
                aria-current={i === index ? "true" : undefined}
                className="group grid h-6 cursor-pointer place-items-center px-0.5"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-6 bg-brand" : "w-1.5 bg-border group-hover:bg-muted-foreground",
                  )}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {!reduceMotion && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? "Resume automatic rotation" : "Pause automatic rotation"}
              >
                {paused ? <Play /> : <Pause />}
              </Button>
            )}
            <Button variant="outline" size="icon-sm" onClick={() => go(-1)} aria-label="Previous testimonial">
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => go(1)} aria-label="Next testimonial">
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
