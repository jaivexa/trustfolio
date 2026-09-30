"use client";

import { useTransition } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { refreshPublicCache } from "@/server/actions/admin/cache";

export function RefreshCacheButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await refreshPublicCache();
          if (result.status === "success") toast.success(result.message ?? "Refreshed");
          else toast.error(result.message ?? "Could not refresh");
        })
      }
    >
      {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />} Refresh public website
    </Button>
  );
}
