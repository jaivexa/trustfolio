import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localePath } from "@/lib/i18n/paths";
import { getT } from "@/lib/i18n/server";

export default async function LocaleNotFound() {
  const { locale, t } = await getT();
  return (
    <div className="bg-kolam relative grid min-h-[70dvh] place-items-center px-4 py-20">
      <div className="relative max-w-md text-center">
        <p className="font-display text-6xl text-gold">404</p>
        <h1 className="mt-4 text-3xl">{t.errors.notFoundTitle}</h1>
        <p className="mt-3 text-muted-foreground">{t.errors.notFoundText}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href={localePath(locale, "/")}>
              <ArrowLeft aria-hidden="true" /> {t.actions.backToHome}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={localePath(locale, "/search")}>
              <Search aria-hidden="true" /> {t.nav.search}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
