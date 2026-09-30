import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
  labelledBy,
  tone = "plain",
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  labelledBy?: string;
  tone?: "plain" | "muted" | "pattern";
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "relative scroll-mt-24 py-16 sm:py-24",
        tone === "muted" && "bg-muted/40",
        tone === "pattern" && "bg-kolam bg-muted/30",
        className,
      )}
    >
      <div className="container-page relative">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("tracking-eyebrow mb-3 inline-flex items-center gap-2.5 text-xs font-medium text-brand", className)}>
      <span className="h-px w-6 bg-gold" aria-hidden="true" />
      {children}
    </p>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: {
  id: string;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "mb-10 flex flex-col gap-5 sm:mb-12",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 id={id} className="text-section">
          {title}
        </h2>
        {description && <div className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, label = "Breadcrumb" }: { items: Crumb[]; label?: string }) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" />}
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current={index === items.length - 1 ? "page" : undefined} className="text-foreground/80">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Top-of-page introduction used by every inner page. */
export function PageIntro({
  eyebrow,
  title,
  titleLang,
  description,
  breadcrumbs,
  children,
  aside,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  titleLang?: string;
  description?: React.ReactNode;
  breadcrumbs?: Crumb[];
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <header className="bg-kolam relative overflow-hidden border-b">
      <div className="container-page relative pt-10 pb-12 sm:pt-14 sm:pb-16">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <div className={cn("mt-6 grid gap-8", aside && "lg:grid-cols-[1fr_20rem] lg:items-end")}>
          <Reveal className="max-w-3xl">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1 lang={titleLang} className="text-page-title">
              {title}
            </h1>
            {description && <div className="mt-5 text-lg leading-relaxed text-muted-foreground">{description}</div>}
            {children}
          </Reveal>
          {aside && <Reveal delay={0.06}>{aside}</Reveal>}
        </div>
      </div>
    </header>
  );
}
