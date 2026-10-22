"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  HandHeart,
  LoaderCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { volunteerSchema } from "@/lib/validations/volunteer";
import { submitVolunteer } from "@/server/actions/volunteer";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type VolunteerLabels = Dictionary["volunteer"];
type VolunteerState = Awaited<ReturnType<typeof submitVolunteer>>;

const initialState = { status: "idle" } as VolunteerState;

const interestOptions = [
  "Community outreach",
  "Education",
  "Environment",
  "Fundraising",
  "Event support",
  "Administration",
] as const;

const skillOptions = [
  "Communication",
  "Teaching",
  "Organising",
  "Design",
  "Technology",
  "Translation",
] as const;

type ActivityOption = { id: string; title: string };

export function VolunteerModal({
  locale,
  labels,
  activityId,
  activityTitle,
  activities = [],
  triggerLabel,
  triggerClassName,
}: {
  locale: Locale;
  labels: VolunteerLabels;
  activityId?: string;
  activityTitle?: string;
  activities?: ActivityOption[];
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const action = submitVolunteer.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [open, setOpen] = useState(false);
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<string, string[]>>
  >({});
  const [startedAt, setStartedAt] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const statusRef = useRef<HTMLDivElement>(null);

  const clearError = (name: string) => {
    setClientErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const msg = (key: string) =>
    (labels.errors as Record<string, string>)[key] ?? key;

  useEffect(() => {
    // The timestamp is client-only and is refreshed whenever the form is reset.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartedAt(Date.now());
  }, [formKey]);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const errors = { ...state.fieldErrors, ...clientErrors };
  const values = state.status === "error" ? (state.values ?? {}) : {};
  const field = (name: string) => ({
    id: `volunteer-${name}`,
    errors: errors[name],
  });

  const validateForm = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      city: String(formData.get("city") ?? ""),
      interests: formData.getAll("interests").map(String),
      skills: formData.getAll("skills").map(String),
      availability: String(formData.get("availability") ?? ""),
      activityId: String(formData.get("activityId") ?? ""),
      motivation: String(formData.get("motivation") ?? ""),
      goals: String(formData.get("goals") ?? ""),
      remarks: String(formData.get("remarks") ?? ""),
    };

    const result = volunteerSchema.safeParse(payload);
    if (!result.success) {
      event.preventDefault();
      const next: Partial<Record<string, string[]>> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "");
        (next[key] ??= []).push(msg(issue.message));
      }
      setClientErrors(next);
      const firstField = result.error.issues[0]?.path[0];
      if (typeof firstField === "string") {
        window.setTimeout(() => {
          document.getElementById(`volunteer-${firstField}`)?.focus();
        }, 0);
      }
      return;
    }

    setClientErrors({});
  };

  const resetForm = () => {
    setClientErrors({});
    setFormKey((key) => key + 1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="lg" className={triggerClassName}>
          <HandHeart aria-hidden="true" />
          {triggerLabel ?? labels.openButton}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl p-0 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="border-b bg-muted/30 px-6 py-5 sm:px-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-2xl">
              <HandHeart className="size-6 text-primary" aria-hidden="true" />
              {labels.title}
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-2xl">
              {labels.description}
            </DialogDescription>
          </DialogHeader>
          {activityTitle && (
            <p className="mt-3 rounded-lg border bg-background px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                {labels.applyingFor}:{" "}
              </span>
              <span className="font-medium">{activityTitle}</span>
            </p>
          )}
        </div>

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          {state.status === "success" ? (
            <div
              ref={statusRef}
              tabIndex={-1}
              role="status"
              className="flex flex-col items-center py-10 text-center outline-none"
            >
              <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="size-7" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-xl">
                {labels.successTitle}
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {state.message}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
              >
                {labels.closeButton}
              </Button>
            </div>
          ) : (
            <form
              key={formKey}
              action={formAction}
              onSubmit={validateForm}
              noValidate
              aria-busy={pending}
              className="grid gap-5 pt-6"
            >
              {state.status === "error" && state.message && (
                <div
                  ref={statusRef}
                  tabIndex={-1}
                  role="alert"
                  className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive outline-none"
                >
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{state.message}</span>
                </div>
              )}

              {activityId ? (
                <input type="hidden" name="activityId" value={activityId} />
              ) : activities.length > 0 ? (
                <FormField
                  {...field("activityId")}
                  label={labels.activityLabel}
                  description={labels.activityHint}
                >
                  {(props) => (
                    <select
                      {...props}
                      name="activityId"
                      defaultValue=""
                      onChange={() => clearError("activityId")}
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
                    >
                      <option value="">{labels.generalOption}</option>
                      {activities.map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {activity.title}
                        </option>
                      ))}
                    </select>
                  )}
                </FormField>
              ) : (
                <input type="hidden" name="activityId" value="" />
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  {...field("fullName")}
                  label={labels.fullName}
                  required
                >
                  {(props) => (
                    <Input
                      {...props}
                      name="fullName"
                      autoComplete="name"
                      defaultValue={values.fullName}
                      maxLength={100}
                      onChange={() => clearError("fullName")}
                    />
                  )}
                </FormField>
                <FormField {...field("email")} label={labels.email} required>
                  {(props) => (
                    <Input
                      {...props}
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      defaultValue={values.email}
                      maxLength={254}
                      onChange={() => clearError("email")}
                    />
                  )}
                </FormField>
                <FormField {...field("phone")} label={labels.phone}>
                  {(props) => (
                    <Input
                      {...props}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      defaultValue={values.phone}
                      maxLength={20}
                      onChange={() => clearError("phone")}
                    />
                  )}
                </FormField>
                <FormField {...field("city")} label={labels.city}>
                  {(props) => (
                    <Input
                      {...props}
                      name="city"
                      autoComplete="address-level2"
                      defaultValue={values.city}
                      maxLength={100}
                      onChange={() => clearError("city")}
                    />
                  )}
                </FormField>
              </div>

              <fieldset className="grid gap-3">
                <legend className="text-sm font-medium">
                  {labels.interests}
                </legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {interestOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="interests"
                        value={option}
                        defaultChecked={
                          Array.isArray(values.interests) &&
                          values.interests.includes(option)
                        }
                        onChange={() => clearError("interests")} className="size-4 shrink-0 rounded border-input accent-primary"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.interests?.[0] && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.interests[0]}
                  </p>
                )}
              </fieldset>

              <fieldset className="grid gap-3">
                <legend className="text-sm font-medium">{labels.skills}</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {skillOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="skills"
                        value={option}
                        defaultChecked={
                          Array.isArray(values.skills) &&
                          values.skills.includes(option)
                        }
                        onChange={() => clearError("skills")} className="size-4 shrink-0 rounded border-input accent-primary"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.skills?.[0] && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.skills[0]}
                  </p>
                )}
              </fieldset>

              <FormField {...field("availability")} label={labels.availability}>
                {(props) => (
                  <Input
                    {...props}
                    name="availability"
                    defaultValue={values.availability}
                    maxLength={200}
                    placeholder={labels.availabilityHint}
                    onChange={() => clearError("availability")}
                  />
                )}
              </FormField>

              <FormField
                {...field("motivation")}
                label={labels.motivation}
                description={labels.motivationHint}
                required
              >
                {(props) => (
                  <Textarea
                    {...props}
                    name="motivation"
                    rows={4}
                    className="min-h-28"
                    defaultValue={values.motivation}
                    maxLength={3000}
                    onChange={() => clearError("motivation")}
                  />
                )}
              </FormField>

              <FormField
                {...field("goals")}
                label={labels.goals}
                description={labels.goalsHint}
                required
              >
                {(props) => (
                  <Textarea
                    {...props}
                    name="goals"
                    rows={4}
                    className="min-h-28"
                    defaultValue={values.goals}
                    maxLength={3000}
                    onChange={() => clearError("goals")}
                  />
                )}
              </FormField>

              <FormField {...field("remarks")} label={labels.remarks}>
                {(props) => (
                  <Textarea
                    {...props}
                    name="remarks"
                    rows={3}
                    defaultValue={values.remarks}
                    maxLength={3000}
                    onChange={() => clearError("remarks")}
                  />
                )}
              </FormField>

              {/* Keep the existing server-side honeypot and minimum-fill-time checks. */}
              <div
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
              >
                <label>
                  Company
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue=""
                  />
                </label>
              </div>
              <input type="hidden" name="startedAt" value={startedAt} />

              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  {labels.privacy}
                </p>
                <Button
                  type="submit"
                  size="lg"
                  disabled={pending}
                  className="w-full sm:w-auto"
                >
                  {pending ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Send aria-hidden="true" />
                  )}
                  {pending ? labels.sending : labels.submitButton}
                </Button>
              </div>
              <p className="sr-only" role="status" aria-live="polite">
                {pending ? labels.sending : ""}
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
