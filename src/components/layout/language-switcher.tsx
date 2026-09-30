"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import { switchLocalePath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";

/**
 * "English | தமிழ்" segmented switch. Keeps the current page (slugs are shared
 * across languages) and remembers the choice for future visits.
 */
export function LanguageSwitcher({
  locale,
  label,
  className,
  size = "sm",
}: {
  locale: Locale;
  label: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className={cn("inline-flex items-center rounded-full border bg-background/70 p-0.5", className)}>
      {LOCALES.map((target) => {
        const active = target === locale;
        return (
          <Link
            key={target}
            href={switchLocalePath(pathname, target)}
            hrefLang={target}
            lang={target}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
            }}
            className={cn(
              "rounded-full font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {LOCALE_LABELS[target]}
          </Link>
        );
      })}
    </nav>
  );
}
