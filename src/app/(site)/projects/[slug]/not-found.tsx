import Link from "next/link";
import { FolderSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function ProjectNotFound() {
  return (
    <div className="container-page py-24">
      <EmptyState
        icon={FolderSearch}
        title="This project isn't available"
        description="It may have been renamed or unpublished. Browse the full list of case studies instead."
        action={
          <Button asChild>
            <Link href="/projects">View all projects</Link>
          </Button>
        }
      />
    </div>
  );
}
