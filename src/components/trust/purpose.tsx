import Link from "next/link";
import { ArrowRight, Compass, FileText, Target } from "lucide-react";
import { Pending, Tx } from "@/components/i18n/tx";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { ObjectiveIcon } from "@/components/trust/objective-icon";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { format } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import type { ObjectiveDTO, TrustDTO } from "@/server/queries/public";

/** Vision & Mission as two visually distinct statements. */
export function VisionMission({ locale, t, trust }: { locale: Locale; t: Dictionary; trust: TrustDTO }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Reveal as="article" className="relative overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground shadow-lift sm:p-10">
        <div aria-hidden="true" className="absolute -top-16 -right-16 size-56 rounded-full border border-primary-foreground/10" />
        <div aria-hidden="true" className="absolute -top-8 -right-8 size-40 rounded-full border border-primary-foreground/10" />
        <Compass className="size-6 text-gold" aria-hidden="true" />
        <h3 className="mt-5 text-2xl">{t.about.visionTitle}</h3>
        <Tx
          value={trust.vision}
          locale={locale}
          as="p"
          className="mt-4 font-display text-lg leading-relaxed text-primary-foreground/85 sm:text-xl"
          fallback={<span className="mt-4 block text-sm text-primary-foreground/70">{t.meta.pendingOfficial}</span>}
        />
      </Reveal>
      <Reveal as="article" delay={0.06} className="relative overflow-hidden rounded-3xl border bg-card p-7 shadow-soft sm:p-10">
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gold" />
        <Target className="size-6 text-brand" aria-hidden="true" />
        <h3 className="mt-5 text-2xl">{t.about.missionTitle}</h3>
        <Tx
          value={trust.mission}
          locale={locale}
          as="p"
          className="mt-4 font-display text-lg leading-relaxed text-foreground/85 sm:text-xl"
          fallback={<Pending t={t} className="mt-4" />}
        />
      </Reveal>
    </div>
  );
}

/** Numbered objective cards, each citing its source where recorded. */
export function ObjectivesGrid({ locale, t, objectives }: { locale: Locale; t: Dictionary; objectives: ObjectiveDTO[] }) {
  if (objectives.length === 0) return <EmptyState title={t.empty.objectives} icon={FileText} />;
  return (
    <Stagger as="ol" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {objectives.map((objective, index) => (
        <StaggerItem as="li" key={objective.id} className="surface flex flex-col p-6">
          <div className="flex items-center justify-between">
            <span className="font-display text-3xl text-gold tabular-nums" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <ObjectiveIcon name={objective.icon} className="size-5" />
            </span>
          </div>
          <Tx value={objective.title} locale={locale} as="h3" className="mt-5 text-lg leading-snug" />
          <Tx value={objective.description} locale={locale} as="p" className="mt-2 text-sm leading-relaxed text-muted-foreground" />
          {(objective.sourceReference || objective.sourceDocument) && (
            <p className="mt-auto pt-5 text-xs text-muted-foreground">
              {objective.sourceDocument ? (
                <Link href={localePath(locale, `/documents/${objective.sourceDocument.slug}`)} className="inline-flex items-center gap-1 text-brand hover:underline">
                  <FileText className="size-3.5" aria-hidden="true" />
                  {format(t.about.objectiveSource, { source: objective.sourceReference ?? "" })}
                </Link>
              ) : (
                format(t.about.objectiveSource, { source: objective.sourceReference ?? "" })
              )}
            </p>
          )}
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export function ReadMoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand">
      <span className="underline-offset-4 group-hover:underline">{children}</span>
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}
