import type { Metadata } from "next";
import { Lock, Users } from "lucide-react";
import { PageIntro, Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { TrusteeCard } from "@/components/trust/people";
import { getPageContext } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { getTrustees } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/trustees">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/trustees", title: t.trustees.title, description: t.trustees.description });
}

export default async function TrusteesPage({ params }: PageProps<"/[locale]/trustees">) {
  const { locale, t } = await getPageContext(params);
  const trustees = await getTrustees();

  return (
    <>
      <PageIntro
        eyebrow={t.trustees.eyebrow}
        title={t.trustees.title}
        description={t.trustees.description}
        breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.trustees.title }]}
      />
      <Section>
        {trustees.length === 0 ? (
          <EmptyState icon={Users} title={t.empty.trustees} />
        ) : (
          <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustees.map((trustee) => (
              <StaggerItem as="li" key={trustee.id}>
                <TrusteeCard locale={locale} trustee={trustee} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
        <p className="mt-10 flex max-w-2xl items-start gap-2 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {t.trustees.privacyNote}
        </p>
      </Section>
    </>
  );
}
