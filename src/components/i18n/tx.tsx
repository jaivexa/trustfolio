import { Languages } from "lucide-react";
import { Markdown } from "@/components/shared/markdown";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { resolve, type OptionalLocalized } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";

type TextTag = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div" | "strong" | "dd" | "dt" | "figcaption" | "blockquote" | "li" | "time";

/**
 * Renders bilingual text for the current locale. When falling back to the
 * other language the element carries the correct `lang` attribute, so screen
 * readers pronounce it properly and Tamil typography rules apply correctly.
 */
export function Tx({
  value,
  locale,
  as: Tag = "span",
  className,
  fallback = null,
  id,
}: {
  value: OptionalLocalized | undefined;
  locale: Locale;
  as?: TextTag;
  className?: string;
  fallback?: React.ReactNode;
  id?: string;
}) {
  const resolved = resolve(value, locale);
  if (!resolved) return <>{fallback}</>;
  return (
    <Tag id={id} className={className} lang={resolved.isFallback ? resolved.lang : undefined}>
      {resolved.text}
    </Tag>
  );
}

/** Long-form Markdown with a discreet note when shown in the other language. */
export function LocalizedMarkdown({
  value,
  locale,
  t,
  className,
  fallback = null,
}: {
  value: OptionalLocalized | undefined;
  locale: Locale;
  t: Dictionary;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const resolved = resolve(value, locale);
  if (!resolved) return <>{fallback}</>;
  return (
    <div className={className}>
      {resolved.isFallback && <FallbackNote locale={locale} t={t} />}
      <div lang={resolved.isFallback ? resolved.lang : undefined}>
        <Markdown>{resolved.text}</Markdown>
      </div>
    </div>
  );
}

export function FallbackNote({ locale, t, className }: { locale: Locale; t: Dictionary; className?: string }) {
  return (
    <p className={cn("mb-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground", className)}>
      <Languages className="size-3.5" aria-hidden="true" />
      {locale === "ta" ? t.meta.availableInEnglishOnly : t.meta.availableInTamilOnly}
    </p>
  );
}

/**
 * Visible placeholder for information the trust has not yet provided.
 * Never replaced with invented content.
 */
export function Pending({ t, className }: { t: Dictionary; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
      {t.meta.pendingOfficial}
    </span>
  );
}
