import { Skeleton } from "@/components/ui/skeleton";
import { ProjectGridSkeleton } from "@/components/sections/project-grid-skeleton";

export default function Loading() {
  return (
    <div className="container-page pt-12 pb-20 sm:pt-16" role="status" aria-label="Loading projects">
      <div className="mb-12 max-w-2xl space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-full" />
      </div>
      <ProjectGridSkeleton />
    </div>
  );
}
