import { Skeleton } from "@/components/ui/skeleton";

export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden="true">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:justify-between">
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-full lg:w-72" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border bg-card">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 pt-3">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
