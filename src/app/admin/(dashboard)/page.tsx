import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, CircleDashed, Inbox, Languages, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { DemoBadge } from "@/components/admin/demo-badge";
import { RefreshCacheButton } from "@/components/admin/refresh-cache-button";
import { RESOURCES, type ResourceKey } from "@/lib/admin-resources";
import { formatRelative } from "@/lib/utils";
import { requireAdminPage } from "@/server/auth-guard";
import { getDashboardData } from "@/server/queries/admin";
import { getEvidenceCoverage, getTrust } from "@/server/queries/public";
import type { EvidenceCoverageKey } from "@/server/queries/public/types";

export const metadata: Metadata = { title: "Dashboard" };

const COVERAGE: { key: EvidenceCoverageKey; label: string; href: string }[] = [
  { key: "identity", label: "Trust identity (about, vision, mission)", href: "/admin/trust" },
  { key: "registration", label: "Registration details & document", href: "/admin/trust" },
  { key: "leadership", label: "Trustee profiles (with consent)", href: "/admin/trustees" },
  { key: "projects", label: "Projects", href: "/admin/projects" },
  { key: "activities", label: "Activities", href: "/admin/activities" },
  { key: "impact", label: "Impact figures with sources", href: "/admin/impact" },
  { key: "documents", label: "Public documents", href: "/admin/documents" },
  { key: "certificates", label: "Certificates & awards", href: "/admin/certificates" },
  { key: "reports", label: "Annual reports", href: "/admin/reports" },
  { key: "testimonials", label: "Testimonials (with consent)", href: "/admin/testimonials" },
];

const QUICK: ResourceKey[] = ["activities", "news", "documents", "albums"];

export default async function AdminDashboardPage() {
  const user = await requireAdminPage();
  const [data, coverage, trust] = await Promise.all([getDashboardData(), getEvidenceCoverage(), getTrust()]);
  const covered = COVERAGE.filter((c) => coverage[c.key].available).length;
  const untranslated = data.counts.reduce((sum, c) => sum + c.untranslated, 0);
  const drafts = data.counts.reduce((sum, c) => sum + c.drafts, 0);
  const published = data.counts.reduce((sum, c) => sum + c.published, 0);
  const demo = data.counts.reduce((sum, c) => sum + c.demo, 0);

  return (
    <>
      <PageHeader
        title={`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Keep the trust's public record accurate, sourced and bilingual."
        actions={QUICK.map((key) => (
          <Button key={key} asChild variant="outline" size="sm">
            <Link prefetch={false} href={`${RESOURCES[key].href}/new`}>
              <Plus aria-hidden="true" /> {RESOURCES[key].singular}
            </Link>
          </Button>
        ))}
      />

      {(demo > 0 || trust.isDemo) && (
        <div role="note" className="mb-6 flex flex-col gap-3 rounded-2xl border border-dashed border-warning/60 bg-warning/10 p-4 sm:flex-row sm:items-center">
          <DemoBadge className="self-start sm:self-center" />
          <div className="flex-1 text-sm">
            <p className="font-medium">
              {demo} fictional demo records are loaded{trust.isDemo ? ", including the demo trust profile" : ""}.
            </p>
            <p className="text-muted-foreground">
              They exist to test the website and are shown to visitors with a “demonstration” banner. Remove them before publishing official information:{" "}
              <code className="text-xs">npm run db:demo:clear</code>
            </p>
          </div>
        </div>
      )}

      {user.role === "ADMIN" && (
        <div className="mb-6 flex flex-col gap-2 rounded-2xl border bg-card p-4 text-sm shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">Changed data outside the dashboard (seed, clear or a database import)? Refresh the website so visitors see it now.</p>
          <RefreshCacheButton />
        </div>
      )}

      {trust.namePending && (
        <div role="alert" className="mb-6 flex flex-col gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 sm:flex-row sm:items-center">
          <AlertTriangle className="size-5 shrink-0 text-[color-mix(in_oklch,var(--warning)_70%,var(--foreground))]" aria-hidden="true" />
          <div className="flex-1 text-sm">
            <p className="font-medium">The trust profile still contains placeholders.</p>
            <p className="text-muted-foreground">
              The website shows “Content pending official information” until the official name and registration details are entered.
            </p>
          </div>
          {user.role === "ADMIN" && (
            <Button asChild size="sm">
              <Link prefetch={false} href="/admin/trust">Complete profile</Link>
            </Button>
          )}
        </div>
      )}

      <dl className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Published items", value: published, href: undefined },
          { label: "Drafts", value: drafts, href: undefined },
          { label: "Tamil translation missing", value: untranslated, href: "/admin/translations" },
          { label: "Unread messages", value: data.unread, href: "/admin/messages?filter=unread" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border bg-card p-5 shadow-soft">
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
            <dd className="mt-2 flex items-end justify-between gap-2">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">{stat.value}</span>
              {stat.href && (
                <Link prefetch={false} href={stat.href} className="text-xs font-medium text-brand hover:underline">
                  View
                </Link>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <section aria-labelledby="coverage-heading" className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="coverage-heading" className="font-semibold">
                Evidence coverage
              </h2>
              <p className="text-sm text-muted-foreground tabular-nums">
                {covered} of {COVERAGE.length} areas have published evidence
              </p>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Mirrors the public Evidence Center. An area is only marked as covered when real, published records exist — there is no score.
            </p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {COVERAGE.map((item) => {
                const entry = coverage[item.key];
                return (
                  <li key={item.key}>
                    <Link prefetch={false} href={item.href} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-accent">
                      {entry.available ? (
                        <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Available" />
                      ) : (
                        <CircleDashed className="size-4 shrink-0 text-muted-foreground" aria-label="Not yet available" />
                      )}
                      <span className="flex-1">{item.label}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{entry.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="content-heading" className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <h2 id="content-heading" className="border-b px-5 py-4 font-semibold sm:px-6">
              Content
            </h2>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th scope="col" className="px-5 py-2.5 font-medium sm:px-6">
                      Section
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">
                      Published
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">
                      Drafts
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-right font-medium sm:px-6">
                      Tamil missing
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.counts.map((c) => (
                    <tr key={c.key} className="hover:bg-muted/30">
                      <th scope="row" className="px-5 py-2.5 text-left font-normal sm:px-6">
                        <Link prefetch={false} href={RESOURCES[c.key].href} className="hover:underline">
                          {RESOURCES[c.key].label}
                        </Link>
                      </th>
                      <td className="px-3 py-2.5 text-right tabular-nums">{c.published}</td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground tabular-nums">{c.drafts}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums sm:px-6">
                        {c.untranslated > 0 ? <Badge variant="warning">{c.untranslated}</Badge> : <span className="text-muted-foreground">0</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="messages-heading" className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="messages-heading" className="font-semibold">
                Recent messages
              </h2>
              <Link prefetch={false} href="/admin/messages" className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                Inbox <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
            {data.recentMessages.length === 0 ? (
              <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Inbox className="size-4" aria-hidden="true" /> No messages yet.
              </p>
            ) : (
              <ul className="divide-y">
                {data.recentMessages.map((m) => (
                  <li key={m.id}>
                    <Link prefetch={false} href={`/admin/messages?open=${m.id}`} className="flex items-start gap-2 py-2.5 text-sm hover:text-brand">
                      {m.status === "UNREAD" && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{m.subject}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {m.name} · {formatRelative(m.createdAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="activity-heading" className="rounded-2xl border bg-card p-5 shadow-soft">
            <h2 id="activity-heading" className="mb-3 font-semibold">
              Recent changes
            </h2>
            {data.activity.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No changes recorded yet.</p>
            ) : (
              <ol className="space-y-3">
                {data.activity.map((a) => (
                  <li key={a.id} className="text-sm">
                    <p className="leading-snug">{a.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.user?.name ?? a.user?.email ?? "Deleted user"} · {formatRelative(a.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-soft">
            <h2 className="mb-2 flex items-center gap-2 font-semibold">
              <Languages className="size-4 text-brand" aria-hidden="true" /> Translations
            </h2>
            <p className="text-sm text-muted-foreground">
              {untranslated === 0 ? "Every item with English text also has Tamil." : `${untranslated} items have English text without Tamil. Visitors see the English text, marked as such.`}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link prefetch={false} href="/admin/translations">Open translation report</Link>
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
