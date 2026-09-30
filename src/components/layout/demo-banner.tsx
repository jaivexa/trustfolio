import { FlaskConical } from "lucide-react";

/** Shown on every public page while fictional seed content is visible. */
export function DemoBanner({ label, message }: { label: string; message: string }) {
  return (
    <div role="note" className="border-b border-dashed border-warning/60 bg-warning/15 px-4 py-2 text-center text-xs leading-relaxed text-foreground sm:text-sm">
      <span className="mr-2 inline-flex items-center gap-1 rounded-full border border-warning/60 bg-background/70 px-2 py-0.5 align-middle text-[10px] font-bold tracking-wider uppercase">
        <FlaskConical className="size-3" aria-hidden="true" /> {label}
      </span>
      {message}
    </div>
  );
}
