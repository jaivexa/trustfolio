import { Cloud, Code2, Database, Layers, Server, Wrench, type LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProficiencyBar } from "@/components/sections/proficiency-bar";
import { Section, SectionHeading } from "@/components/site/section";
import type { SkillGroupDTO } from "@/server/queries/types";
import type { SkillCategory } from "@/generated/prisma/enums";

const CATEGORY_ICONS: Record<SkillCategory, LucideIcon> = {
  FRONTEND: Code2,
  BACKEND: Server,
  DATABASE: Database,
  DEVOPS: Cloud,
  TOOLS: Wrench,
  OTHER: Layers,
};

function level(proficiency: number) {
  if (proficiency >= 90) return "Expert";
  if (proficiency >= 75) return "Advanced";
  if (proficiency >= 55) return "Proficient";
  return "Familiar";
}

export function SkillsSection({ groups }: { groups: SkillGroupDTO[] }) {
  if (groups.length === 0) return null;

  return (
    <Section id="skills" labelledBy="skills-title" className="bg-muted/25">
      <SectionHeading
        id="skills-title"
        eyebrow="Skills"
        title="A toolkit refined through real products"
        description="Depth where it matters, breadth to connect the dots — from interface to infrastructure."
      />
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const Icon = CATEGORY_ICONS[group.category];
          return (
            <StaggerItem key={group.category} as="article" className="surface flex flex-col p-6">
              <header className="mb-5 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="font-semibold">{group.label}</h3>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">{group.skills.length}</span>
              </header>
              <ul className="space-y-4">
                {group.skills.map((skill) => (
                  <li key={skill.id}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {level(skill.proficiency)}
                        {skill.years ? ` · ${skill.years}y` : ""}
                      </span>
                    </div>
                    <ProficiencyBar value={skill.proficiency} label={skill.name} />
                  </li>
                ))}
              </ul>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
