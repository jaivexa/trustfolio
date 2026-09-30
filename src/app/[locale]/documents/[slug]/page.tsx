import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileX2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LocalizedMarkdown, Tx } from "@/components/i18n/tx";
import { DocumentViewer } from "@/components/interactive/document-viewer";
import { Breadcrumbs, Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLd } from "@/components/shared/json-ld";
import { formatDate, formatFileSize, getPageContext, LOCALES } from "@/lib/i18n";
import { format, text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getDocumentBySlug, getDocuments } from "@/server/queries/public";

export async function generateStaticParams() {
  const documents = await getDocuments();
  return LOCALES.flatMap((locale) => documents.map((d) => ({ locale, slug: d.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/documents/[slug]">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const doc = await getDocumentBySlug(slug);
  if (!doc) return { title: t.errors.notFoundTitle, robots: { index: false } };
  return pageMetadata({ locale, path: `/documents/${slug}`, title: text(doc.title, locale), description: text(doc.description, locale) || undefined });
}

export default async function DocumentPage({ params }: PageProps<"/[locale]/documents/[slug]">) {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const doc = await getDocumentBySlug(slug);
  if (!doc) notFound();
  const title = text(doc.title, locale);
  const relatedHref = { project: "/projects", activity: "/activities", trustee: "/trustees" } as const;

  const meta: { label: string; value: React.ReactNode }[] = [
    ...(doc.category ? [{ label: t.documents.category, value: <Tx value={doc.category.name} locale={locale} /> }] : []),
    { label: t.documents.language, value: t.documents.languages[doc.language] },
    ...(doc.documentDate ? [{ label: t.documents.date, value: formatDate(locale, doc.documentDate) }] : doc.year ? [{ label: t.documents.year, value: String(doc.year) }] : []),
    ...(doc.source ? [{ label: t.documents.source, value: <Tx value={doc.source} locale={locale} /> }] : []),
    ...(doc.version ? [{ label: format(t.documents.version, { version: "" }).trim(), value: doc.version }] : []),
    ...(doc.file ? [{ label: t.documents.type, value: `${doc.file.mimeType === "application/pdf" ? "PDF" : doc.file.mimeType} · ${formatFileSize(locale, doc.file.size)}` }] : []),
    ...(doc.publishedAt ? [{ label: t.documents.uploaded, value: formatDate(locale, doc.publishedAt) }] : []),
    { label: format(t.meta.lastUpdated, { date: "" }).replace(/[:\s]+$/, ""), value: formatDate(locale, doc.updatedAt) },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: localePath(locale, "/") },
          { name: t.documents.title, path: localePath(locale, "/documents") },
          { name: title, path: localePath(locale, `/documents/${slug}`) },
        ])}
      />
      <Section className="pt-10 sm:pt-14">
        <Breadcrumbs items={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.documents.title, href: localePath(locale, "/documents") }, { label: title }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <h1 className="text-page-title">
              <Tx value={doc.title} locale={locale} />
            </h1>
            {doc.isRedacted && (
              <Badge variant="outline" className="mt-4 gap-1.5">
                <ShieldCheck className="size-3.5" aria-hidden="true" /> {t.documents.redacted}
              </Badge>
            )}
            <LocalizedMarkdown value={doc.description} locale={locale} t={t} className="mt-5 text-muted-foreground" />
            <div className="mt-8">
              {doc.file ? (
                <DocumentViewer
                  file={doc.file}
                  title={title}
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
              ) : (
                <EmptyState icon={FileX2} title={t.documents.noFile} />
              )}
            </div>
          </div>
          <aside className="lg:col-span-4">
            <dl className="divide-y rounded-2xl border bg-card shadow-soft lg:sticky lg:top-28">
              {meta.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 px-5 py-3.5 text-sm">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="text-right font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
            {doc.related.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 text-base">{t.documents.related}</h2>
                <ul className="grid gap-2 text-sm">
                  {doc.related.map((item) => (
                    <li key={`${item.type}-${item.slug}`}>
                      <Link href={localePath(locale, `${relatedHref[item.type]}/${item.slug}`)} className="text-brand hover:underline">
                        <Tx value={item.title} locale={locale} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
