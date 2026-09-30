"use client";

import { useRef } from "react";
import { useScroll, useSpring } from "motion/react";
import * as m from "motion/react-m";

/** Vertical rail that fills as the timeline scrolls through the viewport. */
export function TimelineTrack({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <div ref={ref} className="relative">
      <div aria-hidden="true" className="absolute top-2 bottom-2 left-3 w-px bg-border sm:left-5">
        <m.div className="absolute inset-0 origin-top bg-gradient-to-b from-brand to-brand-2" style={{ scaleY }} />
      </div>
      {children}
    </div>
  );
}
