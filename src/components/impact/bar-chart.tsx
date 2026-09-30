"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export type BarDatum = { id: string; label: string; labelLang?: string; value: number; display: string; detail?: string };

/**
 * Single-series horizontal bar chart (one hue, no legend — the title names it).
 * Marks: ≤20px bars, square at the baseline, 4px rounded data-end, value at the
 * tip in text color, hairline baseline. Each row is the hover/focus target and
 * shows a tooltip; a table view carries the same data for assistive tech.
 */
export function BarChart({
  title,
  data,
  tableLabel,
  valueHeader,
  labelHeader,
}: {
  title: string;
  data: BarDatum[];
  tableLabel: string;
  valueHeader: string;
  labelHeader: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const id = useId();
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <figure className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
      <figcaption id={`${id}-title`} className="text-sm font-semibold">
        {title}
      </figcaption>
      <div role="list" aria-labelledby={`${id}-title`} className="mt-5 grid gap-3">
        {data.map((d, index) => {
          const pct = Math.max(2, (d.value / max) * 100);
          const isActive = active === d.id;
          return (
            <div
              key={d.id}
              role="listitem"
              tabIndex={0}
              onMouseEnter={() => setActive(d.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(d.id)}
              onBlur={() => setActive(null)}
              aria-label={`${d.label}: ${d.display}${d.detail ? ` (${d.detail})` : ""}`}
              className="group relative grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 rounded-lg py-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:grid-cols-[minmax(0,12rem)_1fr]"
            >
              <span lang={d.labelLang} className="truncate text-sm text-muted-foreground" title={d.label}>
                {d.label}
              </span>
              <div className="flex min-w-0 items-center gap-2 border-l border-border">
                {/* Bars use 80% of the track so the value always fits at the tip. */}
                <div
                  className={cn("animate-bar h-5 shrink-0 rounded-r-[4px] bg-brand transition-opacity", active && !isActive && "opacity-40")}
                  style={{ width: `${pct * 0.8}%`, "--i": index } as React.CSSProperties}
                />
                <span className="shrink-0 text-sm font-medium tabular-nums">{d.display}</span>
              </div>
              {isActive && d.detail && (
                <div role="tooltip" className="pointer-events-none absolute top-full left-1/3 z-10 mt-1 rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lift">
                  <span className="font-medium">{d.label}</span>
                  <span className="text-muted-foreground"> · {d.display}</span>
                  <span className="block text-muted-foreground">{d.detail}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <details className="mt-5 text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">{tableLabel}</summary>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2 font-medium">
                {labelHeader}
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                {valueHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id} className="border-b last:border-0">
                <td lang={d.labelLang} className="py-2">
                  {d.label}
                  {d.detail && <span className="block text-xs text-muted-foreground">{d.detail}</span>}
                </td>
                <td className="py-2 text-right tabular-nums">{d.display}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
