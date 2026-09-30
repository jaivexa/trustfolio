"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as m from "motion/react-m";
import { ChevronDown, HeartHandshake, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle, type ThemeLabels } from "@/components/site/theme-toggle";
import { stripLocale } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export type NavItem = { key: string; label: string; href: string };

type HeaderProps = {
  locale: Locale;
  brand: { name: string; lang?: string; logoUrl: string | null; monogram: string };
  homeHref: string;
  nav: NavItem[];
  cta: { label: string; href: string };
  searchHref: string;
  labels: {
    primary: string;
    mobile: string;
    menu: string;
    openMenu: string;
    more: string;
    search: string;
    language: string;
    home: string;
    theme: ThemeLabels;
  };
};

/**
 * Sticky header. Desktop shows as many items as comfortably fit (fewer for
 * Tamil, whose labels are longer) plus a "More" menu; below `lg` everything
 * moves into an animated drawer.
 */
export function SiteHeader({ locale, brand, homeHref, nav, cta, searchHref, labels }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = stripLocale(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = nav.filter((item) => item.key !== "home");
  // Tamil labels are roughly twice as wide; show fewer inline items.
  const lgCount = locale === "ta" ? 2 : 4;
  const xlCount = locale === "ta" ? 3 : 6;
  const isActive = (href: string) => {
    const path = stripLocale(href);
    return path === "/" ? current === "/" : current === path || current.startsWith(`${path}/`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[background-color,border-color,box-shadow] duration-300",
        scrolled ? "glass border-b shadow-[0_1px_0_0_var(--border)]" : "border-b border-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3 lg:h-[4.5rem]">
        <Link href={homeHref} className="group flex min-w-0 shrink items-center gap-3 rounded-lg lg:shrink-0" aria-label={labels.home}>
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- small logo, any format (SVG allowed)
            <img src={brand.logoUrl} alt="" className="size-9 shrink-0 rounded-lg object-contain" />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground" aria-hidden="true">
              {brand.monogram ? <span className="text-sm font-semibold">{brand.monogram}</span> : <HeartHandshake className="size-4" />}
            </span>
          )}
          <span lang={brand.lang} className="line-clamp-2 max-w-[13rem] font-display text-[15px] leading-tight font-semibold sm:max-w-[16rem] lg:max-w-[12rem] xl:max-w-[15rem]">
            {brand.name}
          </span>
        </Link>

        <nav aria-label={labels.primary} className="hidden min-w-0 lg:block">
          <ul className="flex items-center gap-0.5">
            {items.map((item, index) => (
              <li key={item.key} className={cn(index >= xlCount ? "hidden" : index >= lgCount ? "hidden xl:block" : "block")}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm whitespace-nowrap transition-colors hover:text-foreground",
                    isActive(item.href) ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {items.length > lgCount && (
              <li className={cn(items.length <= xlCount && "xl:hidden")}>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-sm whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40">
                    {labels.more} <ChevronDown className="size-3.5" aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-48">
                    {items.slice(lgCount).map((item, offset) => (
                      <DropdownMenuItem key={item.key} asChild className={cn(lgCount + offset < xlCount && "xl:hidden")}>
                        <Link href={item.href}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            )}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href={searchHref} aria-label={labels.search}>
              <Search />
            </Link>
          </Button>
          <LanguageSwitcher locale={locale} label={labels.language} className="hidden sm:inline-flex" />
          <ThemeToggle labels={labels.theme} />
          <Button asChild size="sm" className={cn("ml-1 hidden", locale === "ta" ? "2xl:inline-flex" : "xl:inline-flex")}>
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={labels.openMenu}
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent id="mobile-menu" side="right" className="w-[88%] gap-0 p-0 sm:max-w-sm">
          <SheetTitle className="border-b px-5 py-4 pr-14 text-base" lang={brand.lang}>
            {brand.name}
          </SheetTitle>
          <SheetDescription className="sr-only">{labels.menu}</SheetDescription>
          <nav aria-label={labels.mobile} className="flex-1 overflow-y-auto px-3 py-4">
            <m.ul
              className="grid gap-0.5"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.03, delayChildren: 0.08 } } }}
            >
              {nav.map((item) => (
                <m.li key={item.key} variants={{ hidden: { opacity: 0, x: 12 }, show: { opacity: 1, x: 0 } }}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex rounded-xl px-3 py-3 text-base transition-colors hover:bg-accent",
                      isActive(item.href) && "bg-accent font-medium",
                    )}
                  >
                    {item.label}
                  </Link>
                </m.li>
              ))}
            </m.ul>
          </nav>
          <div className="grid gap-3 border-t p-4">
            <div className="flex items-center justify-between gap-3">
              <LanguageSwitcher locale={locale} label={labels.language} size="md" />
              <ThemeToggle labels={labels.theme} />
            </div>
            <Button asChild className="w-full">
              <Link href={cta.href} onClick={() => setOpen(false)}>
                {cta.label}
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
