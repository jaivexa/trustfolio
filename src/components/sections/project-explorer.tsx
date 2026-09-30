"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { Search, SearchX, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectCard } from "@/components/sections/project-card";
import { cn } from "@/lib/utils";
import type { ProjectCardDTO } from "@/server/queries/types";

const ALL = "All";

/** Keeps filters shareable without triggering a server round-trip. */
function syncUrl(query: string, category: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category !== ALL) params.set("category", category);
  const search = params.toString();
  window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
}

export function ProjectExplorer({ projects }: { projects: ProjectCardDTO[] }) {
  const searchParams = useSearchParams();
  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(projects.map((p) => p.category))).sort()],
    [projects],
  );
  const initialCategory = searchParams.get("category");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(
    initialCategory && categories.includes(initialCategory) ? initialCategory : ALL,
  );
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return projects.filter((project) => {
      if (category !== ALL && project.category !== category) return false;
      if (!needle) return true;
      return [project.title, project.summary, project.category, project.clientName ?? "", ...project.technologies]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [projects, category, deferredQuery]);

  const update = (nextQuery: string, nextCategory: string) => {
    setQuery(nextQuery);
    setCategory(nextCategory);
    syncUrl(nextQuery.trim(), nextCategory);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by category" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {categories.map((item) => {
            const active = item === category;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => update(query, item)}
                className={cn(
                  "relative shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <m.span
                    layoutId="project-filter-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{item}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="project-search"
            type="search"
            value={query}
            onChange={(event) => update(event.target.value, category)}
            placeholder="Search by name, tech or client…"
            className="rounded-full pr-10 pl-10"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => update("", category)}
              className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {filtered.length === 1 ? "1 project found" : `${filtered.length} projects found`}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No projects match your filters"
          description="Try a different keyword or browse all categories."
          action={
            <Button variant="outline" size="sm" onClick={() => update("", ALL)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <m.ul layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((project, index) => (
              <m.li
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProjectCard project={project} priority={index < 3} headingLevel="h2" />
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      )}
    </div>
  );
}
