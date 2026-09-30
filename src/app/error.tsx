"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[70dvh] place-items-center px-4" role="alert">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm text-destructive">Error</p>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">
          An unexpected error occurred while loading this page. Please try again.
        </p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>}
        <Button onClick={reset} className="mt-8">
          <RotateCcw aria-hidden="true" /> Try again
        </Button>
      </div>
    </main>
  );
}
