import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">This item doesn&apos;t exist</h1>
      <p className="mt-2 text-sm text-muted-foreground">It may have been deleted, or the link is wrong.</p>
      <Button asChild className="mt-6">
        <Link prefetch={false} href="/admin">Back to dashboard</Link>
      </Button>
    </div>
  );
}
