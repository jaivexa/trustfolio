import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { MessageInbox } from "@/components/admin/message-inbox";
import { cn } from "@/lib/utils";
import { listMessages } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Messages" };

const FILTERS = [
  { key: "inbox", label: "Inbox" },
  { key: "unread", label: "Unread" },
  { key: "archived", label: "Archived" },
] as const;

type Filter = (typeof FILTERS)[number]["key"];

export default async function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const params = await searchParams;
  const filter: Filter = FILTERS.some((f) => f.key === params.filter) ? (params.filter as Filter) : "inbox";
  const openId = typeof params.open === "string" ? params.open : undefined;
  const { messages, counts } = await listMessages(filter);

  return (
    <>
      <PageHeader title="Messages" description="Enquiries submitted through the contact form." />
      <nav aria-label="Message folders" className="mb-5 flex gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "inbox" ? "/admin/messages" : `/admin/messages?filter=${f.key}`}
            aria-current={filter === f.key ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm transition-colors",
              filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {f.label}
            <span className="text-xs tabular-nums opacity-70">{counts[f.key]}</span>
          </Link>
        ))}
      </nav>
      <MessageInbox
        key={filter}
        filter={filter}
        initialOpenId={openId}
        messages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
      />
    </>
  );
}
