import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsTabs } from "@/components/admin/forms/settings-forms";
import { requireAdminPage } from "@/server/auth-guard";
import { getSettingsData } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const user = await requireAdminPage();
  const { profile, settings } = await getSettingsData();

  return (
    <>
      <PageHeader title="Settings" description="Your public profile, links, SEO, theme and account." />
      <SettingsTabs
        canEditSite={user.role === "ADMIN"}
        profile={profile}
        socialLinks={(profile?.socialLinks ?? []).map((l) => ({ platform: l.platform, label: l.label, url: l.url, isVisible: l.isVisible }))}
        settings={settings}
      />
    </>
  );
}
