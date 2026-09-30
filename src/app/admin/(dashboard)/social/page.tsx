import type { Metadata } from "next";
import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { SocialLinksEditor } from "@/components/admin/list-editors";
import { PageHeader } from "@/components/admin/page-header";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/constants";
import { requireAdminPage } from "@/server/auth-guard";
import { saveSocialLinks } from "@/server/actions/admin/settings";
import { getSiteSettingsForEdit } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Social links" };

const isPlatform = (value: string): value is SocialPlatform => (SOCIAL_PLATFORMS as readonly string[]).includes(value);

export default async function SocialLinksPage() {
  await requireAdminPage("ADMIN");
  const { socialLinks } = await getSiteSettingsForEdit();
  const links = socialLinks.flatMap((l) => (isPlatform(l.platform) ? [{ platform: l.platform, label: l.label, url: l.url, isVisible: l.isVisible }] : []));

  return (
    <>
      <PageHeader title="Social links" description="Official accounts of the trust, shown in the footer and on the contact page." />
      <EntityForm action={saveSocialLinks}>
        <FormSection title="Links" description="Only accounts the trust itself controls. Personal profiles of trustees belong on their trustee page.">
          <SocialLinksEditor defaultValue={links} />
        </FormSection>
      </EntityForm>
    </>
  );
}
