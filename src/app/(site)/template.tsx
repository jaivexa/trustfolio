"use client";

import { useEffect } from "react";
import * as m from "motion/react-m";

// The first render must not start hidden (it would delay LCP), so the
// transition only runs for client-side navigations after hydration.
let hasHydrated = false;

/** Subtle page transition: templates re-mount on every navigation. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hasHydrated = true;
  }, []);

  return (
    <m.div
      initial={hasHydrated ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
