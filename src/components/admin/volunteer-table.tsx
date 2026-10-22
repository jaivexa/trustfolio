"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Eye,
  HandHeart,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { approveVolunteer, deleteVolunteer, setVolunteerStatus } from "@/server/actions/admin/volunteers";
import type { AdminVolunteerRow } from "@/server/queries/admin";
import type { VolunteerApplicationStatus } from "@/generated/prisma/enums";
import { cn, formatDate, formatRelative, initials } from "@/lib/utils";

type FilterStatus = "ALL" | VolunteerApplicationStatus;

const STATUS_CONFIG: Record<
  VolunteerApplicationStatus,
  { label: string; variant: "warning" | "brand" | "secondary" | "success" | "destructive" }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  REVIEWING: { label: "Reviewing", variant: "brand" },
  CONTACTED: { label: "Contacted", variant: "secondary" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

export function VolunteerStatusBadge({ status }: { status: VolunteerApplicationStatus }) {
  const conf = STATUS_CONFIG[status] ?? { label: status, variant: "secondary" };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}

export function VolunteerTable({
  volunteers,
  counts,
}: {
  volunteers: AdminVolunteerRow[];
  counts: {
    all: number;
    PENDING: number;
    REVIEWING: number;
    CONTACTED: number;
    APPROVED: number;
    REJECTED: number;
  };
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [viewItem, setViewItem] = useState<AdminVolunteerRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminVolunteerRow | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return volunteers.filter((item) => {
      if (filter !== "ALL" && item.status !== filter) return false;
      if (!q) return true;
      return (
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.phone && item.phone.toLowerCase().includes(q)) ||
        (item.city && item.city.toLowerCase().includes(q)) ||
        (item.activityTitle && item.activityTitle.toLowerCase().includes(q)) ||
        item.motivation.toLowerCase().includes(q) ||
        item.goals.toLowerCase().includes(q)
      );
    });
  }, [volunteers, query, filter]);

  const handleStatusChange = (id: string, status: VolunteerApplicationStatus) => {
    startTransition(async () => {
      const res = await setVolunteerStatus(id, status);
      if (res.status === "success") {
        toast.success(res.message);
        if (viewItem?.id === id) {
          setViewItem((prev) => (prev ? { ...prev, status } : null));
        }
      } else {
        toast.error(res.message ?? "Failed to update status");
      }
    });
  };

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveVolunteer(id);
      if (res.status === "success") {
        toast.success(res.message);
        if (viewItem?.id === id) {
          setViewItem((prev) => (prev ? { ...prev, status: "APPROVED" } : null));
        }
      } else {
        toast.error(res.message ?? "Failed to approve volunteer");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startTransition(async () => {
      const res = await deleteVolunteer(id);
      if (res.status === "success") {
        toast.success(res.message);
        setDeleteTarget(null);
        if (viewItem?.id === id) setViewItem(null);
      } else {
        toast.error(res.message ?? "Failed to delete application");
      }
    });
  };

  const tabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: "ALL", label: "All", count: counts.all },
    { key: "PENDING", label: "Pending", count: counts.PENDING },
    { key: "REVIEWING", label: "Reviewing", count: counts.REVIEWING },
    { key: "CONTACTED", label: "Contacted", count: counts.CONTACTED },
    { key: "APPROVED", label: "Approved", count: counts.APPROVED },
    { key: "REJECTED", label: "Rejected", count: counts.REJECTED },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search volunteers…"
            className="pl-9"
          />
        </div>

        <nav aria-label="Volunteer filter tabs" className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground border",
                )}
              >
                {tab.label}
                <span className={cn("text-[11px] tabular-nums", active ? "opacity-90" : "opacity-60")}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={HandHeart}
          title={query ? "No matching volunteers found" : "No volunteers in this category"}
          description={
            query
              ? "Try adjusting your search terms or clearing filters."
              : "Applications submitted from the public site will appear here."
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-soft md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/30 text-xs font-medium text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 sm:px-6">Candidate</th>
                    <th scope="col" className="px-4 py-3.5">Activity</th>
                    <th scope="col" className="px-4 py-3.5">Status</th>
                    <th scope="col" className="px-4 py-3.5">Submitted</th>
                    <th scope="col" className="px-4 py-3.5 text-right sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                            {initials(item.fullName)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{item.fullName}</p>
                            <p className="truncate text-xs text-muted-foreground">{item.email}</p>
                            {(item.phone || item.city) && (
                              <p className="truncate text-[11px] text-muted-foreground/80">
                                {[item.phone, item.city].filter(Boolean).join(" · ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {item.activityTitle ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/30 px-2 py-1 text-xs font-medium">
                            <Tag className="size-3 text-muted-foreground" aria-hidden="true" />
                            <span className="max-w-[140px] truncate">{item.activityTitle}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">General</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <VolunteerStatusBadge status={item.status} />
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <time dateTime={item.createdAt} title={formatDate(item.createdAt)}>
                          {formatRelative(item.createdAt)}
                        </time>
                      </td>

                      <td className="px-4 py-3.5 text-right sm:px-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== "APPROVED" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={pending}
                              onClick={() => handleApprove(item.id)}
                              className="h-8 gap-1 border-success/40 text-success hover:bg-success/10 hover:text-success"
                              title="Approve volunteer"
                            >
                              <Check className="size-3.5" aria-hidden="true" />
                              <span className="sr-only sm:not-sr-only">Approve</span>
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewItem(item)}
                            className="h-8 gap-1"
                            title="View application details"
                          >
                            <Eye className="size-3.5" aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only">View</span>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="size-8" aria-label="More actions">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                disabled={item.status === "PENDING" || pending}
                                onClick={() => handleStatusChange(item.id, "PENDING")}
                              >
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={item.status === "REVIEWING" || pending}
                                onClick={() => handleStatusChange(item.id, "REVIEWING")}
                              >
                                Mark as Reviewing
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={item.status === "CONTACTED" || pending}
                                onClick={() => handleStatusChange(item.id, "CONTACTED")}
                              >
                                Mark as Contacted
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={item.status === "APPROVED" || pending}
                                onClick={() => handleApprove(item.id)}
                              >
                                Mark as Approved
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={item.status === "REJECTED" || pending}
                                onClick={() => handleStatusChange(item.id, "REJECTED")}
                              >
                                Mark as Rejected
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(item)}
                              >
                                Delete application
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="surface flex flex-col gap-3 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                      {initials(item.fullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{item.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.email}</p>
                    </div>
                  </div>
                  <VolunteerStatusBadge status={item.status} />
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {item.activityTitle ? (
                    <span className="inline-flex items-center gap-1 rounded border bg-muted/30 px-1.5 py-0.5 font-medium">
                      <Tag className="size-3" aria-hidden="true" />
                      {item.activityTitle}
                    </span>
                  ) : (
                    <span>General</span>
                  )}
                  {item.city && <span>· {item.city}</span>}
                  <span>· {formatRelative(item.createdAt)}</span>
                </div>

                <div className="mt-1 flex items-center justify-end gap-2 border-t pt-2.5">
                  {item.status !== "APPROVED" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => handleApprove(item.id)}
                      className="h-8 gap-1 border-success/40 text-success hover:bg-success/10 hover:text-success"
                    >
                      <Check className="size-3.5" aria-hidden="true" />
                      Approve
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setViewItem(item)}
                    className="h-8"
                  >
                    View
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="size-8 text-destructive"
                    onClick={() => setDeleteTarget(item)}
                    aria-label="Delete application"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={Boolean(viewItem)} onOpenChange={(open) => !open && setViewItem(null)}>
        {viewItem && (
          <DialogContent className="max-w-2xl no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <DialogHeader>
              <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
                <DialogTitle className="flex items-center gap-2 font-display text-xl">
                  <User className="size-5 text-brand" aria-hidden="true" />
                  {viewItem.fullName}
                </DialogTitle>
                <VolunteerStatusBadge status={viewItem.status} />
              </div>
              <DialogDescription className="mt-1 flex items-center gap-2 text-xs">
                <Calendar className="size-3.5" aria-hidden="true" />
                Submitted on {formatDate(viewItem.createdAt)} ({formatRelative(viewItem.createdAt)})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-sm">
              {/* Contact Card */}
              <div className="grid grid-cols-1 gap-2 rounded-xl border bg-muted/20 p-3 sm:grid-cols-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">Email</p>
                  <a
                    href={`mailto:${viewItem.email}`}
                    className="mt-0.5 inline-flex items-center gap-1.5 truncate text-sm font-medium text-brand hover:underline"
                  >
                    <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                    {viewItem.email}
                  </a>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">Phone</p>
                  {viewItem.phone ? (
                    <a
                      href={`tel:${viewItem.phone}`}
                      className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                    >
                      <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                      {viewItem.phone}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted-foreground">—</p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">City</p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm">
                    <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {viewItem.city || "—"}
                  </p>
                </div>
              </div>

              {/* Applied Activity & Availability */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Activity</p>
                  <p className="mt-1 font-medium">
                    {viewItem.activityTitle ? viewItem.activityTitle : "General Application"}
                  </p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Availability</p>
                  <p className="mt-1 font-medium">{viewItem.availability || "Flexible / Not specified"}</p>
                </div>
              </div>

              {/* Areas of Interest */}
              {viewItem.interests.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Areas of interest</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {viewItem.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-lg bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {viewItem.skills.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Skills offered</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {viewItem.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border bg-muted/40 px-2.5 py-1 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivation */}
              <div>
                <p className="text-xs font-medium text-muted-foreground">Why do you want to volunteer?</p>
                <div className="mt-1 rounded-xl border bg-muted/20 p-3 leading-relaxed">
                  {viewItem.motivation}
                </div>
              </div>

              {/* Goals */}
              <div>
                <p className="text-xs font-medium text-muted-foreground">What do you hope to achieve?</p>
                <div className="mt-1 rounded-xl border bg-muted/20 p-3 leading-relaxed">
                  {viewItem.goals}
                </div>
              </div>

              {/* Remarks */}
              {viewItem.remarks && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Additional remarks</p>
                  <div className="mt-1 rounded-xl border bg-muted/20 p-3 leading-relaxed">
                    {viewItem.remarks}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteTarget(viewItem)}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Delete
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(viewItem.id, "PENDING")}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(viewItem.id, "REVIEWING")}>
                      Reviewing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(viewItem.id, "CONTACTED")}>
                      Contacted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(viewItem.id, "APPROVED")}>
                      Approved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(viewItem.id, "REJECTED")}>
                      Rejected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {viewItem.status !== "APPROVED" && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleApprove(viewItem.id)}
                    className="gap-1 bg-success text-success-foreground hover:bg-success/90"
                  >
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    Approve Application
                  </Button>
                )}

                <Button type="button" variant="outline" size="sm" onClick={() => setViewItem(null)}>
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete volunteer application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the volunteer application from{" "}
              <strong>{deleteTarget?.fullName}</strong>? This action will remove the application from active lists.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
