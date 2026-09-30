"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, FileText, ImageIcon, LoaderCircle, Lock, Search, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFieldDefault, useFieldError } from "@/components/admin/entity-form";
import { cn } from "@/lib/utils";

export type MediaItem = {
  id: string;
  url: string;
  previewUrl?: string;
  filename: string;
  mimeType: string;
  visibility: "PUBLIC" | "PRIVATE";
  altEn?: string | null;
};

type Kind = "image" | "document" | "any";

const ACCEPT: Record<Kind, string> = {
  image: "image/png,image/jpeg,image/webp,image/avif,image/gif",
  document: "application/pdf,image/png,image/jpeg,image/webp",
  any: "image/png,image/jpeg,image/webp,image/avif,image/gif,application/pdf",
};

async function imageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return {};
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return {};
  }
}

/** Uploads through the authenticated endpoint; returns the created media. */
export async function uploadMedia(file: File, visibility: "PUBLIC" | "PRIVATE"): Promise<MediaItem> {
  const body = new FormData();
  body.set("file", file);
  body.set("visibility", visibility);
  const { width, height } = await imageSize(file);
  if (width) body.set("width", String(width));
  if (height) body.set("height", String(height));
  const response = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await response.json().catch(() => ({}))) as MediaItem & { error?: string };
  if (!response.ok || !data.id) throw new Error(data.error ?? "Upload failed");
  return data;
}

export function Thumb({ media, className }: { media: MediaItem; className?: string }) {
  const src = media.previewUrl ?? media.url;
  return (
    <div className={cn("relative grid place-items-center overflow-hidden rounded-lg border bg-muted", className)}>
      {media.mimeType.startsWith("image/") ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary uploads (incl. private)
        <img src={src} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        <FileText className="size-6 text-muted-foreground" aria-hidden="true" />
      )}
      {media.visibility === "PRIVATE" && (
        <span className="absolute top-1 left-1 grid size-5 place-items-center rounded bg-background/90" title="Private">
          <Lock className="size-3" aria-label="Private file" />
        </span>
      )}
    </div>
  );
}

/** Library browser + uploader dialog. */
function MediaLibraryDialog({
  open,
  onOpenChange,
  kind,
  visibility,
  multiple,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: Kind;
  visibility: "PUBLIC" | "PRIVATE";
  multiple?: boolean;
  onSelect: (items: MediaItem[]) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ kind: kind === "any" ? "" : kind, visibility, q: query });
    const response = await fetch(`/api/admin/media?${params}`).catch(() => null);
    const data = (await response?.json().catch(() => null)) as { items?: MediaItem[] } | null;
    setItems(data?.items ?? []);
    setLoading(false);
  }, [kind, visibility, query]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(load, 200);
    return () => window.clearTimeout(timer);
  }, [open, load]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: MediaItem[] = [];
      for (const file of Array.from(files).slice(0, multiple ? 30 : 1)) uploaded.push(await uploadMedia(file, visibility));
      toast.success(`${uploaded.length} file${uploaded.length === 1 ? "" : "s"} uploaded`);
      if (multiple) {
        setItems((current) => [...uploaded, ...current]);
        setSelected((current) => [...current, ...uploaded]);
      } else {
        onSelect(uploaded);
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toggle = (item: MediaItem) => {
    if (!multiple) {
      onSelect([item]);
      onOpenChange(false);
      return;
    }
    setSelected((current) => (current.some((c) => c.id === item.id) ? current.filter((c) => c.id !== item.id) : [...current, item]));
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { onOpenChange(value); if (!value) setSelected([]); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{visibility === "PRIVATE" ? "Private files" : "Media library"}</DialogTitle>
          <DialogDescription>
            {visibility === "PRIVATE"
              ? "Private files (e.g. un-redacted originals) are never shown on the public site."
              : "Choose an existing file or upload a new one."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by file name or alt text" className="pl-9" aria-label="Search media" />
          </div>
          <input ref={fileRef} type="file" className="sr-only" tabIndex={-1} aria-hidden="true" multiple={multiple} accept={ACCEPT[kind]} onChange={(e) => onFiles(e.target.files)} />
          <Button type="button" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
            {uploading ? "Uploading…" : visibility === "PRIVATE" ? "Upload private file" : "Upload"}
          </Button>
        </div>
        <div className="max-h-[50dvh] min-h-48 overflow-y-auto">
          {loading ? (
            <div className="grid h-48 place-items-center text-muted-foreground">
              <LoaderCircle className="animate-spin" aria-label="Loading" />
            </div>
          ) : items.length === 0 ? (
            <p className="grid h-48 place-items-center text-sm text-muted-foreground">No files yet — upload one.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((item) => {
                const isSelected = selected.some((s) => s.id === item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      aria-pressed={multiple ? isSelected : undefined}
                      className={cn(
                        "group relative block w-full cursor-pointer rounded-xl p-1 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                        isSelected && "bg-brand-soft ring-2 ring-brand",
                      )}
                    >
                      <Thumb media={item} className="aspect-square" />
                      <span className="mt-1 block truncate text-[11px] text-muted-foreground">{item.filename}</span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-brand text-brand-foreground">
                          <Check className="size-3" aria-hidden="true" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {multiple && (
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <span className="text-sm text-muted-foreground">{selected.length} selected</span>
            <Button type="button" disabled={!selected.length} onClick={() => { onSelect(selected); setSelected([]); onOpenChange(false); }}>
              Add selected
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Single media field: submits the media id under `name`. */
export function MediaPicker({
  name,
  label,
  description,
  initial,
  kind = "image",
  visibility = "PUBLIC",
  required,
}: {
  name: string;
  label: string;
  description?: string;
  initial?: MediaItem | null;
  kind?: Kind;
  visibility?: "PUBLIC" | "PRIVATE";
  required?: boolean;
}) {
  const id = useId();
  const errors = useFieldError(name);
  const [media, setMedia] = useState<MediaItem | null>(initial ?? null);
  const [open, setOpen] = useState(false);
  const error = errors?.[0];

  return (
    <div className="grid min-w-0 gap-2">
      <span id={`${id}-label`} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive" aria-hidden="true">*</span>}
        {visibility === "PRIVATE" && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Lock className="size-3" aria-hidden="true" /> Private
          </span>
        )}
      </span>
      <div className={cn("flex min-w-0 items-center gap-3 rounded-xl border bg-background/50 p-2.5", error && "border-destructive")}>
        {media ? <Thumb media={media} className="size-14 shrink-0" /> : (
          <div className="grid size-14 shrink-0 place-items-center rounded-lg border border-dashed text-muted-foreground">
            {kind === "document" ? <FileText className="size-5" aria-hidden="true" /> : <ImageIcon className="size-5" aria-hidden="true" />}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{media ? media.filename : <span className="text-muted-foreground">Nothing selected</span>}</p>
          {media?.altEn && <p className="truncate text-xs text-muted-foreground">Alt: {media.altEn}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} aria-describedby={`${id}-label`}>
            {media ? "Change" : "Choose"}
          </Button>
          {media && (
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setMedia(null)} aria-label={`Remove ${label}`}>
              <X />
            </Button>
          )}
        </div>
      </div>
      <input type="hidden" name={name} value={media?.id ?? ""} />
      {(error || description) && <p className={cn("text-xs", error ? "font-medium text-destructive" : "text-muted-foreground")}>{error ?? description}</p>}
      <MediaLibraryDialog open={open} onOpenChange={setOpen} kind={kind} visibility={visibility} onSelect={(items) => setMedia(items[0] ?? null)} />
    </div>
  );
}

/** Ordered multi-image field (gallery albums). Submits a JSON id list. */
export function MediaListPicker({ name, label, initial = [] }: { name: string; label: string; initial?: MediaItem[] }) {
  const errors = useFieldError(name);
  const [items, setItems] = useState<MediaItem[]>(initial);
  const [open, setOpen] = useState(false);
  const move = (from: number, to: number) =>
    setItems((list) => {
      if (to < 0 || to >= list.length) return list;
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">
          {label} <span className="font-normal text-muted-foreground">({items.length})</span>
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <ImageIcon aria-hidden="true" /> Add photos
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No photos yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item, index) => (
            <li key={item.id} className="rounded-xl border bg-card p-1.5">
              <Thumb media={item} className="aspect-square" />
              <div className="mt-1 flex items-center justify-between">
                <span className="truncate text-[11px] text-muted-foreground">{index + 1}</span>
                <div className="flex">
                  <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move photo ${index + 1} earlier`}>
                    <ArrowUp />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={index === items.length - 1} onClick={() => move(index, index + 1)} aria-label={`Move photo ${index + 1} later`}>
                    <ArrowDown />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => setItems((list) => list.filter((i) => i.id !== item.id))} aria-label={`Remove photo ${index + 1}`}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">Captions and alt text (English & Tamil) are edited once per photo in the Media library.</p>
      {errors?.[0] && <p className="text-xs font-medium text-destructive">{errors[0]}</p>}
      <input type="hidden" name={name} value={JSON.stringify(items.map((i) => i.id))} />
      <MediaLibraryDialog
        open={open}
        onOpenChange={setOpen}
        kind="image"
        visibility="PUBLIC"
        multiple
        onSelect={(picked) => setItems((list) => [...list, ...picked.filter((p) => !list.some((l) => l.id === p.id))])}
      />
    </div>
  );
}

export type RelationOption = { value: string; label: string; hint?: string };

/**
 * Reusable multi-relation selector (evidence links). Searchable checklist that
 * submits a JSON id list under `name`.
 */
export function RelationPicker({
  name,
  label,
  description,
  options,
  initial = [],
}: {
  name: string;
  label: string;
  description?: string;
  options: RelationOption[];
  initial?: string[];
}) {
  const id = useId();
  const echoed = useFieldDefault(name, JSON.stringify(initial));
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(echoed) as unknown;
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : initial;
    } catch {
      return initial;
    }
  });
  const [query, setQuery] = useState("");
  const errors = useFieldError(name);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);
  const chosen = options.filter((o) => selected.includes(o.value));

  return (
    <fieldset className="grid gap-2">
      <legend id={`${id}-legend`} className="mb-2 text-sm font-medium">
        {label} <span className="font-normal text-muted-foreground">({selected.length})</span>
      </legend>
      {chosen.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {chosen.map((o) => (
            <li key={o.value} className="inline-flex items-center gap-1 rounded-lg bg-secondary py-0.5 pr-1 pl-2 text-xs font-medium">
              <Check className="size-3 text-success" aria-hidden="true" /> {o.label}
              <button type="button" onClick={() => setSelected((s) => s.filter((v) => v !== o.value))} className="grid size-4 cursor-pointer place-items-center rounded hover:bg-background" aria-label={`Remove ${o.label}`}>
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {options.length > 6 && (
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter…" aria-label={`Filter ${label}`} className="h-9" />
      )}
      <div className="max-h-52 overflow-y-auto rounded-xl border bg-background/50 p-1" role="group" aria-labelledby={`${id}-legend`}>
        {filtered.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">No items available.</p>
        ) : (
          filtered.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <label key={o.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-accent">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setSelected((s) => (checked ? s.filter((v) => v !== o.value) : [...s, o.value]))}
                  className="size-4 accent-[var(--brand)]"
                />
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {o.hint && <span className="shrink-0 text-xs text-muted-foreground">{o.hint}</span>}
              </label>
            );
          })
        )}
      </div>
      {(errors?.[0] || description) && <p className={cn("text-xs", errors?.[0] ? "font-medium text-destructive" : "text-muted-foreground")}>{errors?.[0] ?? description}</p>}
      <input type="hidden" name={name} value={JSON.stringify(selected)} />
    </fieldset>
  );
}
