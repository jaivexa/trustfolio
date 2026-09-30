"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, Archive, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, EyeOff, LoaderCircle, Pencil, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RESOURCES, STATUS_LABELS, type BulkOperation, type ResourceKey } from "@/lib/admin-resources";
import { cn } from "@/lib/utils";
import { bulkAction } from "@/server/actions/admin/bulk";
import { DemoBadge } from "@/components/admin/demo-badge";
import type { ResourceRow } from "@/server/queries/admin";

const PAGE_SIZE = 20;
type StatusFilter = "all" | ResourceRow["status"] | "untranslated" | "demo";

const STATUS_VARIANT = { PUBLISHED: "success", DRAFT: "secondary", ARCHIVED: "outline" } as const;

const WARNING_FLAGS = new Set(["No consent recorded", "No source cited", "No source", "Personal data — not redacted", "No public file", "No PDF attached"]);

export function StatusBadge({ status }: { status: ResourceRow["status"] }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function TranslationBadge({ missing }: { missing: string[] }) {
  return missing.length === 0 ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap text-success">
      <CheckCircle2 className="size-3.5" aria-hidden="true" /> Complete
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]"
      title={`Tamil missing: ${missing.join(", ")}`}
    >
      <AlertTriangle className="size-3.5" aria-hidden="true" /> Tamil missing ({missing.length})
    </span>
  );
}

/**
 * Generic admin list: search (English and Tamil), status / translation
 * filters, pagination and bulk publish / draft / archive / delete.
 */
export function ResourceTable({ resource, rows }: { resource: ResourceKey; rows: ResourceRow[] }) {
  const config = RESOURCES[resource];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      all: rows.length,
      PUBLISHED: rows.filter((r) => r.status === "PUBLISHED").length,
      DRAFT: rows.filter((r) => r.status === "DRAFT").length,
      ARCHIVED: rows.filter((r) => r.status === "ARCHIVED").length,
      untranslated: rows.filter((r) => r.missing.length > 0).length,
      demo: rows.filter((r) => r.isDemo).length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return rows.filter((r) => {
      if (filter === "untranslated" ? r.missing.length === 0 : filter === "demo" ? !r.isDemo : filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return [r.title, r.titleTa, r.subtitle].some((v) => v?.toLocaleLowerCase().includes(q));
    });
  }, [rows, query, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const selectedIds = [...selected].filter((id) => rows.some((r) => r.id === id));
  const allVisibleSelected = visible.length > 0 && visible.every((r) => selected.has(r.id));

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleVisible = () =>
    setSelected((s) => {
      const next = new Set(s);
      for (const r of visible) {
        if (allVisibleSelected) next.delete(r.id);
        else next.add(r.id);
      }
      return next;
    });

  const run = (op: BulkOperation) =>
    startTransition(async () => {
      const result = await bulkAction(resource, selectedIds, op);
      if (result.status === "success") {
        toast.success(result.message ?? "Done");
        setSelected(new Set());
      } else {
        toast.error(result.message ?? "Something went wrong");
      }
      setConfirmDelete(false);
    });

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "PUBLISHED", label: "Published" },
    { key: "DRAFT", label: "Drafts" },
    { key: "ARCHIVED", label: "Archived" },
    { key: "untranslated", label: "Tamil missing" },
    ...(counts.demo > 0 ? [{ key: "demo" as const, label: "Demo data" }] : []),
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(0);
              }}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {f.label}
              <span className="text-xs tabular-nums opacity-70">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search English or Tamil…"
            aria-label={`Search ${config.label.toLowerCase()}`}
            className="pl-9"
          />
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div role="region" aria-label="Bulk actions" className="flex flex-wrap items-center gap-2 rounded-xl border bg-brand-soft px-3 py-2 text-sm">
          <span className="mr-auto font-medium">{selectedIds.length} selected</span>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run("publish")}>
            <Send aria-hidden="true" /> Publish
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run("draft")}>
            <EyeOff aria-hidden="true" /> Move to draft
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run("archive")}>
            <Archive aria-hidden="true" /> Archive
          </Button>
          <Button size="sm" variant="outline" disabled={pending} className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 aria-hidden="true" /> Delete
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setSelected(new Set())}>
            Clear
          </Button>
          {pending && <LoaderCircle className="size-4 animate-spin" aria-label="Working" />}
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-soft">
        {visible.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            {rows.length === 0 ? `No ${config.label.toLowerCase()} yet.` : "Nothing matches these filters."}
          </p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">{config.label}</caption>
              <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="w-10 px-4 py-3">
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} aria-label="Select all on this page" className="size-4 accent-[var(--brand)]" />
                  </th>
                  <th scope="col" className="px-2 py-3 font-medium">
                    {config.singular}
                  </th>
                  <th scope="col" className="hidden px-3 py-3 font-medium md:table-cell">
                    Translation
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="hidden px-3 py-3 font-medium lg:table-cell">
                    Updated
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visible.map((row) => (
                  <tr key={row.id} className={cn("transition-colors hover:bg-muted/30", selected.has(row.id) && "bg-brand-soft/60")}>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggle(row.id)}
                        aria-label={`Select ${row.title}`}
                        className="mt-1 size-4 accent-[var(--brand)]"
                      />
                    </td>
                    <td className="max-w-[28rem] px-2 py-3">
                      <div className="flex items-start gap-3">
                        {row.thumbUrl && (
                          // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                          <img src={row.thumbUrl} alt="" className="size-10 shrink-0 rounded-lg border object-cover" loading="lazy" />
                        )}
                        <div className="min-w-0">
                          <Link prefetch={false} href={`${config.href}/${row.id}`} className="font-medium hover:underline">
                            {row.title}
                          </Link>
                          {row.isDemo && <DemoBadge className="ml-2" />}
                          {row.titleTa && (
                            <p lang="ta" className="truncate text-xs text-muted-foreground">
                              {row.titleTa}
                            </p>
                          )}
                          {row.subtitle && <p className="truncate text-xs text-muted-foreground">{row.subtitle}</p>}
                          {row.flags.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {row.flags.map((flag) => (
                                <Badge key={flag} variant={WARNING_FLAGS.has(flag) ? "warning" : "outline"} className="px-2 text-[11px]">
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="mt-1 md:hidden">
                            <TranslationBadge missing={row.missing} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 align-top md:table-cell">
                      <TranslationBadge missing={row.missing} />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="hidden px-3 py-3 align-top text-xs whitespace-nowrap text-muted-foreground lg:table-cell">
                      {new Date(row.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex justify-end gap-0.5">
                        {row.publicHref && row.status === "PUBLISHED" && (
                          <Button asChild variant="ghost" size="icon-sm">
                            <a href={`/en${row.publicHref}`} target="_blank" rel="noreferrer" aria-label={`View ${row.title} on the website`}>
                              <ExternalLink />
                            </a>
                          </Button>
                        )}
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link prefetch={false} href={`${config.href}/${row.id}`} aria-label={`Edit ${row.title}`}>
                            <Pencil />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {current * PAGE_SIZE + 1}–{Math.min(filtered.length, (current + 1) * PAGE_SIZE)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>
              <ChevronLeft aria-hidden="true" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>
              Next <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </nav>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.length} {selectedIds.length === 1 ? config.singular.toLowerCase() : config.label.toLowerCase()}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the records. Uploaded files stay in the Media library. Consider archiving instead to keep an audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                run("delete");
              }}
            >
              {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
