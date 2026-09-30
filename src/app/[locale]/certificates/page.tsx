import type { Metadata } from "next";
import Link from "next/link";
import { Award, ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tx } from "@/components/i18n/tx";
import { CertificatePreview } from "@/components/interactive/certificate-preview";
import { PageIntro, Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, getPageContext } from "@/lib/i18n";
import { format, text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { getCertificates } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/certificates">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/certificates", title: t.certificates.title, description: t.certificates.description });
}

export default async function CertificatesPage({ params }: PageProps<"/[locale]/certificates">) {
  const { locale, t } = await getPageContext(params);
  const certificates = await getCertificates();
  const now = new Date().toISOString();

  return (
    <>
      <PageIntro
        eyebrow={t.home.evidenceEyebrow}
        title={t.certificates.title}
        description={t.certificates.description}
        breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.certificates.title }]}
      />
      <Section>
        {certificates.length === 0 ? (
          <EmptyState icon={Award} title={t.empty.certificates} />
        ) : (
          <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => {
              const title = text(cert.title, locale);
              const expired = cert.expiresAt ? cert.expiresAt < now : false;
              return (
                <StaggerItem as="li" key={cert.id}>
                  <article id={cert.id} className="flex h-full scroll-mt-28 flex-col overflow-hidden rounded-2xl border bg-card shadow-soft">
                    {cert.image ? (
                      <CertificatePreview
                        title={title}
                        issuer={text(cert.issuer, locale)}
                        imageUrl={cert.image.url}
                        alt={text(cert.image.alt, locale) || title}
                        enlargeLabel={format(t.certificates.enlarge, { title })}
                      />
                    ) : (
                      <div className="bg-kolam grid aspect-[10/7] place-items-center bg-muted/60">
                        <Award className="size-10 text-brand/60" aria-hidden="true" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <Badge variant="secondary">{t.certificates.kind[cert.kind]}</Badge>
                      <Tx value={cert.title} locale={locale} as="h2" className="mt-3 text-lg leading-snug" />
                      <Tx value={cert.issuer} locale={locale} as="p" className="mt-1 text-sm text-brand" />
                      <Tx value={cert.description} locale={locale} as="p" className="mt-3 text-sm leading-relaxed text-muted-foreground" />
                      <dl className="mt-4 grid gap-1 text-xs text-muted-foreground">
                        {cert.issuedAt && <dd>{format(t.certificates.issued, { date: formatDate(locale, cert.issuedAt, "medium") })}</dd>}
                        {cert.expiresAt && (
                          <dd className={expired ? "text-destructive" : undefined}>
                            {format(expired ? t.certificates.expired : t.certificates.validUntil, { date: formatDate(locale, cert.expiresAt, "medium") })}
                          </dd>
                        )}
                        {cert.credentialId && (
                          <dd>
                            {t.certificates.credential}: <span className="font-mono">{cert.credentialId}</span>
                          </dd>
                        )}
                      </dl>
                      <div className="mt-auto flex flex-wrap gap-4 pt-5 text-sm">
                        {cert.verificationUrl && (
                          <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline">
                            <ExternalLink className="size-4" aria-hidden="true" /> {t.actions.checkWithIssuer}
                          </a>
                        )}
                        {cert.document && (
                          <Link href={localePath(locale, `/documents/${cert.document.slug}`)} className="inline-flex items-center gap-1.5 text-brand hover:underline">
                            <FileText className="size-4" aria-hidden="true" /> {t.actions.viewDocument}
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </Section>
    </>
  );
}
