import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { VolunteerTable } from "@/components/admin/volunteer-table";
import { listVolunteers } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "Volunteers",
};

export default async function AdminVolunteersPage() {
  const { volunteers, counts } = await listVolunteers();

  return (
    <>
      <PageHeader
        title="Volunteers"
        description="Review volunteer applications, filter by status, inspect candidate details and skills, and approve applicants."
      />
      <VolunteerTable volunteers={volunteers} counts={counts} />
    </>
  );
}
