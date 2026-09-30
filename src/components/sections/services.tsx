import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceIcon } from "@/components/shared/service-icon";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/site/section";
import { cn } from "@/lib/utils";
import type { ServiceDTO } from "@/server/queries/types";

export function ServicesSection({ services }: { services: ServiceDTO[] }) {
  if (services.length === 0) return null;

  return (
    <Section id="services" labelledBy="services-title">
      <SectionHeading
        id="services-title"
        eyebrow="Services"
        title="Ways we can work together"
        description="Flexible engagements designed around outcomes, with clear scope and transparent pricing."
      />
      <Stagger className="grid gap-5 md:grid-cols-2">
        {services.map((service) => (
          <StaggerItem
            key={service.id}
            as="article"
            className={cn(
              "group relative flex flex-col rounded-2xl border bg-card p-6 shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-7",
              service.isFeatured && "ring-gradient border-transparent",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand transition-transform duration-300 group-hover:scale-105">
                <ServiceIcon name={service.icon} className="size-5" />
              </span>
              {service.isFeatured && <Badge variant="brand">Most requested</Badge>}
            </div>
            <h3 className="mt-5 text-lg font-semibold">{service.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
            {service.features.length > 0 && (
              <ul className="mt-5 space-y-2.5">
                {service.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto pt-6">
              <div className="flex items-center justify-between gap-4 border-t pt-5">
              <p className="text-sm font-medium">{service.pricing ?? "Custom quote"}</p>
              <Button asChild variant="ghost" size="sm" className="-mr-2">
                <Link href={service.ctaHref}>
                  {service.ctaLabel} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
