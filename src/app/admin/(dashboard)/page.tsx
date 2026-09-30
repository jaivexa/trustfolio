import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Award,
  FolderKanban,
  Inbox,
  MessageSquareQuote,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { formatRelative } from "@/lib/utils";
import { getDashboardData } from "@/server/queries/admin";
import { getAdminUser } from "@/server/auth-guard";

const ACTION_VARIANT = {
  CREATE: "success",
  UPDATE: "secondary",
  DELETE: "destructive",
  PUBLISH: "brand",
  UNPUBLISH: "outline",
  FEATURE: "warning",
  UNFEATURE: "outline",
  LOGIN: "outline",
} as const;

function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-card p-5 shadow-soft transition-[border-color,box-shadow] hover:border-brand/30 hover:shadow-lift"
    >
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-0.5 text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  const [{ counts, activity, recentMessages }, user] = await Promise.all([getDashboardData(), getAdminUser()]);
  const firstName = (user?.name ?? "there").split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening across your portfolio."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus aria-hidden="true" /> New project
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projects" value={counts.projects} hint={`${counts.publishedProjects} published`} href="/admin/projects" icon={FolderKanban} />
        <StatCard
          label="Testimonials"
          value={counts.testimonials}
          hint={counts.pendingTestimonials ? `${counts.pendingTestimonials} awaiting review` : "All published"}
          href="/admin/testimonials"
          icon={MessageSquareQuote}
        />
        <StatCard label="Messages" value={counts.messages} hint={`${counts.unread} unread`} href="/admin/messages" icon={Inbox} />
        <StatCard label="Certificates" value={counts.certificates} hint="Verified credentials" href="/admin/certificates" icon={Award} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section aria-labelledby="activity-title" className="rounded-2xl border bg-card shadow-soft lg:col-span-3">
          <header className="flex items-center gap-2 border-b px-5 py-4">
            <Activity className="size-4 text-brand" aria-hidden="true" />
            <h2 id="activity-title" className="font-semibold">
              Recent activity
            </h2>
          </header>
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" description="Changes you make will show up here." className="m-5" />
          ) : (
            <ol className="divide-y">
              {activity.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                  <Badge variant={ACTION_VARIANT[item.action]} className="mt-0.5 w-20 justify-center text-[10px] tracking-wide uppercase">
                    {item.action}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{item.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.user?.name ?? item.user?.email ?? "System"} ·{" "}
                      <time dateTime={item.createdAt.toISOString()}>{formatRelative(item.createdAt)}</time>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="messages-title" className="rounded-2xl border bg-card shadow-soft lg:col-span-2">
          <header className="flex items-center justify-between border-b px-5 py-4">
            <h2 id="messages-title" className="font-semibold">
              Latest messages
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/messages">View all</Link>
            </Button>
          </header>
          {recentMessages.length === 0 ? (
            <EmptyState icon={Inbox} title="Inbox zero" description="New enquiries will appear here." className="m-5" />
          ) : (
            <ul className="divide-y">
              {recentMessages.map((message) => (
                <li key={message.id}>
                  <Link href={`/admin/messages?open=${message.id}`} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40">
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${message.status === "UNREAD" ? "bg-brand" : "bg-transparent"}`}
                      aria-label={message.status === "UNREAD" ? "Unread" : undefined}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm ${message.status === "UNREAD" ? "font-semibold" : ""}`}>{message.subject}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {message.name} · {formatRelative(message.createdAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
