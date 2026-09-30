"use client";

import { useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFieldDefault, useFieldError } from "@/components/admin/entity-form";
import { cn } from "@/lib/utils";

/** Markdown editor with write/preview tabs and a character counter. */
export function MarkdownField({
  name,
  label,
  description,
  defaultValue,
  rows = 8,
  maxLength,
  required,
}: {
  name: string;
  label: string;
  description?: string;
  defaultValue?: string | null;
  rows?: number;
  maxLength?: number;
  required?: boolean;
}) {
  const id = useId();
  const errors = useFieldError(name);
  const initial = useFieldDefault(name, defaultValue);
  const [value, setValue] = useState(initial);
  const error = errors?.[0];

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>
          {label}
          {required && (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        {maxLength && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {value.length.toLocaleString()} / {maxLength.toLocaleString()}
          </span>
        )}
      </div>
      <Tabs defaultValue="write" className="gap-2">
        <TabsList className="h-8">
          <TabsTrigger value="write" className="px-3 text-xs">
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className="px-3 text-xs">
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="write" forceMount className="data-[state=inactive]:hidden">
          <Textarea
            id={id}
            name={name}
            rows={rows}
            value={value}
            maxLength={maxLength}
            onChange={(event) => setValue(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={`${id}-help`}
            className="font-mono text-[13px] leading-relaxed"
          />
        </TabsContent>
        <TabsContent value="preview">
          <div className="prose-content min-h-32 rounded-xl border bg-background/50 p-4 text-sm">
            {value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">Nothing to preview yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <p id={`${id}-help`} className={cn("text-xs", error ? "font-medium text-destructive" : "text-muted-foreground")}>
        {error ?? description ?? "Supports Markdown: **bold**, _italic_, lists, links and headings."}
      </p>
    </div>
  );
}
