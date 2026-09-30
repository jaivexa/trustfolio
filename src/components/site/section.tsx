import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
  labelledBy,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("scroll-mt-20 py-20 sm:py-28", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  action,
  as: Heading = "h2",
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  action?: React.ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <Reveal
      className={cn(
        "mb-12 flex flex-col gap-6 sm:mb-14",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-brand uppercase">
          <span className="h-px w-6 bg-brand/60" aria-hidden="true" />
          {eyebrow}
        </p>
        <Heading id={id} className="text-3xl font-semibold sm:text-4xl">
          {title}
        </Heading>
        {description && <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
