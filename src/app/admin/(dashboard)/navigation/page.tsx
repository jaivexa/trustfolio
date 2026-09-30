import type { Metadata } from "next";
import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { NavigationEditor } from "@/components/admin/list-editors";
import { PageHeader } from "@/components/admin/page-header";
import { NAV_KEYS, type NavKey } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { requireAdminPage } from "@/server/auth-guard";
import { saveNavigation } from "@/server/actions/admin/settings";
import { getSettings } from "@/server/queries/public";

export const metadata: Metadata = { title: "Navigation" };

export default async function NavigationPage() {
  await requireAdminPage("ADMIN");
  const settings = await getSettings();
  const en = getDictionary("en").nav;
  const ta = getDictionary("ta").nav;
  const labels = Object.fromEntries(NAV_KEYS.map((key) => [key, { en: en[key], ta: ta[key] }])) as Record<NavKey, { en: string; ta: string }>;

  return (
    <>
      <PageHeader title="Navigation" description="Choose which pages appear in the main menu, and in what order. Menu labels come from the built-in English and Tamil interface text." />
      <EntityForm action={saveNavigation}>
        <FormSection title="Main menu" description="Hidden pages stay available by link, in the footer and through search. On small screens every visible item is in the menu drawer.">
          <NavigationEditor defaultValue={settings.navigation} labels={labels} />
        </FormSection>
      </EntityForm>
    </>
  );
}
