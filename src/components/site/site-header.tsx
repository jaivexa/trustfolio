"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

type HeaderProps = {
  name: string;
  ctaHref: string;
  isAvailable: boolean;
};

export function SiteHeader({ name, ctaHref, isAvailable }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation and lock body scroll while open.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync UI with route changes
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[background-color,border-color,box-shadow] duration-300",
        scrolled || open ? "glass border-b shadow-[0_1px_0_0_var(--border)]" : "border-b border-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-full font-semibold tracking-tight"
          aria-label={`${name} — home`}
        >
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-soft transition-transform group-hover:-rotate-6">
            {initials(name)}
          </span>
          <span className="hidden sm:inline">{name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    isActive(item.href) && "text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href={ctaHref}>
              {isAvailable && <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />}
              Let&apos;s talk
              <ArrowUpRight />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-menu"
            aria-label="Mobile"
            className="border-t md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <m.ul
              className="container-page flex flex-col gap-1 py-4"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.04 } } }}
            >
              {PUBLIC_NAV.map((item) => (
                <m.li key={item.href} variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-accent"
                  >
                    {item.label}
                    <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </m.li>
              ))}
              <m.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="pt-2">
                <Button asChild className="w-full">
                  <Link href={ctaHref} onClick={() => setOpen(false)}>
                    Let&apos;s talk
                  </Link>
                </Button>
              </m.li>
            </m.ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
