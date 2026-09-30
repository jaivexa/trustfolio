import { Award, BadgeCheck, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/shared/smart-image";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { CertificatePreview } from "@/components/sections/certificate-preview";
import { Section, SectionHeading } from "@/components/site/section";
import { formatMonthYear } from "@/lib/utils";
import type { CertificateDTO } from "@/server/queries/types";

export function CertificatesSection({ certificates }: { certificates: CertificateDTO[] }) {
  if (certificates.length === 0) return null;

  return (
    <Section id="certifications" labelledBy="certifications-title">
      <SectionHeading
        id="certifications-title"
        eyebrow="Certifications"
        title="Verified credentials"
        description="Independent validation of my expertise. Every credential links to the issuer for verification."
      />
      <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => {
          const expired = cert.expiresAt ? new Date(cert.expiresAt) < new Date() : false;
          return (
            <StaggerItem as="li" key={cert.id}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-shadow hover:shadow-lift">
                {cert.imageUrl ? (
                  <CertificatePreview name={cert.name} issuer={cert.issuer} imageUrl={cert.imageUrl}>
                    <SmartImage
                      src={cert.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </CertificatePreview>
                ) : (
                  <div className="grid aspect-[16/9] place-items-center bg-muted/60">
                    <Award className="size-10 text-brand/60" aria-hidden="true" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-medium text-brand">{cert.issuer}</p>
                  <h3 className="mt-1 leading-snug font-semibold">{cert.name}</h3>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <dt>Issued</dt>
                    <dd>
                      <time dateTime={cert.issuedAt}>{formatMonthYear(cert.issuedAt)}</time>
                      {cert.expiresAt && (
                        <span className={expired ? "text-destructive" : undefined}>
                          {" "}
                          · {expired ? "expired" : "valid until"} {formatMonthYear(cert.expiresAt)}
                        </span>
                      )}
                    </dd>
                    {cert.credentialId && (
                      <>
                        <dt>Credential</dt>
                        <dd className="truncate font-mono">{cert.credentialId}</dd>
                      </>
                    )}
                  </dl>
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    {cert.verificationUrl && (
                      <Button asChild size="sm" variant="outline">
                        <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer">
                          <BadgeCheck aria-hidden="true" /> Verify
                          <span className="sr-only"> {cert.name} (opens in a new tab)</span>
                        </a>
                      </Button>
                    )}
                    {cert.fileUrl && (
                      <Button asChild size="sm" variant="ghost">
                        <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer">
                          <FileText aria-hidden="true" /> Certificate
                          <ExternalLink className="size-3" aria-hidden="true" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
