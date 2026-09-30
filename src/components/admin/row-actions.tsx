"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ActionState } from "@/lib/action-state";

function notify(result: ActionState) {
  if (result.status === "success") {
    if (result.message) toast.success(result.message);
  } else if (result.status === "error") {
    toast.error(result.message ?? "Something went wrong");
  }
}

/** Optimistic on/off toggle backed by a server action (publish, feature…). */
export function ToggleAction({
  checked,
  action,
  label,
}: {
  checked: boolean;
  action: (value: boolean) => Promise<ActionState>;
  label: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(checked);
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={optimistic}
      disabled={pending}
      aria-label={label}
      onCheckedChange={(value) =>
        startTransition(async () => {
          setOptimistic(value);
          notify(await action(value));
        })
      }
    />
  );
}

export function EditButton({ href, label }: { href: string; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="ghost" size="icon-sm">
          <Link href={href} aria-label={label}>
            <Pencil />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Edit</TooltipContent>
    </Tooltip>
  );
}

/** Confirmed, destructive action with a modal dialog. */
export function DeleteButton({
  action,
  itemName,
  description = "This action cannot be undone.",
  variant = "icon",
  onDeleted,
}: {
  action: () => Promise<ActionState>;
  itemName: string;
  description?: string;
  variant?: "icon" | "button";
  onDeleted?: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {variant === "icon" ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Delete ${itemName}`} className="text-muted-foreground hover:text-destructive">
            <Trash2 />
          </Button>
        ) : (
          <Button variant="outline" className="text-destructive hover:text-destructive">
            <Trash2 aria-hidden="true" /> Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemName}?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await action();
                notify(result);
                if (result.status === "success") onDeleted?.();
              });
            }}
          >
            {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
