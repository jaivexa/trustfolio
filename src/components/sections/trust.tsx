import { Award, Briefcase, Cpu, FolderKanban, Handshake, Trophy } from "lucide-react";
import { Counter } from "@/components/motion/counter";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { TrustStatsDTO } from "@/server/queries/types";

export function TrustSection({ stats }: { stats: TrustStatsDTO }) {
  const items = [
    { label: "Years of experience", value: stats.yearsExperience, suffix: "+", icon: Briefcase },
    { label: "Projects completed", value: stats.projectsCompleted, suffix: "+", icon: FolderKanban },
    { label: "Clients served", value: stats.clientsServed, suffix: "", icon: Handshake },
    { label: "Certifications", value: stats.certifications, suffix: "", icon: Award },
    { label: "Technologies", value: stats.technologies, suffix: "", icon: Cpu },
    { label: "Achievements", value: stats.achievements, suffix: "", icon: Trophy },
  ].filter((item) => item.value > 0);

  if (items.length === 0) return null;

  return (
    <section id="trust" aria-label="Track record" className="scroll-mt-20 py-10 sm:py-14">
      <div className="container-page">
        <Stagger className="grid grid-cols-2 overflow-hidden rounded-3xl border bg-card shadow-soft sm:grid-cols-3 lg:grid-cols-6">
          {items.map(({ label, value, suffix, icon: Icon }) => (
            <StaggerItem
              key={label}
              className="group relative flex flex-col gap-3 border-b border-r p-5 transition-colors hover:bg-muted/40 sm:p-6 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(3n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(6n)]:border-r-0"
            >
              <Icon className="size-4 text-brand transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
              <p className="text-3xl font-semibold tracking-tight sm:text-[2rem]">
                <Counter value={value} suffix={suffix} />
              </p>
              <p className="text-xs leading-snug text-muted-foreground sm:text-sm">{label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
