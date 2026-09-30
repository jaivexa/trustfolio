"use client";

import Link from "next/link";
import { CalendarRange, FileText, FolderOpen, Info, ListChecks } from "lucide-react";
import { Counter } from "@/components/motion/counter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type TextValue = { text: string; lang?: string };

export type MetricTile = {
  id: string;
  label: TextValue;
  value: number;
  prefix: string | null;
  suffix: string | null;
  unit: TextValue | null;
  period: string | null;
  methodology: TextValue | null;
  sourceDocument: { href: string; title: TextValue } | null;
  report: { href: string; title: string } | null;
  project: { href: string; title: TextValue } | null;
  activities: { href: string; title: TextValue }[];
  updated: string;
};

type Labels = {
  details: string;
  period: string;
  methodology: string;
  noMethodology: string;
  sourceDocument: string;
  report: string;
  relatedActivities: string;
  relatedProject: string;
  lastUpdated: string;
};

/**
 * KPI row of stat tiles. Each figure opens its evidence: reporting period,
 * method/source, report, related project and activities, and last update.
 */
export function MetricTiles({ metrics, labels, locale }: { metrics: MetricTile[]; labels: Labels; locale: string }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <li key={metric.id}>
          <Dialog>
            <DialogTrigger className="group flex h-full w-full cursor-pointer flex-col rounded-2xl border bg-card p-5 text-left shadow-soft transition-[border-color,box-shadow] outline-none hover:border-brand/40 hover:shadow-lift focus-visible:ring-[3px] focus-visible:ring-ring/40">
              <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums sm:text-[2.6rem]">
                {metric.prefix}
                <Counter value={metric.value} suffix={metric.suffix ?? ""} locale={locale} />
              </span>
              <span lang={metric.label.lang} className="mt-2 text-sm font-medium">
                {metric.label.text}
                {metric.unit && <span lang={metric.unit.lang} className="text-muted-foreground"> · {metric.unit.text}</span>}
              </span>
              {metric.period && <span className="mt-1 text-xs text-muted-foreground">{metric.period}</span>}
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-medium text-brand">
                <Info className="size-3.5" aria-hidden="true" /> {labels.details}
              </span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle lang={metric.label.lang}>
                  {metric.prefix}
                  {new Intl.NumberFormat(locale).format(metric.value)}
                  {metric.suffix} {metric.label.text}
                </DialogTitle>
                <DialogDescription>{labels.lastUpdated.replace("{date}", metric.updated)}</DialogDescription>
              </DialogHeader>
              <dl className="grid gap-4 text-sm">
                {metric.period && (
                  <div className="flex gap-3">
                    <CalendarRange className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                    <div>
                      <dt className="font-medium">{labels.period}</dt>
                      <dd className="text-muted-foreground">{metric.period}</dd>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <ListChecks className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <div>
                    <dt className="font-medium">{labels.methodology}</dt>
                    <dd lang={metric.methodology?.lang} className="whitespace-pre-line text-muted-foreground">
                      {metric.methodology?.text ?? labels.noMethodology}
                    </dd>
                  </div>
                </div>
                {(metric.sourceDocument || metric.report) && (
                  <div className="flex gap-3">
                    <FileText className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                    <div className="grid gap-1">
                      {metric.sourceDocument && (
                        <>
                          <dt className="font-medium">{labels.sourceDocument}</dt>
                          <dd>
                            <Link href={metric.sourceDocument.href} lang={metric.sourceDocument.title.lang} className="text-brand hover:underline">
                              {metric.sourceDocument.title.text}
                            </Link>
                          </dd>
                        </>
                      )}
                      {metric.report && (
                        <>
                          <dt className="font-medium">{labels.report}</dt>
                          <dd>
                            <Link href={metric.report.href} className="text-brand hover:underline">
                              {metric.report.title}
                            </Link>
                          </dd>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {(metric.project || metric.activities.length > 0) && (
                  <div className="flex gap-3">
                    <FolderOpen className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                    <div className="grid gap-1">
                      {metric.project && (
                        <>
                          <dt className="font-medium">{labels.relatedProject}</dt>
                          <dd>
                            <Link href={metric.project.href} lang={metric.project.title.lang} className="text-brand hover:underline">
                              {metric.project.title.text}
                            </Link>
                          </dd>
                        </>
                      )}
                      {metric.activities.length > 0 && (
                        <>
                          <dt className="mt-1 font-medium">{labels.relatedActivities}</dt>
                          <dd>
                            <ul className="grid gap-1">
                              {metric.activities.map((a) => (
                                <li key={a.href}>
                                  <Link href={a.href} lang={a.title.lang} className="text-brand hover:underline">
                                    {a.title.text}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </dl>
            </DialogContent>
          </Dialog>
        </li>
      ))}
    </ul>
  );
}
