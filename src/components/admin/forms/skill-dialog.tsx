"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EntityForm } from "@/components/admin/entity-form";
import { FieldGrid, SelectField, SwitchField, TextField } from "@/components/admin/fields";
import { SKILL_CATEGORY_LABELS } from "@/lib/constants";
import type { ActionState } from "@/lib/action-state";

const CATEGORY_OPTIONS = Object.entries(SKILL_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

type Skill = { name: string; category: string; proficiency: number; years: number | null; isFeatured: boolean; sortOrder: number };

/** Create/edit a skill in a modal. Closes itself after a successful save. */
export function SkillDialog({
  action,
  skill,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  skill?: Skill;
}) {
  const [open, setOpen] = useState(false);
  const [proficiency, setProficiency] = useState(skill?.proficiency ?? 70);

  const wrapped = async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.status === "success") setOpen(false);
    return result;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {skill ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${skill.name}`}>
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus aria-hidden="true" /> Add skill
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{skill ? "Edit skill" : "Add skill"}</DialogTitle>
          <DialogDescription>Skills are grouped by category on the public site.</DialogDescription>
        </DialogHeader>
        <EntityForm action={wrapped} submitLabel={skill ? "Save" : "Add skill"} inline className="space-y-5">
          <TextField name="name" label="Name" required defaultValue={skill?.name} maxLength={60} autoFocus />
          <SelectField name="category" label="Category" options={CATEGORY_OPTIONS} defaultValue={skill?.category ?? "FRONTEND"} />
          <div className="grid gap-2">
            <label htmlFor="proficiency" className="flex items-center justify-between text-sm font-medium">
              Proficiency <span className="text-muted-foreground tabular-nums">{proficiency}%</span>
            </label>
            <input
              id="proficiency"
              name="proficiency"
              type="range"
              min={0}
              max={100}
              step={5}
              value={proficiency}
              onChange={(e) => setProficiency(Number(e.target.value))}
              className="w-full accent-[var(--brand)]"
            />
          </div>
          <FieldGrid>
            <TextField name="years" label="Years" type="number" min={0} max={60} defaultValue={skill?.years} />
            <TextField name="sortOrder" label="Sort order" type="number" min={0} defaultValue={skill?.sortOrder ?? 0} />
          </FieldGrid>
          <SwitchField name="isFeatured" label="Core strength" description="Shown in the About section." defaultChecked={skill?.isFeatured ?? false} />
        </EntityForm>
      </DialogContent>
    </Dialog>
  );
}
