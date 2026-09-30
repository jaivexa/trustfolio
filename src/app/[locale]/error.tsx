"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RotateCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { en } from "@/lib/i18n/dictionaries/en";
import { ta } from "@/lib/i18n/dictionaries/ta";

/**
 * Localized error boundary. Distinguishes being offline from a server/database
 * failure so visitors know whether retrying on their side can help.
 */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname();
  const t = pathname.startsWith("/ta") ? ta : en;
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    console.error(error);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser connectivity once
    setOffline(typeof navigator !== "undefined" && !navigator.onLine);
  }, [error]);

  const title = offline ? t.errors.offlineTitle : error.digest ? t.errors.databaseTitle : t.errors.errorTitle;
  const text = offline ? t.errors.offlineText : error.digest ? t.errors.databaseText : t.errors.errorText;

  return (
    <div role="alert" className="grid min-h-[60dvh] place-items-center px-4 py-20">
      <div className="max-w-md text-center">
        {offline && <WifiOff className="mx-auto mb-4 size-8 text-muted-foreground" aria-hidden="true" />}
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">{text}</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">{t.errors.reference.replace("{digest}", error.digest)}</p>}
        <Button onClick={reset} className="mt-8">
          <RotateCcw aria-hidden="true" /> {t.actions.tryAgain}
        </Button>
      </div>
    </div>
  );
}
