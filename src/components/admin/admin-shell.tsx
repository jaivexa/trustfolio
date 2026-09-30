"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BadgeCheck,
  BookOpenText,
  CalendarClock,
  ChartColumn,
  ExternalLink,
  FileText,
  FolderKanban,
  FolderOpen,
  History,
  Images,
  Inbox,
  KeyRound,
  Landmark,
  Languages,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  MessageCircleQuestion,
  MessageSquareQuote,
  Newspaper,
  NotebookText,
  Settings,
  Share2,
  Tags,
  Target,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { logout } from "@/server/actions/auth";
import { cn, initials } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; badgeKey?: "unread"; adminOnly?: boolean };

const NAV: { heading: string; items: NavItem[] }[] = [
  { heading: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    heading: "Portfolio",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/activities", label: "Activities", icon: CalendarClock },
      { href: "/admin/impact", label: "Impact metrics", icon: ChartColumn },
      { href: "/admin/stories", label: "Stories", icon: BookOpenText },
    ],
  },
  {
    heading: "Trust",
    items: [
      { href: "/admin/trust", label: "Trust profile", icon: Landmark, adminOnly: true },
      { href: "/admin/trustees", label: "Trustees & founder", icon: Users },
      { href: "/admin/objectives", label: "Objectives", icon: Target },
      { href: "/admin/history", label: "History", icon: History },
      { href: "/admin/faqs", label: "FAQ", icon: MessageCircleQuestion },
    ],
  },
  {
    heading: "Evidence",
    items: [
      { href: "/admin/documents", label: "Documents", icon: FileText },
      { href: "/admin/reports", label: "Annual reports", icon: NotebookText },
      { href: "/admin/certificates", label: "Certificates & awards", icon: Award },
      { href: "/admin/verification", label: "Verification records", icon: BadgeCheck },
    ],
  },
  {
    heading: "Content",
    items: [
      { href: "/admin/news", label: "News & events", icon: Newspaper },
      { href: "/admin/gallery", label: "Gallery", icon: Images },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/categories", label: "Categories", icon: Tags },
      { href: "/admin/media", label: "Media library", icon: FolderOpen },
    ],
  },
  {
    heading: "Manage",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Inbox, badgeKey: "unread" },
      { href: "/admin/translations", label: "Translations", icon: Languages },
      { href: "/admin/settings", label: "SEO & settings", icon: Settings, adminOnly: true },
      { href: "/admin/navigation", label: "Navigation", icon: ListTree, adminOnly: true },
      { href: "/admin/social", label: "Social links", icon: Share2, adminOnly: true },
      { href: "/admin/users", label: "Users", icon: UserRound, adminOnly: true },
      { href: "/admin/account", label: "My account", icon: KeyRound },
    ],
  },
];

function SidebarNav({ unread, role, onNavigate }: { unread: number; role: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <nav aria-label="Admin" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {NAV.map((group) => ({ ...group, items: group.items.filter((item) => !item.adminOnly || role === "ADMIN") })).map((group) => (
        <div key={group.heading}>
          <p className="mb-1.5 px-3 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">{group.heading}</p>
          <ul className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon, badgeKey }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    prefetch={false}
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                      active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("size-4", active && "text-brand")} aria-hidden="true" />
                    {label}
                    {badgeKey === "unread" && unread > 0 && (
                      <span className="ml-auto rounded-full bg-brand px-1.5 py-px text-[11px] font-medium text-brand-foreground tabular-nums">
                        {unread}
                        <span className="sr-only"> unread</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function UserCard({ name, email, role }: { name: string; email: string; role: string }) {
  return (
    <div className="border-t p-3">
      <div className="flex items-center gap-3 rounded-xl p-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="truncate font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {email} · {role.toLowerCase()}
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
            <LogOut />
          </Button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({
  user,
  siteName,
  unread,
  children,
}: {
  user: { name: string; email: string; role: string };
  siteName: string;
  unread: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const brand = (
    <Link prefetch={false} href="/admin" className="flex min-w-0 items-center gap-2.5 px-3 font-semibold tracking-tight" title={siteName}>
      <span className="grid size-8 place-items-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
        {initials(siteName)}
      </span>
      <span className="truncate">{siteName}</span>
    </Link>
  );

  return (
    <div className="min-h-dvh bg-muted/30 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-background lg:flex">
        <div className="flex h-16 items-center border-b px-3">{brand}</div>
        <SidebarNav unread={unread} role={user.role} />
        <UserCard {...user} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 gap-0 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <div className="flex h-16 items-center border-b px-3">{brand}</div>
          <SidebarNav unread={unread} role={user.role} onNavigate={() => setOpen(false)} />
          <UserCard {...user} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-col">
        <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu />
          </Button>
          <div className="min-w-0 lg:hidden">{brand}</div>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link prefetch={false} href="/en" target="_blank">
                View site <ExternalLink aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </header>
        <main id="admin-main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
