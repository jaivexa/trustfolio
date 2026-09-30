"use client";

import { useEffect, useState, useTransition } from "react";
import { Archive, ArchiveRestore, CheckCheck, Inbox, Mail, MailOpen, Reply } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteButton } from "@/components/admin/row-actions";
import { DemoBadge } from "@/components/admin/demo-badge";
import { deleteMessage, markMessageRead, setMessageStatus } from "@/server/actions/admin/messages";
import { cn, formatDate, formatRelative } from "@/lib/utils";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  locale: string | null;
  subject: string;
  message: string;
  status: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";
  isDemo: boolean;
  createdAt: string;
};

export function MessageInbox({
  messages,
  filter,
  initialOpenId,
}: {
  messages: Message[];
  filter: "inbox" | "unread" | "archived";
  initialOpenId?: string;
}) {
  const [openId, setOpenId] = useState<string | undefined>(initialOpenId);
  const [pending, startTransition] = useTransition();
  const open = messages.find((m) => m.id === openId);

  // Opening an unread message marks it as read.
  useEffect(() => {
    if (open?.status === "UNREAD") void markMessageRead(open.id);
  }, [open?.id, open?.status]);

  const run = (fn: () => Promise<{ status: string; message?: string }>, close = true) =>
    startTransition(async () => {
      const result = await fn();
      if (result.status === "success") {
        if (result.message) toast.success(result.message);
        if (close) setOpenId(undefined);
      } else toast.error(result.message ?? "Something went wrong");
    });

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={filter === "archived" ? "No archived messages" : filter === "unread" ? "You're all caught up" : "No messages yet"}
        description={filter === "inbox" ? "Messages from your contact form will appear here." : undefined}
      />
    );
  }

  return (
    <>
      <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-soft">
        {messages.map((message) => {
          const unread = message.status === "UNREAD";
          return (
            <li key={message.id}>
              <button
                type="button"
                onClick={() => setOpenId(message.id)}
                className="flex w-full cursor-pointer items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none sm:px-5"
              >
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", unread ? "bg-brand" : "bg-transparent")} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className={cn("truncate text-sm", unread && "font-semibold")}>
                      {message.isDemo && <DemoBadge className="mr-1.5" />}
                      {message.status === "REPLIED" && (
                        <Badge variant="success" className="mr-1.5 px-1.5 py-0 text-[10px]">
                          Replied
                        </Badge>
                      )}
                      {message.name}
                      <span className="font-normal text-muted-foreground"> · {message.email}</span>
                    </p>
                    <time dateTime={message.createdAt} className="shrink-0 text-xs text-muted-foreground" suppressHydrationWarning>
                      {formatRelative(message.createdAt)}
                    </time>
                  </div>
                  <p className={cn("mt-0.5 truncate text-sm", unread ? "font-medium" : "text-foreground/80")}>
                    {unread && <span className="sr-only">Unread: </span>}
                    {message.subject}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{message.message}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog open={Boolean(open)} onOpenChange={(value) => !value && setOpenId(undefined)}>
        {open && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                {open.isDemo && <DemoBadge />}
                {open.status === "ARCHIVED" && <Badge variant="outline">Archived</Badge>}
                {open.status === "REPLIED" && <Badge variant="success">Replied</Badge>}
              </div>
              <DialogTitle className="leading-snug">{open.subject}</DialogTitle>
              <DialogDescription>
                From <span className="font-medium text-foreground">{open.name}</span> &lt;{open.email}&gt; · {formatDate(open.createdAt)}
                {open.phone && <> · {open.phone}</>}
                {open.locale && <> · written in {open.locale === "ta" ? "Tamil" : "English"}</>}
              </DialogDescription>
            </DialogHeader>
            <div lang={open.locale ?? undefined} className="max-h-[50dvh] overflow-y-auto rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {open.message}
            </div>
            <DialogFooter className="sm:justify-between">
              <DeleteButton
                action={deleteMessage.bind(null, open.id)}
                itemName="this message"
                variant="button"
                onDeleted={() => setOpenId(undefined)}
              />
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                {open.status !== "ARCHIVED" ? (
                  <>
                    <Button variant="outline" disabled={pending} onClick={() => run(() => setMessageStatus(open.id, "UNREAD"))}>
                      <Mail aria-hidden="true" /> Mark unread
                    </Button>
                    {open.status !== "REPLIED" && (
                      <Button variant="outline" disabled={pending} onClick={() => run(() => setMessageStatus(open.id, "REPLIED"))}>
                        <CheckCheck aria-hidden="true" /> Mark replied
                      </Button>
                    )}
                    <Button variant="outline" disabled={pending} onClick={() => run(() => setMessageStatus(open.id, "ARCHIVED"))}>
                      <Archive aria-hidden="true" /> Archive
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" disabled={pending} onClick={() => run(() => setMessageStatus(open.id, "READ"))}>
                    <ArchiveRestore aria-hidden="true" /> Move to inbox
                  </Button>
                )}
                <Button asChild>
                  <a href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject}`)}`}>
                    <Reply aria-hidden="true" /> Reply
                  </a>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MailOpen className="size-3.5" aria-hidden="true" /> Opening a message marks it as read.
      </p>
    </>
  );
}
