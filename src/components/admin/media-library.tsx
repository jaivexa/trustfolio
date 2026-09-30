"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, FileText, ImageIcon, LoaderCircle, Lock, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BilingualField, BilingualHeader } from "@/components/admin/bilingual";
import { EntityForm } from "@/components/admin/entity-form";
import { Thumb, uploadMedia } from "@/components/admin/pickers";
import { DeleteButton } from "@/components/admin/row-actions";
import { DemoBadge } from "@/components/admin/demo-badge";
import { cn } from "@/lib/utils";
import { deleteMedia, updateMediaMeta } from "@/server/actions/admin/media";
import type { AdminMedia } from "@/server/queries/admin-media";

type Filter = "all" | "images" | "documents" | "private" | "missing-alt";
const PAGE = 48;

const size = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

export function MediaLibrary({ items }: { items: AdminMedia[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const input = useRef<HTMLInputElement>(null);
  const editing = items.find((m) => m.id === editingId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((m) => {
      if (filter === "images" && !m.mimeType.startsWith("image/")) return false;
      if (filter === "documents" && m.mimeType !== "application/pdf") return false;
      if (filter === "private" && m.visibility !== "PRIVATE") return false;
      if (filter === "missing-alt" && (!m.mimeType.startsWith("image/") || (m.altEn && m.altTa))) return false;
      return !q || [m.filename, m.altEn, m.altTa, m.captionEn, m.captionTa].some((v) => v?.toLowerCase().includes(q));
    });
  }, [items, filter, query]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      try {
        await uploadMedia(file, visibility);
        ok++;
      } catch (error) {
        toast.error(`${file.name}: ${error instanceof Error ? error.message : "Upload failed"}`);
      }
    }
    setUploading(false);
    if (input.current) input.current.value = "";
    if (ok) {
      toast.success(`Uploaded ${ok} file${ok === 1 ? "" : "s"}${visibility === "PRIVATE" ? " (private)" : ""}`);
      router.refresh();
    }
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "images", label: "Images" },
    { key: "documents", label: "PDFs" },
    { key: "private", label: "Private" },
    { key: "missing-alt", label: "Alt text missing" },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-soft sm:flex-row sm:items-center">
        <div className="flex-1 text-sm">
          <p className="font-medium">Upload files</p>
          <p className="text-muted-foreground">
            Images (PNG, JPEG, WebP, AVIF, GIF) and PDFs, up to the configured size limit. Private files are never served publicly — use them for original documents.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Upload visibility" className="flex rounded-full border p-0.5 text-xs">
            {(["PUBLIC", "PRIVATE"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={visibility === v}
                onClick={() => setVisibility(v)}
                className={cn("cursor-pointer rounded-full px-3 py-1.5", visibility === v ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
              >
                {v === "PUBLIC" ? "Public" : "Private"}
              </button>
            ))}
          </div>
          <Button asChild disabled={uploading}>
            <label className="cursor-pointer">
              {uploading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
              {uploading ? "Uploading…" : "Choose files"}
              <input
                ref={input}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/avif,image/gif,application/pdf"
                className="sr-only"
                onChange={(e) => onFiles(e.target.files)}
                disabled={uploading}
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter media" className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 text-sm transition-colors",
                filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files…" aria-label="Search media" className="pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">{items.length ? "Nothing matches." : "No files uploaded yet."}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {filtered.slice(0, limit).map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setEditingId(m.id)}
                className="group grid w-full cursor-pointer gap-1.5 rounded-xl border bg-card p-1.5 text-left transition-shadow hover:shadow-soft focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
              >
                <Thumb media={m} className="aspect-square" />
                <span className="truncate px-1 text-xs font-medium">{m.filename}</span>
                {m.isDemo && <DemoBadge className="mx-1 w-fit" />}
                <span className="flex items-center gap-1 px-1 pb-0.5 text-[11px] text-muted-foreground">
                  {m.mimeType === "application/pdf" ? <FileText className="size-3" aria-hidden="true" /> : <ImageIcon className="size-3" aria-hidden="true" />}
                  {size(m.size)}
                  {m.mimeType.startsWith("image/") && !(m.altEn && m.altTa) && <span className="ml-auto text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]">alt</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {filtered.length > limit && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setLimit((l) => l + PAGE)}>
            Show more ({filtered.length - limit})
          </Button>
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-h-[92dvh] max-w-3xl overflow-y-auto">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 break-all">
                  {editing.visibility === "PRIVATE" && <Lock className="size-4 shrink-0" aria-label="Private" />}
                  {editing.filename}
                </DialogTitle>
                <DialogDescription>
                  {editing.mimeType} · {size(editing.size)}
                  {editing.width && editing.height ? ` · ${editing.width}×${editing.height}` : ""} · uploaded {new Date(editing.createdAt).toLocaleDateString("en-IN")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 md:grid-cols-[14rem_1fr]">
                <div className="grid content-start gap-2">
                  <Thumb media={editing} className="aspect-square" />
                  {editing.isDemo && <DemoBadge className="w-fit" />}
                  <Badge variant={editing.visibility === "PRIVATE" ? "warning" : "outline"}>{editing.visibility === "PRIVATE" ? "Private — admins only" : "Public"}</Badge>
                  <div className="flex flex-wrap gap-1.5">
                    <Button asChild variant="outline" size="sm">
                      <a href={editing.previewUrl} target="_blank" rel="noreferrer">
                        Open <ExternalLink aria-hidden="true" />
                      </a>
                    </Button>
                    {editing.visibility === "PUBLIC" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          void navigator.clipboard.writeText(new URL(editing.url, window.location.origin).toString()).then(() => toast.success("Link copied"));
                        }}
                      >
                        <Copy aria-hidden="true" /> Copy link
                      </Button>
                    )}
                  </div>
                </div>
                <EntityForm key={editing.id} action={updateMediaMeta.bind(null, editing.id)} inline submitLabel="Save details">
                  <BilingualHeader />
                  <BilingualField name="alt" label="Alt text" maxLength={300} description="Describe the image for people using screen readers." defaultEn={editing.altEn} defaultTa={editing.altTa} />
                  <BilingualField name="caption" label="Caption" kind="textarea" rows={2} maxLength={500} defaultEn={editing.captionEn} defaultTa={editing.captionTa} />
                </EntityForm>
              </div>
              <div className="flex justify-start border-t pt-4">
                <DeleteButton
                  variant="button"
                  action={deleteMedia.bind(null, editing.id)}
                  itemName={`“${editing.filename}”`}
                  description="The file is deleted and removed from every page, album and document that uses it."
                  onDeleted={() => setEditingId(null)}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
