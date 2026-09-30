"use client";

import * as m from "motion/react-m";

export function ProficiencyBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="meter"
      aria-label={`${label} proficiency`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="h-1 overflow-hidden rounded-full bg-muted"
    >
      <m.div
        className="h-full origin-left rounded-full bg-gradient-to-r from-brand to-brand-2"
        style={{ width: `${value}%` }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
