"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFieldDefault, useFieldError } from "@/components/admin/entity-form";
import { NAV_KEYS, SOCIAL_PLATFORMS, type NavKey, type SocialPlatform } from "@/lib/constants";
import { cn } from "@/lib/utils";

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

// ─── Social links ───────────────────────────────────────────────────────────

type Social = { platform: SocialPlatform; label: string; url: string; isVisible: boolean };

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  website: "Website",
  email: "Email",
};

const PLATFORM_PLACEHOLDER: Partial<Record<SocialPlatform, string>> = {
  email: "mailto:office@example.org",
  whatsapp: "https://wa.me/<official number>",
};

export function SocialLinksEditor({ name = "links", defaultValue = [] }: { name?: string; defaultValue?: Social[] }) {
  const initial = useFieldDefault(name, JSON.stringify(defaultValue));
  const [rows, setRows] = useState(() => parseJson<Social[]>(initial, []).map(withKey));
  const update = (index: number, patch: Partial<Social>) => setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const unused = SOCIAL_PLATFORMS.filter((p) => !rows.some((r) => r.platform === p));

  return (
    <div className="grid gap-3">
      {rows.length === 0 && <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">No social links yet. Only add official accounts of the trust.</p>}
      {rows.map((row, index) => (
        <div key={row._key} className="grid gap-2 rounded-xl border bg-background/50 p-3 lg:grid-cols-[10rem_9rem_1fr_auto] lg:items-center">
          <Select value={row.platform} onValueChange={(value) => update(index, { platform: value as SocialPlatform, label: PLATFORM_LABELS[value as SocialPlatform] })}>
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
          <Input
            aria-label={`Link ${index + 1} URL`}
            value={row.url}
            onChange={(e) => update(index, { url: e.target.value })}
            placeholder={PLATFORM_PLACEHOLDER[row.platform] ?? "https://"}
          />
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
            setRows([...rows, withKey({ platform, label: PLATFORM_LABELS[platform], url: "", isVisible: true })]);
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

// ─── Public navigation ──────────────────────────────────────────────────────

type NavItem = { key: NavKey; visible: boolean };

/** Show, hide and reorder public menu items. Every page stays reachable by URL and search. */
export function NavigationEditor({
  name = "navigation",
  defaultValue,
  labels,
}: {
  name?: string;
  defaultValue: NavItem[];
  labels: Record<NavKey, { en: string; ta: string }>;
}) {
  const initial = useFieldDefault(name, JSON.stringify(defaultValue));
  const [items, setItems] = useState<NavItem[]>(() => {
    const saved = parseJson<NavItem[]>(initial, []).filter((i) => NAV_KEYS.includes(i.key));
    // Keys added after the navigation was saved are appended, hidden.
    const missing = NAV_KEYS.filter((key) => !saved.some((i) => i.key === key)).map((key) => ({ key, visible: false }));
    return [...saved, ...missing];
  });

  return (
    <div className="grid gap-2">
      <ol className="grid gap-1.5">
        {items.map((item, index) => (
          <li
            key={item.key}
            className={cn("flex items-center gap-3 rounded-xl border bg-background/50 px-3 py-2", !item.visible && "border-dashed opacity-70")}
          >
            <span className="w-5 text-right text-xs text-muted-foreground tabular-nums">{index + 1}</span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="font-medium">{labels[item.key].en}</span>
              <span lang="ta" className="ml-2 text-muted-foreground">
                {labels[item.key].ta}
              </span>
            </span>
            {item.visible ? <Eye className="size-4 text-success" aria-hidden="true" /> : <EyeOff className="size-4 text-muted-foreground" aria-hidden="true" />}
            <Switch
              checked={item.visible}
              onCheckedChange={(visible) => setItems(items.map((i) => (i.key === item.key ? { ...i, visible } : i)))}
              aria-label={`Show ${labels[item.key].en} in the menu`}
            />
            <ReorderButtons index={index} count={items.length} onMove={(to) => setItems(move(items, index, to))} label={labels[item.key].en} />
          </li>
        ))}
      </ol>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <EditorError name={name} />
    </div>
  );
}
