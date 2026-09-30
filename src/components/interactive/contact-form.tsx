"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { AlertCircle, CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { contactSchema, type ContactField } from "@/lib/validations/contact";
import type { ContactState } from "@/server/actions/contact";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Labels = Dictionary["contact"];

const initialState: ContactState = { status: "idle" };

export function ContactForm({
  action,
  labels,
}: {
  action: (prev: ContactState, formData: FormData) => Promise<ContactState>;
  labels: Labels;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<Partial<Record<string, string[]>>>({});
  const [startedAt, setStartedAt] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const [dismissed, setDismissed] = useState<ContactState | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const msg = (key: string) => (labels.errors as Record<string, string>)[key] ?? key;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only timestamp for spam timing
    setStartedAt(Date.now());
  }, [formKey]);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const errors = { ...state.fieldErrors, ...clientErrors };

  const validateField = (field: ContactField, value: string) => {
    const result = contactSchema.shape[field].safeParse(value);
    setClientErrors((prev) => ({ ...prev, [field]: result.success ? undefined : [msg(result.error.issues[0]!.message)] }));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const result = contactSchema.safeParse(data);
    if (!result.success) {
      event.preventDefault();
      const next: Partial<Record<string, string[]>> = {};
      for (const issue of result.error.issues) (next[String(issue.path[0])] ??= []).push(msg(issue.message));
      setClientErrors(next);
      const first = result.error.issues[0]?.path[0];
      if (typeof first === "string") document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setClientErrors({});
  };

  if (state.status === "success" && dismissed !== state) {
    return (
      <m.div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl border bg-card px-6 py-14 text-center shadow-soft outline-none"
      >
        <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-5 font-display text-xl">{labels.successTitle}</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{state.message}</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setDismissed(state);
            setFormKey((key) => key + 1);
          }}
        >
          {labels.sendAnother}
        </Button>
      </m.div>
    );
  }

  const values = state.status === "error" ? (state.values ?? {}) : {};
  const field = (name: ContactField) => ({ id: `contact-${name}`, errors: errors[name] });
  const blur = (name: ContactField) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    e.target.value && validateField(name, e.target.value);

  return (
    <form
      key={formKey}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-busy={pending}
      className="relative grid gap-5 rounded-2xl border bg-card p-6 shadow-soft sm:p-8"
    >
      <AnimatePresence>
        {state.status === "error" && state.message && (
          <m.div
            ref={statusRef}
            tabIndex={-1}
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive outline-none"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {state.message}
          </m.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField {...field("name")} label={labels.name} required>
          {(props) => <Input {...props} name="name" autoComplete="name" defaultValue={values.name} maxLength={100} onBlur={blur("name")} />}
        </FormField>
        <FormField {...field("email")} label={labels.emailLabel} required>
          {(props) => (
            <Input {...props} name="email" type="email" inputMode="email" autoComplete="email" defaultValue={values.email} maxLength={254} onBlur={blur("email")} />
          )}
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField {...field("phone")} label={labels.phoneLabel}>
          {(props) => (
            <Input {...props} name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={values.phone} maxLength={20} onBlur={blur("phone")} required={false} />
          )}
        </FormField>
        <FormField {...field("subject")} label={labels.subject} required>
          {(props) => <Input {...props} name="subject" defaultValue={values.subject} maxLength={150} onBlur={blur("subject")} />}
        </FormField>
      </div>
      <FormField {...field("message")} label={labels.message} required description={labels.messageHint}>
        {(props) => (
          <Textarea {...props} name="message" rows={6} defaultValue={values.message} maxLength={5000} className="min-h-36" onBlur={blur("message")} />
        )}
      </FormField>

      {/* Anti-spam: hidden honeypot + render timestamp */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />

      <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{labels.privacy}</p>
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
          {pending ? labels.sending : labels.send}
        </Button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {pending ? labels.sendingStatus : ""}
      </p>
    </form>
  );
}
