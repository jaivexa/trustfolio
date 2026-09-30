import Link from "next/link";
import { CircleCheck, CircleDashed, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { Pending, Tx } from "@/components/i18n/tx";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatDate } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { format } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";
import type { EvidenceCoverageDTO, EvidenceCoverageKey, TrustDTO, VerificationRecordDTO } from "@/server/queries/public";

const COVERAGE_LINKS: Record<EvidenceCoverageKey, string> = {
  identity: "/about",
  registration: "/verification/registration",
  leadership: "/trustees",
  projects: "/projects",
  activities: "/activities",
  impact: "/impact",
  documents: "/documents",
  certificates: "/certificates",
  reports: "/reports",
  testimonials: "/verification#testimonials",
};

/**
 * "Evidence available" checklist. There is deliberately no score: a category
 * is ticked only when published records exist for it.
 */
export function EvidenceCoverage({
  locale,
  t,
  coverage,
  compact = false,
}: {
  locale: Locale;
  t: Dictionary;
  coverage: EvidenceCoverageDTO;
  compact?: boolean;
}) {
  const keys = Object.keys(COVERAGE_LINKS) as EvidenceCoverageKey[];
  return (
    <Stagger as="ul" className={cn("grid gap-2.5", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-5")}>
      {keys.map((key) => {
        const item = coverage[key];
        const content = (
          <>
            {item.available ? (
              <CircleCheck className="size-5 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <CircleDashed className="size-5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
            )}
            <span className="min-w-0">
              <span className="block text-sm font-medium">{t.verification[key]}</span>
              <span className="block text-xs text-muted-foreground">
                {item.available ? format(t.verification.count, { count: item.count }) : t.verification.notYet}
              </span>
            </span>
            <span className="sr-only">{item.available ? t.verification.available : t.verification.notYet}</span>
          </>
        );
        return (
          <StaggerItem as="li" key={key}>
            {item.available ? (
              <Link
                href={localePath(locale, COVERAGE_LINKS[key])}
                className="flex h-full items-center gap-3 rounded-xl border bg-card p-3.5 transition-colors hover:border-brand/40"
              >
                {content}
              </Link>
            ) : (
              <div className="flex h-full items-center gap-3 rounded-xl border border-dashed bg-muted/30 p-3.5 text-muted-foreground">{content}</div>
            )}
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

export function VerificationRecordCard({ locale, t, record }: { locale: Locale; t: Dictionary; record: VerificationRecordDTO }) {
  return (
    <article className="surface flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{t.verification.method[record.method]}</span>
      </div>
      <Tx value={record.title} locale={locale} as="h3" className="mt-4 text-base leading-snug" />
      <Tx value={record.description} locale={locale} as="p" className="mt-1.5 text-sm leading-relaxed text-muted-foreground" />
      <dl className="mt-4 grid gap-2 text-sm">
        {record.referenceNumber && (
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted-foreground">{t.verification.reference}:</dt>
            <dd className="font-mono">{record.referenceNumber}</dd>
          </div>
        )}
        {record.issuingAuthority && (
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted-foreground">{t.verification.issuedBy}:</dt>
            <Tx value={record.issuingAuthority} locale={locale} as="dd" />
          </div>
        )}
      </dl>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-sm">
        {record.document && (
          <Link href={localePath(locale, `/documents/${record.document.slug}`)} className="inline-flex items-center gap-1.5 text-brand hover:underline">
            <FileText className="size-4" aria-hidden="true" /> {t.actions.viewDocument}
          </Link>
        )}
        {record.externalUrl && (
          <a href={record.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand hover:underline">
            <ExternalLink className="size-4" aria-hidden="true" /> {t.actions.checkWithIssuer}
          </a>
        )}
        {record.lastCheckedAt && (
          <span className="text-xs text-muted-foreground">{format(t.verification.lastChecked, { date: formatDate(locale, record.lastCheckedAt, "medium") })}</span>
        )}
      </div>
    </article>
  );
}

/** Registration & legal facts — shown only when entered from official documents. */
export function RegistrationFacts({ locale, t, trust }: { locale: Locale; t: Dictionary; trust: TrustDTO }) {
  const r = trust.registration;
  const pending = <Pending t={t} className="text-xs" />;
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t.registration.trustName, value: trust.namePending ? pending : <Tx value={trust.name} locale={locale} /> },
    { label: t.registration.number, value: r.number ? <span className="font-mono">{r.number}</span> : pending },
    { label: t.registration.office, value: <Tx value={r.office} locale={locale} fallback={pending} /> },
    { label: t.registration.date, value: r.date ? formatDate(locale, r.date) : pending },
    { label: t.registration.status, value: <Tx value={r.legalStatus} locale={locale} fallback={pending} /> },
    { label: t.registration.address, value: <Tx value={r.address} locale={locale} className="whitespace-pre-line" fallback={pending} /> },
    ...(r.established ? [{ label: t.registration.established, value: formatDate(locale, r.established) }] : []),
  ];
  return (
    <dl className="divide-y overflow-hidden rounded-2xl border bg-card shadow-soft">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
          <dt className="text-sm text-muted-foreground">{row.label}</dt>
          <dd className="min-w-0 text-sm font-medium break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
