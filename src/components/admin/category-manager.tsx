"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BilingualField, BilingualHeader } from "@/components/admin/bilingual";
import { EntityForm } from "@/components/admin/entity-form";
import { FieldGrid, SlugField, TextField } from "@/components/admin/fields";
import { DeleteButton } from "@/components/admin/row-actions";
import { deleteCategory, saveCategory } from "@/server/actions/admin/trust";

type CategoryType = "ACTIVITY" | "PROJECT" | "DOCUMENT" | "NEWS" | "GALLERY";
type Category = { id: string; type: CategoryType; slug: string; nameEn: string; nameTa: string | null; sortOrder: number; usage: number };

const TYPES: { type: CategoryType; label: string }[] = [
  { type: "ACTIVITY", label: "Activities & impact areas" },
  { type: "PROJECT", label: "Projects" },
  { type: "DOCUMENT", label: "Documents" },
  { type: "NEWS", label: "News & events" },
  { type: "GALLERY", label: "Gallery" },
];

type Editing = { type: CategoryType; category: Category | null } | null;

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {TYPES.map(({ type, label }) => {
        const list = categories.filter((c) => c.type === type);
        return (
          <section key={type} aria-labelledby={`cat-${type}`} className="rounded-2xl border bg-card shadow-soft">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 id={`cat-${type}`} className="font-semibold">
                {label}
              </h2>
              <Button size="sm" variant="outline" onClick={() => setEditing({ type, category: null })}>
                <Plus aria-hidden="true" /> Add
              </Button>
            </div>
            {list.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No categories.</p>
            ) : (
              <ul className="divide-y">
                {list.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{c.nameEn}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.nameTa ? <span lang="ta">{c.nameTa}</span> : <span className="text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]">Tamil missing</span>}
                        {" · "}
                        {c.usage} in use
                      </p>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ type, category: c })} aria-label={`Edit ${c.nameEn}`}>
                      <Pencil />
                    </Button>
                    <DeleteButton
                      action={deleteCategory.bind(null, c.id)}
                      itemName={`“${c.nameEn}”`}
                      description={c.usage ? `${c.usage} items use this category; they will become uncategorised.` : undefined}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.category ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>{TYPES.find((t) => t.type === editing?.type)?.label}</DialogDescription>
          </DialogHeader>
          {editing && (
            <EntityForm
              key={editing.category?.id ?? `new-${editing.type}`}
              action={saveCategory.bind(null, editing.category?.id ?? null)}
              inline
              submitLabel={editing.category ? "Save" : "Create"}
              onSuccess={() => setEditing(null)}
            >
              <input type="hidden" name="type" value={editing.type} />
              <BilingualHeader />
              <BilingualField name="name" label="Name" required maxLength={80} defaultEn={editing.category?.nameEn} defaultTa={editing.category?.nameTa} />
              <FieldGrid>
                <SlugField defaultValue={editing.category?.slug} source="nameEn" />
                <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={editing.category?.sortOrder ?? 0} />
              </FieldGrid>
            </EntityForm>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
