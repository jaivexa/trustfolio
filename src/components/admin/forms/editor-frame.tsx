import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { BilingualHeader, TranslationProvider, TranslationSummary } from "@/components/admin/bilingual";
import { PageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/admin/resource-table";
import { DemoBadge } from "@/components/admin/demo-badge";
import { RESOURCES, type ResourceKey } from "@/lib/admin-resources";
import type { ActionState } from "@/lib/action-state";
import { bulkAction } from "@/server/actions/admin/bulk";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Shared create/edit page frame: header, delete, live translation status,
 * a main column of content sections and an aside for publishing options.
 */
export function EditorFrame({
  resource,
  id,
  name,
  status,
  isDemo = false,
  publicHref,
  action,
  children,
  aside,
}: {
  resource: ResourceKey;
  id: string | null;
  name?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  /** Fictional seed record (shows a DEMO DATA badge and notice). */
  isDemo?: boolean;
  publicHref?: string | null;
  action: Action;
  children: React.ReactNode;
  aside: React.ReactNode;
}) {
  const config = RESOURCES[resource];
  return (
    <>
      <PageHeader
        title={id ? (name ?? `Edit ${config.singular.toLowerCase()}`) : `New ${config.singular.toLowerCase()}`}
        description={id ? `Editing ${config.singular.toLowerCase()}` : undefined}
        backHref={config.href}
        backLabel={config.label}
        actions={
          id && (
            <>
              {isDemo && <DemoBadge />}
              {status && <StatusBadge status={status} />}
              {publicHref && status === "PUBLISHED" && (
                <Button asChild variant="outline" size="sm">
                  <a href={`/en${publicHref}`} target="_blank" rel="noreferrer">
                    View on site <ExternalLink aria-hidden="true" />
                  </a>
                </Button>
              )}
              <DeleteButton
                variant="button"
                itemName={`this ${config.singular.toLowerCase()}`}
                description="The record is removed permanently. Uploaded files remain in the Media library. Archive it instead to keep it on record."
                action={bulkAction.bind(null, resource, [id], "delete")}
                redirectTo={config.href}
              />
            </>
          )
        }
      />
      {isDemo && (
        <p role="note" className="mb-6 rounded-xl border border-dashed border-warning/60 bg-warning/10 p-3 text-sm">
          <strong>Demo data.</strong> This is a fictional record created by the seed. Editing it does not make it official information, and{" "}
          <code className="text-xs">npm run db:demo:clear</code> removes it. Add official content as new records.
        </p>
      )}
      <TranslationProvider>
        <EntityForm action={action} submitLabel={id ? "Save changes" : `Create ${config.singular.toLowerCase()}`} cancelHref={config.href} successHref={id ? undefined : `${config.href}/{id}`}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="min-w-0 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <TranslationSummary />
                <p className="text-xs text-muted-foreground">English is the reference text. Tamil is entered by a person — it is never generated automatically.</p>
              </div>
              {children}
            </div>
            <aside className="space-y-6">{aside}</aside>
          </div>
        </EntityForm>
      </TranslationProvider>
    </>
  );
}

/** A content section with the "English | தமிழ்" column header. */
export function BilingualSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <FormSection title={title} description={description}>
      <BilingualHeader />
      {children}
    </FormSection>
  );
}

export const PRIVACY_NOTE =
  "Never enter Aadhaar numbers, personal ID numbers, private phone numbers or home addresses. Only information the person has agreed to publish.";
