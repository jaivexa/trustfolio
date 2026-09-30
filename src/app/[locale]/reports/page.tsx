import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { ReportCard } from "@/components/cards/cards";
import { PageIntro, Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { getPageContext } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { getReports } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/reports">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/reports", title: t.reports.title, description: t.reports.description });
}

export default async function ReportsPage({ params }: PageProps<"/[locale]/reports">) {
  const { locale, t } = await getPageContext(params);
  const reports = await getReports();
  return (
    <>
      <PageIntro
        eyebrow={t.home.evidenceEyebrow}
        title={t.reports.title}
        description={t.reports.description}
        breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.reports.title }]}
      />
      <Section>
        {reports.length === 0 ? (
          <EmptyState icon={BookOpen} title={t.empty.reports} />
        ) : (
          <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <StaggerItem as="li" key={report.id}>
                <ReportCard locale={locale} t={t} report={report} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Section>
    </>
  );
}
