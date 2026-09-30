"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle, CheckCircle2, Eye, PencilLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFieldDefault, useFieldError } from "@/components/admin/entity-form";
import { cn } from "@/lib/utils";

// ─── Form-level translation tracking ───────────────────────────────────────

type Registry = { report: (name: string, missing: boolean) => void; remove: (name: string) => void };
const TranslationContext = createContext<Registry | null>(null);
const StatusContext = createContext<Record<string, boolean>>({});

/** Wrap a form to get a live "translation complete / missing" summary. */
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Record<string, boolean>>({});
  const report = useCallback((name: string, missing: boolean) => setState((s) => (s[name] === missing ? s : { ...s, [name]: missing })), []);
  const remove = useCallback((name: string) => setState((s) => {
    const next = { ...s };
    delete next[name];
    return next;
  }), []);
  const registry = useMemo(() => ({ report, remove }), [report, remove]);
  return (
    <TranslationContext.Provider value={registry}>
      <StatusContext.Provider value={state}>{children}</StatusContext.Provider>
    </TranslationContext.Provider>
  );
}

export function TranslationSummary({ className }: { className?: string }) {
  const state = useContext(StatusContext);
  const missing = Object.values(state).filter(Boolean).length;
  const total = Object.keys(state).length;
  if (!total) return null;
  return missing === 0 ? (
    <p role="status" className={cn("inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-sm font-medium text-success", className)}>
      <CheckCircle2 className="size-4" aria-hidden="true" /> Translation complete
    </p>
  ) : (
    <p role="status" className={cn("inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-sm font-medium text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]", className)}>
      <AlertTriangle className="size-4" aria-hidden="true" /> Translation missing · {missing} of {total} fields
    </p>
  );
}

function PairStatus({ en, ta }: { en: string; ta: string }) {
  if (!en.trim()) return null;
  return ta.trim() ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
      <CheckCircle2 className="size-3" aria-hidden="true" /> Complete
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]">
      <AlertTriangle className="size-3" aria-hidden="true" /> Tamil missing
    </span>
  );
}

// ─── Column header ─────────────────────────────────────────────────────────

/** "ENGLISH | தமிழ்" header shown above bilingual groups on wide screens. */
export function BilingualHeader() {
  return (
    <div className="hidden grid-cols-2 gap-5 border-b pb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase md:grid">
      <span>English</span>
      <span lang="ta" className="tracking-normal normal-case text-sm">
        தமிழ்
      </span>
    </div>
  );
}

// ─── Fields ─────────────────────────────────────────────────────────────────

type Kind = "input" | "textarea" | "markdown" | "list";

function usePair(name: string, initialEn: string | null | undefined, initialTa: string | null | undefined) {
  const en = useFieldDefault(`${name}En`, initialEn);
  const ta = useFieldDefault(`${name}Ta`, initialTa);
  const [values, setValues] = useState({ en, ta });
  const registry = useContext(TranslationContext);
  const missing = Boolean(values.en.trim()) && !values.ta.trim();
  useEffect(() => {
    registry?.report(name, missing);
  }, [registry, name, missing]);
  useEffect(() => () => registry?.remove(name), [registry, name]);
  return [values, setValues] as const;
}

/**
 * Side-by-side English / Tamil field. English is the reference; Tamil can be
 * left empty (shown as "Tamil missing") — it is never auto-generated.
 */
export function BilingualField({
  name,
  label,
  labelTa,
  kind = "input",
  required,
  description,
  defaultEn,
  defaultTa,
  maxLength,
  rows = 4,
  placeholder,
}: {
  name: string;
  label: string;
  labelTa?: string;
  kind?: Kind;
  required?: boolean;
  description?: string;
  defaultEn?: string | null;
  defaultTa?: string | null;
  maxLength?: number;
  rows?: number;
  placeholder?: string;
}) {
  const id = useId();
  const [values, setValues] = usePair(name, defaultEn, defaultTa);
  const [preview, setPreview] = useState(false);
  const enErrors = useFieldError(`${name}En`);
  const taErrors = useFieldError(`${name}Ta`);

  const control = (lang: "en" | "ta") => {
    const fieldName = `${name}${lang === "en" ? "En" : "Ta"}`;
    const fieldId = `${id}-${lang}`;
    const error = (lang === "en" ? enErrors : taErrors)?.[0];
    const common = {
      id: fieldId,
      name: fieldName,
      value: values[lang],
      maxLength,
      lang,
      placeholder: lang === "en" ? placeholder : undefined,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${fieldId}-error` : description ? `${id}-desc` : undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [lang]: event.target.value })),
    };
    return (
      <div className="grid content-start gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={fieldId} className="text-sm font-medium" lang={lang === "ta" ? "ta" : undefined}>
            {lang === "en" ? label : (labelTa ?? `${label} (தமிழ்)`)}
            {lang === "en" && required && (
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            )}
            <span className="ml-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:hidden">{lang === "en" ? "EN" : "TA"}</span>
          </label>
          {lang === "ta" && <PairStatus en={values.en} ta={values.ta} />}
          {lang === "en" && maxLength && kind !== "input" && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {values.en.length}/{maxLength}
            </span>
          )}
        </div>
        {preview && kind === "markdown" ? (
          <div lang={lang} className="prose-content min-h-32 rounded-xl border bg-background/50 p-3.5 text-sm">
            {values[lang].trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{values[lang]}</ReactMarkdown> : <p className="text-muted-foreground">—</p>}
            <input type="hidden" name={fieldName} value={values[lang]} />
          </div>
        ) : kind === "input" ? (
          <Input {...common} />
        ) : (
          <Textarea {...common} rows={rows} className={cn(kind === "markdown" && "font-mono text-[13px] leading-relaxed")} />
        )}
        {error && (
          <p id={`${fieldId}-error`} className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="grid gap-2">
      {kind === "markdown" && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-pressed={preview}
          >
            {preview ? <PencilLine className="size-3.5" aria-hidden="true" /> : <Eye className="size-3.5" aria-hidden="true" />}
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {control("en")}
        {control("ta")}
      </div>
      {description && (
        <p id={`${id}-desc`} className="text-xs text-muted-foreground">
          {description}
          {kind === "markdown" && " Supports Markdown."}
          {kind === "list" && " One item per line."}
        </p>
      )}
    </div>
  );
}
