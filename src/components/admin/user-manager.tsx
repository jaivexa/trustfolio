"use client";

import { useActionState, useTransition } from "react";
import { Copy, KeyRound, LoaderCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeleteButton } from "@/components/admin/row-actions";
import type { ActionState } from "@/lib/action-state";
import { formatRelative } from "@/lib/utils";
import { createUser, deleteUser, updateUserRole } from "@/server/actions/admin/settings";

type User = { id: string; email: string; name: string | null; role: "ADMIN" | "EDITOR"; lastLoginAt: string | null; createdAt: string };

const ROLE_HELP = {
  ADMIN: "Full access, including trust profile, settings and users.",
  EDITOR: "Content only: projects, activities, evidence, gallery, news and messages.",
};

function RoleSelect({ user, disabled }: { user: User; disabled: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Select
      value={user.role}
      disabled={disabled || pending}
      onValueChange={(role) =>
        startTransition(async () => {
          const result = await updateUserRole(user.id, role as User["role"]);
          if (result.status === "success") toast.success(result.message ?? "Role updated");
          else toast.error(result.message ?? "Could not update the role");
        })
      }
    >
      <SelectTrigger className="h-8 w-32" aria-label={`Role of ${user.email}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ADMIN">Admin</SelectItem>
        <SelectItem value="EDITOR">Editor</SelectItem>
      </SelectContent>
    </Select>
  );
}

const idle: ActionState = { status: "idle" };

export function UserManager({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const [state, action, pending] = useActionState(createUser, idle);
  const temporary = state.status === "success" ? state.message?.split(": ").at(-1) : undefined;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="relative overflow-x-auto rounded-2xl border bg-card shadow-soft">
        <table className="w-full text-sm">
          <caption className="sr-only">Users</caption>
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">
                User
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Role
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium md:table-cell">
                Last sign-in
              </th>
              <th scope="col" className="px-5 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => {
              const self = user.id === currentUserId;
              return (
                <tr key={user.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium">
                      {user.name ?? user.email} {self && <Badge variant="brand">You</Badge>}
                    </p>
                    {user.name && <p className="text-xs text-muted-foreground">{user.email}</p>}
                  </td>
                  <td className="px-3 py-3">
                    <RoleSelect user={user} disabled={self} />
                  </td>
                  <td className="hidden px-3 py-3 text-xs text-muted-foreground md:table-cell">{user.lastLoginAt ? formatRelative(user.lastLoginAt) : "Never"}</td>
                  <td className="px-5 py-3 text-right">
                    {!self && <DeleteButton action={deleteUser.bind(null, user.id)} itemName={user.email} description="They lose access immediately." />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section aria-labelledby="add-user" className="h-fit rounded-2xl border bg-card p-5 shadow-soft">
        <h2 id="add-user" className="mb-1 flex items-center gap-2 font-semibold">
          <UserPlus className="size-4 text-brand" aria-hidden="true" /> Add a user
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">A temporary password is shown once. Share it privately; the person should change it after signing in.</p>
        <form action={action} className="grid gap-3" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="new-email">Email</Label>
            <Input id="new-email" name="email" type="email" autoComplete="off" required aria-invalid={state.fieldErrors?.email ? true : undefined} defaultValue={state.status === "error" ? state.values?.email : ""} />
            {state.fieldErrors?.email && <p className="text-xs font-medium text-destructive">{state.fieldErrors.email[0]}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-name">Name</Label>
            <Input id="new-name" name="name" autoComplete="off" defaultValue={state.status === "error" ? state.values?.name : ""} />
          </div>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Role</legend>
            {(["EDITOR", "ADMIN"] as const).map((role) => (
              <label key={role} className="flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm has-checked:border-brand has-checked:bg-brand-soft">
                <input type="radio" name="role" value={role} defaultChecked={role === "EDITOR"} className="mt-0.5 accent-[var(--brand)]" />
                <span>
                  <span className="font-medium">{role === "ADMIN" ? "Admin" : "Editor"}</span>
                  <span className="block text-xs text-muted-foreground">{ROLE_HELP[role]}</span>
                </span>
              </label>
            ))}
          </fieldset>
          {state.status === "error" && state.message && !state.fieldErrors && <p className="text-sm font-medium text-destructive">{state.message}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <UserPlus aria-hidden="true" />} Add user
          </Button>
        </form>
        {temporary && (
          <div role="status" className="mt-4 rounded-xl border border-success/30 bg-success/10 p-3 text-sm">
            <p className="flex items-center gap-1.5 font-medium">
              <KeyRound className="size-4" aria-hidden="true" /> Temporary password
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-background px-2 py-1 font-mono text-xs break-all">{temporary}</code>
              <Button type="button" variant="outline" size="icon-sm" aria-label="Copy password" onClick={() => void navigator.clipboard.writeText(temporary).then(() => toast.success("Copied"))}>
                <Copy />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">It will not be shown again.</p>
          </div>
        )}
      </section>
    </div>
  );
}
