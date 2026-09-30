import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div aria-hidden="true" className="bg-grid mask-radial absolute inset-0 -z-10" />
      <div className="text-center">
        <p className="font-mono text-sm text-brand">404</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Page not found</h1>
        <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <ArrowLeft aria-hidden="true" /> Back to home
          </Link>
        </Button>
      </div>
    </main>
  );
}
