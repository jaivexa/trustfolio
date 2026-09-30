import type { z } from "zod";

/** Uniform result shape for every form-driven server action. */
export type ActionState<TValues = Record<string, string>> = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  /** Submitted values echoed back so forms keep input after a failed submit. */
  values?: Partial<TValues>;
  /** Optional id of a created record (e.g. to redirect or link). */
  id?: string;
};

export const idleState: ActionState = { status: "idle" };

export function fieldErrorsFrom(error: z.ZodError): Partial<Record<string, string[]>> {
  const errors: Partial<Record<string, string[]>> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_form";
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}

/** String-only snapshot of FormData (files are skipped). */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) values[key] = value;
  }
  return values;
}
