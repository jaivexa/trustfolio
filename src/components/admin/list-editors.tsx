"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, LoaderCircle, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFieldDefault, useFieldError } from "@/components/admin/entity-form";
import { uploadFile } from "@/components/admin/media-field";
import { SOCIAL_PLATFORMS } from "@/lib/constants";

function parseJson<T>(value: string, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

/** Stable client-side keys for editable rows. */
let keySeed = 0;
const withKey = <T,>(item: T) => ({ ...item, _key: `row-${++keySeed}` });
const withoutKey = <T extends { _key: string }>({ _key, ...rest }: T) => {
  void _key;
  return rest;
};

function ReorderButtons({ index, count, onMove, label }: { index: number; count: number; onMove: (to: number) => void; label: string }) {
  return (
    <div className="flex">
      <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${label} up`}>
        <ArrowUp />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${label} down`}>
        <ArrowDown />
      </Button>
    </div>
  );
}

function EditorError({ name }: { name: string }) {
  const error = useFieldError(name)?.[0];
  return error ? <p className="text-xs font-medium text-destructive">{error}</p> : null;
}

// ─── Project metrics ────────────────────────────────────────────────────────

type Metric = { label: string; value: string };

export function MetricsEditor({ name = "metrics", defaultValue = [] }: { name?: string; defaultValue?: Metric[] }) {
  const initial = useFieldDefault(name, JSON.stringify(defaultValue));
  const [rows, setRows] = useState(() => parseJson<Metric[]>(initial, []).map(withKey));
  const update = (index: number, patch: Partial<Metric>) =>
    setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <div className="grid gap-3">
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No metrics yet. Add results like “Conversion +18%”.</p>}
      {rows.map((row, index) => (
        <div key={row._key} className="flex flex-col gap-2 rounded-xl border bg-background/50 p-3 sm:flex-row sm:items-center">
          <Input aria-label={`Metric ${index + 1} value`} placeholder="Value (e.g. +18%)" value={row.value} onChange={(e) => update(index, { value: e.target.value })} className="sm:w-40" maxLength={40} />
          <Input aria-label={`Metric ${index + 1} label`} placeholder="Label (e.g. Checkout conversion)" value={row.label} onChange={(e) => update(index, { label: e.target.value })} maxLength={60} />
          <div className="flex shrink-0 justify-end">
            <ReorderButtons index={index} count={rows.length} onMove={(to) => setRows(move(rows, index, to))} label={`metric ${index + 1}`} />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setRows(rows.filter((_, i) => i !== index))} aria-label={`Remove metric ${index + 1}`}>
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
      <div>
        <Button type="button" variant="outline" size="sm" disabled={rows.length >= 8} onClick={() => setRows([...rows, withKey({ label: "", value: "" })])}>
          <Plus aria-hidden="true" /> Add metric
        </Button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(rows.map(withoutKey))} />
      <EditorError name={name} />
    </div>
  );
}

// ─── Project gallery ────────────────────────────────────────────────────────

type GalleryImage = { url: string; alt: string; caption?: string | null };

export function GalleryEditor({ name = "images", defaultValue = [] }: { name?: string; defaultValue?: GalleryImage[] }) {
  const initial = useFieldDefault(name, JSON.stringify(defaultValue));
  const [rows, setRows] = useState(() => parseJson<GalleryImage[]>(initial, []).map(withKey));
  const [uploading, setUploading] = useState(false);
  const update = (index: number, patch: Partial<GalleryImage>) =>
    setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: GalleryImage[] = [];
      for (const file of Array.from(files).slice(0, 20 - rows.length)) {
        uploaded.push({ url: await uploadFile(file, "projects"), alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), caption: "" });
      }
      setRows((current) => [...current, ...uploaded.map(withKey)]);
      toast.success(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-3">
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No gallery images yet.</p>}
      <ul className="grid gap-3">
        {rows.map((row, index) => (
          <li key={row._key} className="flex flex-col gap-3 rounded-xl border bg-background/50 p-3 sm:flex-row">
            <div className="aspect-video w-full shrink-0 overflow-hidden rounded-lg border bg-muted sm:w-40">
              {row.url && (
                // eslint-disable-next-line @next/next/no-img-element -- preview of arbitrary admin URL
                <img src={row.url} alt="" className="size-full object-cover" />
              )}
            </div>
            <div className="grid flex-1 gap-2">
              <Input aria-label={`Image ${index + 1} URL`} placeholder="Image URL" value={row.url} onChange={(e) => update(index, { url: e.target.value })} />
              <Input aria-label={`Image ${index + 1} alt text`} placeholder="Alt text (describe the image)" value={row.alt} onChange={(e) => update(index, { alt: e.target.value })} maxLength={200} />
              <Input aria-label={`Image ${index + 1} caption`} placeholder="Caption (optional)" value={row.caption ?? ""} onChange={(e) => update(index, { caption: e.target.value })} maxLength={300} />
            </div>
            <div className="flex shrink-0 justify-end sm:flex-col">
              <ReorderButtons index={index} count={rows.length} onMove={(to) => setRows(move(rows, index, to))} label={`image ${index + 1}`} />
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setRows(rows.filter((_, i) => i !== index))} aria-label={`Remove image ${index + 1}`}>
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
          <label className="cursor-pointer">
            {uploading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
            {uploading ? "Uploading…" : "Upload images"}
            <input type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif,image/gif" className="sr-only" onChange={(e) => onFiles(e.target.files)} disabled={uploading} />
          </label>
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={rows.length >= 20} onClick={() => setRows([...rows, withKey({ url: "", alt: "", caption: "" })])}>
          <Plus aria-hidden="true" /> Add by URL
        </Button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(rows.map(withoutKey))} />
      <EditorError name={name} />
    </div>
  );
}

// ─── Social links ───────────────────────────────────────────────────────────

type Social = { platform: string; label: string; url: string; isVisible: boolean };

const PLATFORM_LABELS: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  youtube: "YouTube",
  instagram: "Instagram",
  dribbble: "Dribbble",
  medium: "Medium",
  devto: "DEV",
  website: "Website",
  email: "Email",
};

export function SocialLinksEditor({ name = "links", defaultValue = [] }: { name?: string; defaultValue?: Social[] }) {
  const initial = useFieldDefault(name, JSON.stringify(defaultValue));
  const [rows, setRows] = useState(() => parseJson<Social[]>(initial, []).map(withKey));
  const update = (index: number, patch: Partial<Social>) =>
    setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const unused = SOCIAL_PLATFORMS.filter((p) => !rows.some((r) => r.platform === p));

  return (
    <div className="grid gap-3">
      {rows.map((row, index) => (
        <div key={row._key} className="grid gap-2 rounded-xl border bg-background/50 p-3 sm:grid-cols-[10rem_9rem_1fr_auto] sm:items-center">
          <Select value={row.platform} onValueChange={(platform) => update(index, { platform, label: PLATFORM_LABELS[platform] ?? platform })}>
            <SelectTrigger aria-label={`Link ${index + 1} platform`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOCIAL_PLATFORMS.filter((p) => p === row.platform || unused.includes(p)).map((p) => (
                <SelectItem key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input aria-label={`Link ${index + 1} label`} value={row.label} onChange={(e) => update(index, { label: e.target.value })} maxLength={40} />
          <Input aria-label={`Link ${index + 1} URL`} value={row.url} onChange={(e) => update(index, { url: e.target.value })} placeholder={row.platform === "email" ? "mailto:you@example.com" : "https://"} />
          <div className="flex items-center justify-end gap-1">
            <Label className="mr-1 text-xs font-normal text-muted-foreground">
              <Switch checked={row.isVisible} onCheckedChange={(isVisible) => update(index, { isVisible })} aria-label={`Show link ${index + 1}`} />
              Visible
            </Label>
            <ReorderButtons index={index} count={rows.length} onMove={(to) => setRows(move(rows, index, to))} label={`link ${index + 1}`} />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setRows(rows.filter((_, i) => i !== index))} aria-label={`Remove link ${index + 1}`}>
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={unused.length === 0}
          onClick={() => {
            const platform = unused[0]!;
            setRows([...rows, withKey({ platform, label: PLATFORM_LABELS[platform] ?? platform, url: "", isVisible: true })]);
          }}
        >
          <Plus aria-hidden="true" /> Add link
        </Button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(rows.map(withoutKey))} />
      <EditorError name={name} />
    </div>
  );
}
