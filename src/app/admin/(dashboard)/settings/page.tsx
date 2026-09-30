import type { Metadata } from "next";
import { BilingualField, BilingualHeader, TranslationProvider, TranslationSummary } from "@/components/admin/bilingual";
import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { FieldGrid, SelectField, SwitchField, TextField } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/page-header";
import { MediaPicker } from "@/components/admin/pickers";
import { ACCENT_COLORS } from "@/lib/constants";
import { requireAdminPage } from "@/server/auth-guard";
import { saveSiteSettings } from "@/server/actions/admin/settings";
import { getSiteSettingsForEdit, pickedMedia } from "@/server/queries/admin";

export const metadata: Metadata = { title: "SEO & settings" };

const THEMES = [
  { value: "SYSTEM", label: "Follow the visitor's device" },
  { value: "LIGHT", label: "Light" },
  { value: "DARK", label: "Dark" },
];

export default async function SettingsPage() {
  await requireAdminPage("ADMIN");
  const { settings: s } = await getSiteSettingsForEdit();

  return (
    <>
      <PageHeader title="SEO & settings" description="Search appearance, theme and site-wide options. Administrators only." />
      <TranslationProvider>
        <EntityForm action={saveSiteSettings}>
          <TranslationSummary />
          <FormSection title="Search engines & sharing" description="Used as the default title and description for search results and link previews.">
            <BilingualHeader />
            <BilingualField name="seoTitle" label="Site title" required maxLength={70} defaultEn={s?.seoTitleEn} defaultTa={s?.seoTitleTa} />
            <BilingualField name="seoDescription" label="Site description" kind="textarea" rows={2} required maxLength={170} defaultEn={s?.seoDescriptionEn} defaultTa={s?.seoDescriptionTa} />
            <TextField name="seoKeywords" label="Keywords" description="Comma-separated, up to 20." defaultValue={s?.seoKeywords.join(", ")} />
            <FieldGrid>
              <MediaPicker name="ogImageId" label="Link preview image" description="1200×630 recommended. Defaults to a generated image." initial={pickedMedia(s?.ogImage)} />
              <TextField name="twitterHandle" label="X (Twitter) handle" placeholder="@trust" defaultValue={s?.twitterHandle} />
            </FieldGrid>
          </FormSection>

          <FormSection title="Appearance">
            <FieldGrid>
              <SelectField name="defaultTheme" label="Default theme" options={THEMES} defaultValue={s?.defaultTheme ?? "SYSTEM"} />
              <SelectField name="accentColor" label="Accent colour" options={ACCENT_COLORS.map((c) => ({ value: c, label: c[0]!.toUpperCase() + c.slice(1) }))} defaultValue={s?.accentColor ?? "teal"} />
            </FieldGrid>
          </FormSection>

          <FormSection title="Site options">
            <SwitchField name="contactEnabled" label="Contact form" description="When off, the contact page shows only the public contact details." defaultChecked={s?.contactEnabled ?? true} />
            <BilingualHeader />
            <BilingualField name="footerNote" label="Footer note" maxLength={200} defaultEn={s?.footerNoteEn} defaultTa={s?.footerNoteTa} />
            <TextField
              name="analyticsDomain"
              label="Plausible analytics domain"
              placeholder="example.org"
              description="Optional, privacy-friendly analytics without cookies. Leave empty to disable."
              defaultValue={s?.analyticsDomain}
            />
          </FormSection>
        </EntityForm>
      </TranslationProvider>
    </>
  );
}
