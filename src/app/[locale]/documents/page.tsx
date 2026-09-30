import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { DocumentCard } from "@/components/cards/cards";
import { FilterShell } from "@/components/filters/filter-shell";
import { categoryOptions, filterLabels, searchText } from "@/components/filters/filter-labels";
import { PageIntro, Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { getPageContext } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { getCategories, getDocuments } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/documents">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/documents", title: t.documents.title, description: t.documents.description });
}

export default async function DocumentsPage({ params }: PageProps<"/[locale]/documents">) {
  const { locale, t } = await getPageContext(params);
  const [documents, categories] = await Promise.all([getDocuments(), getCategories("DOCUMENT")]);
  const used = categories.filter((c) => documents.some((d) => d.category?.slug === c.slug));
  const years = [...new Set(documents.flatMap((d) => (d.year ? [d.year] : [])))].sort((a, b) => b - a);

  return (
    <>
      <PageIntro
        eyebrow={t.home.evidenceEyebrow}
        title={t.documents.title}
        description={t.documents.description}
        breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.documents.title }]}
      />
      <Section>
        {documents.length === 0 ? (
          <EmptyState icon={FileText} title={t.empty.documents} />
        ) : (
          <FilterShell
            items={documents.map((d) => ({
              key: d.id,
              groups: d.category ? [d.category.slug] : [],
              year: d.year,
              text: searchText(d.title, d.description, d.category?.name, d.year ? String(d.year) : null),
            }))}
            groups={categoryOptions(locale, used)}
            years={years}
            labels={filterLabels(t, t.documents.searchPlaceholder)}
            gridClassName="grid gap-4 md:grid-cols-2"
            pageSize={20}
          >
            {documents.map((doc) => (
              <DocumentCard key={doc.id} locale={locale} t={t} document={doc} />
            ))}
          </FilterShell>
        )}
      </Section>
    </>
  );
}
