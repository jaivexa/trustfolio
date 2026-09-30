import type { Metadata } from "next";
import { BilingualField, BilingualHeader, TranslationProvider, TranslationSummary } from "@/components/admin/bilingual";
import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { DateField, FieldGrid, RelationSelect, TextField } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/page-header";
import { MediaPicker } from "@/components/admin/pickers";
import { PENDING_MARKER } from "@/lib/constants";
import { requireAdminPage } from "@/server/auth-guard";
import { saveTrustProfile } from "@/server/actions/admin/trust";
import { getOptions, getTrustProfileForEdit, pickedMedia } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Trust profile" };

function Bilingual({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <FormSection title={title} description={description}>
      <BilingualHeader />
      {children}
    </FormSection>
  );
}

export default async function TrustProfilePage() {
  await requireAdminPage("ADMIN");
  const [p, options] = await Promise.all([getTrustProfileForEdit(), getOptions()]);

  return (
    <>
      <PageHeader title="Trust profile" description="The trust's official identity. Administrators only." />
      <p role="note" className="mb-6 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
        Enter only what appears in the trust&apos;s official documents. Leave a field empty rather than estimate it — empty fields show “{PENDING_MARKER}” or are hidden
        on the website. Official Tamil wording should come from the registered Tamil documents, not a new translation.
      </p>
      {p?.isDemo && (
        <p role="note" className="mb-6 rounded-xl border border-dashed border-warning/60 bg-warning/10 p-4 text-sm">
          <strong>Demo data.</strong> This profile describes the fictional “Aram Community Trust” from the seed. Replace every field with official
          information, or run <code className="text-xs">npm run db:demo:clear</code> to reset it to placeholders. Changing the registered name marks the
          profile as official (it will then never be reset). Other demo records stay until you clear them.
        </p>
      )}
      <TranslationProvider>
        <EntityForm action={saveTrustProfile}>
          <TranslationSummary />
          <Bilingual title="Identity">
            <BilingualField
              name="name"
              label="Registered name"
              required
              maxLength={200}
              description={`Exactly as registered. Replace “${PENDING_MARKER}” once the official name is confirmed.`}
              defaultEn={p?.nameEn}
              defaultTa={p?.nameTa}
            />
            <BilingualField name="shortName" label="Short name" maxLength={80} description="Optional, used in the header." defaultEn={p?.shortNameEn} defaultTa={p?.shortNameTa} />
            <BilingualField name="tagline" label="Tagline" maxLength={240} defaultEn={p?.taglineEn} defaultTa={p?.taglineTa} />
            <BilingualField name="heroText" label="Introduction (home page)" kind="textarea" rows={3} maxLength={600} defaultEn={p?.heroTextEn} defaultTa={p?.heroTextTa} />
          </Bilingual>

          <Bilingual title="About the trust">
            <BilingualField name="about" label="About" kind="markdown" rows={8} maxLength={8000} defaultEn={p?.aboutEn} defaultTa={p?.aboutTa} />
            <BilingualField name="purpose" label="Why the trust exists" kind="markdown" rows={5} maxLength={4000} defaultEn={p?.purposeEn} defaultTa={p?.purposeTa} />
            <BilingualField name="history" label="History (narrative)" kind="markdown" rows={8} maxLength={20000} description="Individual milestones go in History." defaultEn={p?.historyEn} defaultTa={p?.historyTa} />
            <BilingualField name="geographicFocus" label="Where the trust works" kind="textarea" rows={2} maxLength={600} defaultEn={p?.geographicFocusEn} defaultTa={p?.geographicFocusTa} />
          </Bilingual>

          <Bilingual title="Vision & mission">
            <BilingualField name="vision" label="Vision" kind="textarea" rows={3} maxLength={1200} defaultEn={p?.visionEn} defaultTa={p?.visionTa} />
            <BilingualField name="mission" label="Mission" kind="textarea" rows={3} maxLength={1200} defaultEn={p?.missionEn} defaultTa={p?.missionTa} />
          </Bilingual>

          <Bilingual title="Registration & legal" description="Shown on the Registration & Legal page. Copy each value from the registration certificate.">
            <FieldGrid>
              <TextField name="registrationNumber" label="Registration number" defaultValue={p?.registrationNumber} />
              <DateField name="registrationDate" label="Registration date" defaultValue={p?.registrationDate} />
              <DateField name="establishedDate" label="Established" defaultValue={p?.establishedDate} />
              <RelationSelect
                name="registrationDocumentId"
                label="Registration document"
                description="Use the redacted public copy if the original shows personal details."
                options={options.documents}
                defaultValue={p?.registrationDocumentId}
              />
            </FieldGrid>
            <BilingualField name="registrationOffice" label="Registered at" maxLength={200} placeholder="e.g. Sub-Registrar Office, …" defaultEn={p?.registrationOfficeEn} defaultTa={p?.registrationOfficeTa} />
            <BilingualField name="legalStatus" label="Legal status" maxLength={300} placeholder="e.g. Public charitable trust" defaultEn={p?.legalStatusEn} defaultTa={p?.legalStatusTa} />
            <BilingualField name="officialAddress" label="Registered address" kind="textarea" rows={3} maxLength={600} description="The trust's office address, not a trustee's home." defaultEn={p?.officialAddressEn} defaultTa={p?.officialAddressTa} />
          </Bilingual>

          <Bilingual title="Public contact" description="Office contact details only. Never a personal mobile number.">
            <FieldGrid>
              <TextField name="publicEmail" label="Public email" type="email" defaultValue={p?.publicEmail} />
              <TextField name="publicPhone" label="Office phone" type="tel" defaultValue={p?.publicPhone} />
            </FieldGrid>
            <TextField name="mapUrl" label="Map link" type="url" defaultValue={p?.mapUrl} />
            <BilingualField name="officeHours" label="Office hours" maxLength={300} defaultEn={p?.officeHoursEn} defaultTa={p?.officeHoursTa} />
          </Bilingual>

          <FormSection title="Branding">
            <div className="grid gap-5 md:grid-cols-2">
              <MediaPicker name="logoId" label="Logo" initial={pickedMedia(p?.logo)} />
              <MediaPicker name="heroImageId" label="Home page image" initial={pickedMedia(p?.heroImage)} />
            </div>
          </FormSection>
        </EntityForm>
      </TranslationProvider>
    </>
  );
}
