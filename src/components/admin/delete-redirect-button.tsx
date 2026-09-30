"use client";

import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/admin/row-actions";
import type { ActionState } from "@/lib/action-state";

/** Delete from a detail page, then return to the list. */
export function DeleteRedirectButton({
  action,
  itemName,
  redirectTo,
}: {
  action: () => Promise<ActionState>;
  itemName: string;
  redirectTo: string;
}) {
  const router = useRouter();
  return <DeleteButton action={action} itemName={itemName} variant="button" onDeleted={() => router.replace(redirectTo)} />;
}
