import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseBusiness, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { DataCard, PageHeader } from "@/components/admin/page-header";
import { DeleteButton, EditButton, ToggleAction } from "@/components/admin/row-actions";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";
import { formatDateRange } from "@/lib/utils";
import { deleteExperience, setExperiencePublished } from "@/server/actions/admin/experience";
import { listExperience } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Experience" };

export default async function AdminExperiencePage() {
  const items = await listExperience();

  return (
    <>
      <PageHeader
        title="Experience"
        description="Your professional timeline."
        actions={
          <Button asChild>
            <Link href="/admin/experience/new">
              <Plus aria-hidden="true" /> Add experience
            </Link>
          </Button>
        }
      />
      {items.length === 0 ? (
        <EmptyState icon={BriefcaseBusiness} title="No experience yet" description="Add the roles that shaped your career." />
      ) : (
        <DataCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Period</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link href={`/admin/experience/${item.id}`} className="font-medium hover:text-brand">
                      {item.position}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {item.company}
                      {!item.endDate && (
                        <Badge variant="success" className="ml-2 py-0">
                          Current
                        </Badge>
                      )}
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDateRange(item.startDate, item.endDate)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="secondary">{EMPLOYMENT_TYPE_LABELS[item.employmentType]}</Badge>
                  </TableCell>
                  <TableCell>
                    <ToggleAction checked={item.isPublished} action={setExperiencePublished.bind(null, item.id)} label={`Show ${item.position} on site`} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-0.5">
                      <EditButton href={`/admin/experience/${item.id}`} label={`Edit ${item.position}`} />
                      <DeleteButton action={deleteExperience.bind(null, item.id)} itemName={`${item.position} at ${item.company}`} />
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
