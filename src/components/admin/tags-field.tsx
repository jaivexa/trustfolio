"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useFieldDefault, useFieldError } from "@/components/admin/entity-form";
import { cn } from "@/lib/utils";

/** Chip input with suggestions. Submits a comma-separated list under `name`. */
export function TagsField({
  name,
  label,
  description,
  defaultValue = [],
  suggestions = [],
  max = 30,
}: {
  name: string;
  label: string;
  description?: string;
  defaultValue?: string[];
  suggestions?: string[];
  max?: number;
}) {
  const id = useId();
  const errors = useFieldError(name);
  const initial = useFieldDefault(name, defaultValue.join(", "));
  const [tags, setTags] = useState<string[]>(() =>
    initial
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  );
  const [draft, setDraft] = useState("");

  const add = (value: string) => {
    const tag = value.trim().replace(/,$/, "");
    if (!tag || tags.length >= max) return;
    if (!tags.some((t) => t.toLowerCase() === tag.toLowerCase())) setTags([...tags, tag]);
    setDraft("");
  };

  const matches = draft
    ? suggestions
        .filter((s) => s.toLowerCase().includes(draft.toLowerCase()) && !tags.includes(s))
        .slice(0, 6)
    : [];

  const error = errors?.[0];

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background/60 px-2 py-1.5 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25",
          error && "border-destructive",
        )}
      >
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-secondary py-0.5 pr-1 pl-2 text-xs font-medium">
            {tag}
            <button
              type="button"
              onClick={() => setTags(tags.filter((t) => t !== tag))}
              className="grid size-4 cursor-pointer place-items-center rounded hover:bg-background"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(event) => {
            const value = event.target.value;
            if (value.endsWith(",")) add(value);
            else setDraft(value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(draft);
            } else if (event.key === "Backspace" && !draft && tags.length) {
              setTags(tags.slice(0, -1));
            }
          }}
          onBlur={() => add(draft)}
          placeholder={tags.length ? "" : "Type and press Enter"}
          className="min-w-24 flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-help`}
          list={`${id}-suggestions`}
        />
      </div>
      <datalist id={`${id}-suggestions`}>
        {matches.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <input type="hidden" name={name} value={tags.join(", ")} />
      <p id={`${id}-help`} className={cn("text-xs", error ? "font-medium text-destructive" : "text-muted-foreground")}>
        {error ?? description ?? "Press Enter or comma to add."}
      </p>
    </div>
  );
}
