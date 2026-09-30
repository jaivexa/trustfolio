import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { Tx } from "@/components/i18n/tx";
import { DocumentViewer } from "@/components/interactive/document-viewer";
import { PageIntro, Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { RegistrationFacts, VerificationRecordCard } from "@/components/trust/evidence";
import { formatDate, getPageContext } from "@/lib/i18n";
import { format, text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { getTrust, getVerificationRecords } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/verification/registration">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/verification/registration", title: t.registration.title, description: t.registration.description });
}

export default async function RegistrationPage({ params }: PageProps<"/[locale]/verification/registration">) {
  const { locale, t } = await getPageContext(params);
  const [trust, records] = await Promise.all([getTrust(), getVerificationRecords()]);
  const registrationRecords = records.filter((r) => r.area === "REGISTRATION");
  const doc = trust.registration.document;

  return (
    <>
      <PageIntro
        eyebrow={t.verification.registration}
        title={t.registration.title}
        description={t.registration.description}
        breadcrumbs={[
          { label: t.nav.home, href: localePath(locale, "/") },
          { label: t.verification.title, href: localePath(locale, "/verification") },
          { label: t.registration.title },
        ]}
      />
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <RegistrationFacts locale={locale} t={t} trust={trust} />
            <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> {t.registration.description}
            </p>
            {registrationRecords.length > 0 && (
              <ul className="mt-8 grid gap-4">
                {registrationRecords.map((record) => (
                  <li key={record.id}>
                    <VerificationRecordCard locale={locale} t={t} record={record} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="min-w-0 lg:col-span-7">
            <h2 className="mb-4 text-xl">{t.registration.document}</h2>
            {doc?.file ? (
              <>
                <DocumentViewer
                  file={doc.file}
                  title={text(doc.title, locale)}
                  labels={{
                    preview: t.documents.preview,
                    fullscreen: t.actions.fullscreen,
                    exitFullscreen: t.actions.exitFullscreen,
                    download: t.actions.download,
                    openInNewTab: t.actions.openInNewTab,
                    page: t.documents.pages,
                    previewUnavailable: t.documents.previewUnavailable,
                  }}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  {doc.isRedacted && <>{t.registration.redacted} · </>}
                  <Tx value={doc.title} locale={locale} />
                  {doc.version && ` · ${format(t.documents.version, { version: doc.version })}`}
                  {` · ${format(t.meta.lastUpdated, { date: formatDate(locale, doc.updatedAt, "monthYear") })}`}
                </p>
              </>
            ) : (
              <EmptyState title={t.meta.pendingOfficial} description={t.registration.description} />
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
