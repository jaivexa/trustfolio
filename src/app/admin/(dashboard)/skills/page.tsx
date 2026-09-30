import type { Metadata } from "next";
import { Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/row-actions";
import { SkillDialog } from "@/components/admin/forms/skill-dialog";
import { SKILL_CATEGORY_LABELS } from "@/lib/constants";
import { deleteSkill, saveSkill } from "@/server/actions/admin/skills";
import { listSkills } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Skills" };

export default async function AdminSkillsPage() {
  const skills = await listSkills();
  const categories = Object.entries(SKILL_CATEGORY_LABELS) as [keyof typeof SKILL_CATEGORY_LABELS, string][];

  return (
    <>
      <PageHeader
        title="Skills"
        description="Grouped by category. Proficiency is shown as a subtle bar on the site."
        actions={<SkillDialog action={saveSkill.bind(null, null)} />}
      />
      {skills.length === 0 ? (
        <EmptyState icon={Wrench} title="No skills yet" description="Add the technologies and capabilities you want to highlight." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {categories.map(([category, label]) => {
            const items = skills.filter((skill) => skill.category === category);
            return (
              <section key={category} aria-labelledby={`skills-${category}`} className="rounded-2xl border bg-card shadow-soft">
                <header className="flex items-center justify-between border-b px-5 py-3.5">
                  <h2 id={`skills-${category}`} className="font-semibold">
                    {label}
                  </h2>
                  <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
                </header>
                {items.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-muted-foreground">No skills in this category.</p>
                ) : (
                  <ul className="divide-y">
                    {items.map((skill) => (
                      <li key={skill.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 truncate text-sm font-medium">
                            {skill.name}
                            {skill.isFeatured && <Badge variant="brand" className="py-0 text-[10px]">Core</Badge>}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1 w-24 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                              <div className="h-full rounded-full bg-brand" style={{ width: `${skill.proficiency}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {skill.proficiency}%{skill.years ? ` · ${skill.years}y` : ""}
                            </span>
                          </div>
                        </div>
                        <SkillDialog action={saveSkill.bind(null, skill.id)} skill={skill} />
                        <DeleteButton action={deleteSkill.bind(null, skill.id)} itemName={`“${skill.name}”`} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
