import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marks fictional seed records (isDemo) everywhere in the admin. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-dashed border-[color-mix(in_oklch,var(--warning)_70%,var(--foreground))] bg-warning/10 px-1.5 py-px align-middle text-[10px] font-bold tracking-wider whitespace-nowrap text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))] uppercase",
        className,
      )}
      title="Fictional demonstration record created by the seed — not official information"
    >
      <FlaskConical className="size-3" aria-hidden="true" /> Demo data
    </span>
  );
}
