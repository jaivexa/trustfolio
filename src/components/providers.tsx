"use client";

import { ThemeProvider } from "next-themes";
import { LazyMotion, MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Motion features are code-split and loaded after hydration.
const loadMotionFeatures = () => import("@/components/motion/features").then((mod) => mod.default);

export function Providers({
  children,
  defaultTheme,
  notificationsLabel = "Notifications",
}: {
  children: React.ReactNode;
  defaultTheme: "light" | "dark" | "system";
  /** Accessible name of the toast region, in the page language. */
  notificationsLabel?: string;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
      storageKey="trustfolio-theme"
    >
      <LazyMotion features={loadMotionFeatures} strict>
        {/* Honors the OS "reduce motion" setting for every animation. */}
        <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 30 }}>
          <TooltipProvider>
            {children}
            <Toaster position="bottom-right" offset={{ bottom: "5rem", right: "1.5rem" }} mobileOffset={{ bottom: "5rem" }} richColors closeButton containerAriaLabel={notificationsLabel} />
          </TooltipProvider>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
