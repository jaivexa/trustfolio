"use client";

import { Children, useDeferredValue, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { Search, SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export type FilterMeta = {
  key: string;
  /** Category/group values the item belongs to. */
  groups: string[];
  year?: number | null;
  /** Lower-cased searchable text in both languages. */
  text: string;
};

export type FilterOption = { value: string; label: string };

export type FilterLabels = {
  all: string;
  filterBy: string;
  search: string;
  searchPlaceholder: string;
  results: string;
  noMatches: string;
  noMatchesHint: string;
  clear: string;
  showMore: string;
  year: string;
  allYears: string;
};

/**
 * Client-side filtering over server-rendered cards (passed as children in the
 * same order as `items`). Initial HTML contains every card for SEO and no-JS;
 * filters are restored from, and written to, the URL without a reload.
 */
export function FilterShell({
  items,
  groups = [],
  years = [],
  labels,
  pageSize = 12,
  searchable = true,
  gridClassName = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
  children,
}: {
  items: FilterMeta[];
  groups?: FilterOption[];
  years?: number[];
  labels: FilterLabels;
  pageSize?: number;
  searchable?: boolean;
  gridClassName?: string;
  children: React.ReactNode;
}) {
  const cards = Children.toArray(children);
  const [group, setGroup] = useState("all");
  const [year, setYear] = useState("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(pageSize);
  const deferredQuery = useDeferredValue(query);

  // Restore filters from the URL after hydration (keeps the page static).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get("category");
    const y = params.get("year");
    const q = params.get("q");
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from the URL */
    if (g && groups.some((o) => o.value === g)) setGroup(g);
    if (y && years.includes(Number(y))) setYear(y);
    if (q) setQuery(q);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [groups, years]);

  const update = (next: { group?: string; year?: string; query?: string }) => {
    const g = next.group ?? group;
    const y = next.year ?? year;
    const q = next.query ?? query;
    setGroup(g);
    setYear(y);
    setQuery(q);
    setLimit(pageSize);
    const params = new URLSearchParams();
    if (g !== "all") params.set("category", g);
    if (y !== "all") params.set("year", y);
    if (q.trim()) params.set("q", q.trim());
    const search = params.toString();
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  };

  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (group !== "all" && !item.groups.includes(group)) return false;
        if (year !== "all" && String(item.year ?? "") !== year) return false;
        if (needle && !item.text.includes(needle)) return false;
        return true;
      });
  }, [items, group, year, deferredQuery]);

  const shown = visible.slice(0, limit);
  const filtered = group !== "all" || year !== "all" || Boolean(query.trim());

  return (
    <div>
      {(groups.length > 1 || years.length > 1 || searchable) && (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {groups.length > 1 ? (
            <div role="group" aria-label={labels.filterBy} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {[{ value: "all", label: labels.all }, ...groups].map((option) => {
                const active = option.value === group;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ group: option.value })}
                    className={cn(
                      "relative shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                      active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {active && (
                      <m.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                    )}
                    <span className="relative">{option.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <span />
          )}
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            {years.length > 1 && (
              <label className="relative">
                <span className="sr-only">{labels.year}</span>
                <select
                  value={year}
                  onChange={(event) => update({ year: event.target.value })}
                  className="h-10 w-full cursor-pointer appearance-none rounded-full border border-input bg-background/60 px-4 pr-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 sm:w-40"
                >
                  <option value="all">{labels.allYears}</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-muted-foreground">
                  ▾
                </span>
              </label>
            )}
            {searchable && (
              <div className="relative w-full lg:w-72">
                <label htmlFor="filter-search" className="sr-only">
                  {labels.search}
                </label>
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="filter-search"
                  type="search"
                  value={query}
                  onChange={(event) => update({ query: event.target.value })}
                  placeholder={labels.searchPlaceholder}
                  className="rounded-full pr-10 pl-10"
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => update({ query: "" })}
                    className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label={labels.clear}
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {filtered ? labels.results.replace("{count}", String(visible.length)) : ""}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={labels.noMatches}
          description={labels.noMatchesHint}
          action={
            <Button variant="outline" size="sm" onClick={() => update({ group: "all", year: "all", query: "" })}>
              {labels.clear}
            </Button>
          }
        />
      ) : (
        <>
          <m.ul layout className={gridClassName}>
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map(({ item, index }) => (
                <m.li
                  key={item.key}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {cards[index]}
                </m.li>
              ))}
            </AnimatePresence>
          </m.ul>
          {visible.length > limit && (
            <div className="mt-10 text-center">
              <Button variant="outline" onClick={() => setLimit((value) => value + pageSize)}>
                {labels.showMore}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
