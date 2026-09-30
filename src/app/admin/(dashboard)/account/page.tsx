import type { Metadata } from "next";
import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { TextField } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdminPage } from "@/server/auth-guard";
import { changePassword } from "@/server/actions/admin/settings";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireAdminPage();
  return (
    <>
      <PageHeader title="My account" description={`Signed in as ${user.email} (${user.role === "ADMIN" ? "administrator" : "editor"}).`} />
      <div className="max-w-xl">
        <EntityForm action={changePassword} submitLabel="Update password" inline>
          <FormSection title="Change password" description="At least 12 characters, with upper- and lowercase letters and a number.">
            <TextField name="currentPassword" label="Current password" type="password" autoComplete="current-password" required />
            <TextField name="newPassword" label="New password" type="password" autoComplete="new-password" required />
            <TextField name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" required />
          </FormSection>
        </EntityForm>
      </div>
    </>
  );
}
