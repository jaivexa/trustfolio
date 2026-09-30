"use client";

import { useActionState } from "react";
import { AlertCircle, LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { login } from "@/server/actions/auth";
import type { ActionState } from "@/lib/action-state";

const initial: ActionState = { status: "idle" };

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="mt-7 grid gap-5" noValidate aria-busy={pending}>
      {state.status === "error" && state.message && (
        <div role="alert" className="flex gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.message}
        </div>
      )}
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <FormField id="email" label="Email" errors={state.fieldErrors?.email}>
        {(props) => (
          <Input {...props} type="email" autoComplete="username" defaultValue={state.values?.email} autoFocus required />
        )}
      </FormField>
      <FormField id="password" label="Password" errors={state.fieldErrors?.password}>
        {(props) => <Input {...props} type="password" autoComplete="current-password" required />}
      </FormField>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <LogIn aria-hidden="true" />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
