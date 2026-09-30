import { Skeleton } from "@/components/ui/skeleton";

/** Page-level skeleton that mirrors PageIntro + a card grid to avoid layout shift. */
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <div className="border-b">
        <div className="container-page space-y-5 pt-14 pb-16">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-full max-w-lg" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
      </div>
      <div className="container-page grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border bg-card">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
