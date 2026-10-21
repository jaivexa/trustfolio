"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { localePath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";

type NewsItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
};

type NewsTickerProps = {
  locale: "en" | "ta";
  items: NewsItem[];
};

export function NewsTicker({ locale, items }: NewsTickerProps) {
  const pathname = usePathname();
  const homeHref = localePath(locale, "/");
  const newsAnchor = `${homeHref}#news-title`;
  const isHome = pathname === homeHref || pathname === `${homeHref}/`;

  if (items.length === 0) return null;

  // Duplicate the list so the animation can loop seamlessly.
  const tickerItems = [...items, ...items];

  return (
    <div className="relative z-30 border-b bg-primary text-primary-foreground">
      <Link
        href={isHome ? "#news-title" : newsAnchor}
        aria-label={
          locale === "ta" ? "சமீபத்திய செய்திகளைக் காண்க" : "View latest news"
        }
        className="group flex min-h-10 items-center gap-3 overflow-hidden px-3 sm:px-5"
      >
        <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <Newspaper className="size-4" aria-hidden="true" />
          <span>{locale === "ta" ? "செய்திகள்" : "Latest News"}</span>
        </span>

        <span className="h-4 w-px shrink-0 bg-primary-foreground/30" />

        <span className="min-w-0 flex-1 overflow-hidden">
          <span
            className={cn(
              "news-ticker-track flex w-max items-center gap-10 whitespace-nowrap text-sm",
              "group-hover:[animation-play-state:paused]",
              "group-focus-visible:[animation-play-state:paused]",
            )}
          >
            {tickerItems.map((item, index) => (
              <span
                key={`${item.id}-${index}`}
                className="inline-flex items-center gap-2"
                aria-hidden={index >= items.length ? true : undefined}
              >
                <span className="size-1.5 shrink-0 rounded-full bg-current/70" />
                <span>{item.title}</span>
              </span>
            ))}
          </span>
        </span>

        <ArrowUpRight
          className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
