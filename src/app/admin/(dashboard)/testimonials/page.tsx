import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareQuote, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { DataCard, PageHeader } from "@/components/admin/page-header";
import { DeleteButton, EditButton, ToggleAction } from "@/components/admin/row-actions";
import { formatDate } from "@/lib/utils";
import { deleteTestimonial, setTestimonialPublished } from "@/server/actions/admin/testimonials";
import { listTestimonials } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  const testimonials = await listTestimonials();

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Review and publish feedback from clients and colleagues."
        actions={
          <Button asChild>
            <Link href="/admin/testimonials/new">
              <Plus aria-hidden="true" /> Add testimonial
            </Link>
          </Button>
        }
      />
      {testimonials.length === 0 ? (
        <EmptyState icon={MessageSquareQuote} title="No testimonials yet" description="Social proof builds trust — add your first quote." />
      ) : (
        <DataCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead className="hidden md:table-cell">Quote</TableHead>
                <TableHead className="hidden lg:table-cell">Rating</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link href={`/admin/testimonials/${t.id}`} className="font-medium hover:text-brand">
                      {t.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {[t.role, t.company].filter(Boolean).join(", ")} · {formatDate(t.date)}
                    </p>
                    {t.project && <p className="text-xs text-brand">↳ {t.project.title}</p>}
                  </TableCell>
                  <TableCell className="hidden max-w-sm md:table-cell">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{t.content}</p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1 text-sm" aria-label={`${t.rating} out of 5`}>
                      <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" /> {t.rating}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ToggleAction checked={t.isPublished} action={setTestimonialPublished.bind(null, t.id)} label={`Publish testimonial from ${t.name}`} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-0.5">
                      <EditButton href={`/admin/testimonials/${t.id}`} label={`Edit testimonial from ${t.name}`} />
                      <DeleteButton action={deleteTestimonial.bind(null, t.id)} itemName={`the testimonial from ${t.name}`} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataCard>
      )}
    </>
  );
}
