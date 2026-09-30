import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/resource-table";
import { RESOURCES } from "@/lib/admin-resources";
import { getTranslationReport } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Translations" };

const humanize = (stem: string) => stem.replace(/([A-Z])/g, " $1").toLowerCase();

export default async function TranslationsPage() {
  const { sections, profileMissing } = await getTranslationReport();
  const totalMissing = sections.reduce((sum, s) => sum + s.rows.length, 0) + (profileMissing.length ? 1 : 0);

  return (
    <>
      <PageHeader
        title="Translations"
        description="Items whose English text has no Tamil counterpart yet. Visitors on the Tamil site see the English text, labelled as English, until a translation is added."
      />
      <p role="note" className="mb-6 rounded-xl border bg-muted/40 p-4 text-sm">
        Tamil text is always written or reviewed by a person. Official and legal wording (trust name, registration, objectives, documents) should come from the
        registered Tamil documents — do not create a new translation for them.
      </p>

      {totalMissing === 0 ? (
        <p className="flex items-center gap-2 rounded-2xl border border-success/30 bg-success/10 p-5 text-sm font-medium text-success">
          <CheckCircle2 className="size-5" aria-hidden="true" /> Translation complete — every English field has Tamil.
        </p>
      ) : (
        <div className="grid gap-6">
          {profileMissing.length > 0 && (
            <section className="rounded-2xl border bg-card p-5 shadow-soft">
              <h2 className="mb-2 font-semibold">Trust profile</h2>
              <p className="text-sm">
                <AlertTriangle className="mr-1 inline size-4 text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]" aria-hidden="true" />
                Tamil missing: {profileMissing.map(humanize).join(", ")}.{" "}
                <Link prefetch={false} href="/admin/trust" className="font-medium text-brand hover:underline">
                  Edit profile
                </Link>
              </p>
            </section>
          )}
          {sections
            .filter((s) => s.rows.length > 0)
            .map((s) => (
              <section key={s.key} aria-labelledby={`tr-${s.key}`} className="overflow-hidden rounded-2xl border bg-card shadow-soft">
                <div className="flex items-center justify-between border-b px-5 py-3">
                  <h2 id={`tr-${s.key}`} className="font-semibold">
                    {RESOURCES[s.key].label}
                  </h2>
                  <Badge variant="warning">
                    {s.rows.length} of {s.total}
                  </Badge>
                </div>
                <ul className="divide-y">
                  {s.rows.map((row) => (
                    <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
                      <Link prefetch={false} href={`${RESOURCES[s.key].href}/${row.id}`} className="min-w-0 flex-1 font-medium hover:underline">
                        {row.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">Missing: {row.missing.map(humanize).join(", ")}</span>
                      <StatusBadge status={row.status} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </>
  );
}
