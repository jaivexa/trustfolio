"use client";

import { createContext, useActionState, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

type FormContextValue = {
  errors: Partial<Record<string, string[]>>;
  values: Partial<Record<string, string>> | undefined;
  pending: boolean;
};

const FormContext = createContext<FormContextValue>({ errors: {}, values: undefined, pending: false });

export const useEntityForm = () => useContext(FormContext);

/** Error list for a field, from the latest server response. */
export function useFieldError(name: string) {
  return useContext(FormContext).errors[name];
}

/** Submitted value echoed back after a failed save, else the initial value. */
export function useFieldDefault(name: string, initial: string | number | null | undefined) {
  const { values } = useContext(FormContext);
  const echoed = values?.[name];
  return echoed ?? (initial === null || initial === undefined ? "" : String(initial));
}

const idle: ActionState = { status: "idle" };

/**
 * Wraps an admin form: runs the server action, exposes field errors to inputs,
 * shows toasts, focuses the first invalid field, and navigates after create.
 */
export function EntityForm({
  action,
  children,
  submitLabel = "Save changes",
  cancelHref,
  successHref,
  className,
  inline = false,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  cancelHref?: string;
  /** Navigate here after a successful save. `{id}` is replaced with the saved record id. */
  successHref?: string;
  className?: string;
  /** Non-sticky footer, for forms inside dialogs. */
  inline?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, idle);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Saved");
      if (successHref) router.push(successHref.replace("{id}", state.id ?? ""));
    } else if (state.status === "error") {
      toast.error(state.message ?? "Please fix the highlighted fields.");
      const firstField = state.fieldErrors ? Object.keys(state.fieldErrors)[0] : undefined;
      if (firstField) {
        const element = formRef.current?.querySelector<HTMLElement>(`[name="${CSS.escape(firstField)}"], #${CSS.escape(firstField)}`);
        element?.focus();
      }
    }
  }, [state, successHref, router]);

  const formErrors = state.fieldErrors?._form;

  return (
    <FormContext.Provider
      value={{ errors: state.fieldErrors ?? {}, values: state.status === "error" ? state.values : undefined, pending }}
    >
      <form ref={formRef} action={formAction} noValidate aria-busy={pending} className={cn("space-y-6", className)}>
        {formErrors && (
          <div role="alert" className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {formErrors.join(" ")}
          </div>
        )}
        {children}
        <div
          className={cn(
            "flex items-center justify-end gap-2",
            !inline && "glass sticky bottom-0 z-10 -mx-4 border-t px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
          )}
        >
          {cancelHref && (
            <Button asChild variant="ghost">
              <Link href={cancelHref}>Cancel</Link>
            </Button>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            {pending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </FormContext.Provider>
  );
}

/** Visual grouping of related fields. */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-soft sm:p-6", className)}>
      <header className="mb-5">
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </header>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}
