"use client";

import { ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityForm, FormSection } from "@/components/admin/entity-form";
import { FieldGrid, ListField, SelectField, SwitchField, TextareaField, TextField } from "@/components/admin/fields";
import { MarkdownField } from "@/components/admin/markdown-field";
import { MediaField } from "@/components/admin/media-field";
import { SocialLinksEditor } from "@/components/admin/list-editors";
import { changePassword, saveProfile, saveSiteSettings, saveSocialLinks } from "@/server/actions/admin/settings";
import { ACCENT_COLORS } from "@/lib/constants";
import type { Profile, SiteSetting } from "@/generated/prisma/browser";

const ACCENT_OPTIONS = ACCENT_COLORS.map((c) => ({ value: c, label: c[0]!.toUpperCase() + c.slice(1) }));
const THEME_OPTIONS = [
  { value: "SYSTEM", label: "Follow system" },
  { value: "LIGHT", label: "Light" },
  { value: "DARK", label: "Dark" },
];

function ProfileForm({ profile }: { profile: Profile | null }) {
  return (
    <EntityForm action={saveProfile} submitLabel="Save profile">
      <FormSection title="Identity">
        <FieldGrid>
          <TextField name="fullName" label="Full name" required defaultValue={profile?.fullName} />
          <TextField name="email" label="Public email" type="email" required defaultValue={profile?.email} />
        </FieldGrid>
        <FieldGrid>
          <TextField name="location" label="Location" defaultValue={profile?.location} />
          <TextField name="phone" label="Phone" type="tel" defaultValue={profile?.phone} description="Not shown publicly." />
        </FieldGrid>
        <MediaField name="avatarUrl" label="Profile image" folder="avatars" defaultValue={profile?.avatarUrl} />
        <MediaField
          name="resumeUrl"
          label="Résumé / CV (PDF)"
          folder="documents"
          kind="document"
          accept="application/pdf"
          defaultValue={profile?.resumeUrl}
        />
      </FormSection>

      <FormSection title="Hero" description="The first thing visitors see.">
        <TextField name="heroEyebrow" label="Eyebrow" defaultValue={profile?.heroEyebrow} placeholder="Senior Full-Stack Engineer" />
        <TextField name="headline" label="Headline" required maxLength={140} defaultValue={profile?.headline} />
        <TextareaField name="tagline" label="Credibility statement" required rows={2} maxLength={240} defaultValue={profile?.tagline} />
        <FieldGrid>
          <TextField name="primaryCtaLabel" label="Primary button label" required defaultValue={profile?.primaryCtaLabel ?? "View my work"} />
          <TextField name="primaryCtaHref" label="Primary button link" required defaultValue={profile?.primaryCtaHref ?? "#projects"} />
        </FieldGrid>
        <FieldGrid>
          <TextField name="secondaryCtaLabel" label="Secondary button label" required defaultValue={profile?.secondaryCtaLabel ?? "Get in touch"} />
          <TextField name="secondaryCtaHref" label="Secondary button link" required defaultValue={profile?.secondaryCtaHref ?? "#contact"} />
        </FieldGrid>
        <FieldGrid>
          <TextField name="availability" label="Availability note" defaultValue={profile?.availability} placeholder="Available for Q1 projects" />
          <SwitchField name="isAvailable" label="Open to new work" description="Shows a green status indicator." defaultChecked={profile?.isAvailable ?? true} />
        </FieldGrid>
      </FormSection>

      <FormSection title="About">
        <TextareaField name="shortBio" label="Short bio" required rows={2} maxLength={400} defaultValue={profile?.shortBio} description="Used in the footer and search results." />
        <MarkdownField name="bio" label="Biography" required rows={10} maxLength={8000} defaultValue={profile?.bio} />
        <ListField name="values" label="Personal values" rows={4} defaultValue={profile?.values} />
        <ListField name="highlights" label="Career highlights" rows={4} defaultValue={profile?.highlights} />
      </FormSection>

      <FormSection title="Trust metrics" description="Leave empty to calculate automatically from your content.">
        <FieldGrid>
          <TextField name="yearsExperience" label="Years of experience" type="number" min={0} defaultValue={profile?.yearsExperience} />
          <TextField name="projectsCompleted" label="Projects completed" type="number" min={0} defaultValue={profile?.projectsCompleted} />
        </FieldGrid>
        <FieldGrid>
          <TextField name="clientsServed" label="Clients served" type="number" min={0} defaultValue={profile?.clientsServed} />
          <TextField name="achievementsCount" label="Achievements" type="number" min={0} defaultValue={profile?.achievementsCount} />
        </FieldGrid>
      </FormSection>
    </EntityForm>
  );
}

function SiteForm({ settings }: { settings: SiteSetting | null }) {
  return (
    <EntityForm action={saveSiteSettings} submitLabel="Save settings">
      <FormSection title="Site">
        <FieldGrid>
          <TextField name="siteName" label="Site name" required defaultValue={settings?.siteName} />
          <TextField name="twitterHandle" label="X / Twitter handle" defaultValue={settings?.twitterHandle} placeholder="@handle" />
        </FieldGrid>
        <TextareaField name="siteDescription" label="Site description" required rows={2} maxLength={300} defaultValue={settings?.siteDescription} />
        <TextField name="footerNote" label="Footer note" defaultValue={settings?.footerNote} />
      </FormSection>
      <FormSection title="SEO" description="Defaults for search engines and social previews.">
        <TextField name="seoTitle" label="Meta title" required maxLength={70} defaultValue={settings?.seoTitle} description="Up to 70 characters." />
        <TextareaField name="seoDescription" label="Meta description" required rows={3} maxLength={170} defaultValue={settings?.seoDescription} description="Up to 170 characters." />
        <TextField name="seoKeywords" label="Keywords" defaultValue={settings?.seoKeywords.join(", ")} description="Comma-separated." />
        <MediaField
          name="ogImageUrl"
          label="Social share image"
          folder="misc"
          defaultValue={settings?.ogImageUrl}
          description="1200×630 PNG or JPG. Leave empty to use the auto-generated card."
        />
      </FormSection>
      <FormSection title="Theme">
        <FieldGrid>
          <SelectField name="defaultTheme" label="Default color mode" options={THEME_OPTIONS} defaultValue={settings?.defaultTheme ?? "SYSTEM"} description="Visitors can still switch; their choice is remembered." />
          <SelectField name="accentColor" label="Accent color" options={ACCENT_OPTIONS} defaultValue={settings?.accentColor ?? "indigo"} />
        </FieldGrid>
      </FormSection>
      <FormSection title="Sections">
        <FieldGrid>
          <SwitchField name="showServices" label="Services section" defaultChecked={settings?.showServices ?? true} />
          <SwitchField name="showTestimonials" label="Testimonials section" defaultChecked={settings?.showTestimonials ?? true} />
          <SwitchField name="showCertificates" label="Certifications section" defaultChecked={settings?.showCertificates ?? true} />
          <SwitchField name="contactEnabled" label="Contact form" description="When off, visitors see your email instead." defaultChecked={settings?.contactEnabled ?? true} />
        </FieldGrid>
      </FormSection>
    </EntityForm>
  );
}

function SocialForm({ links }: { links: { platform: string; label: string; url: string; isVisible: boolean }[] }) {
  return (
    <EntityForm action={saveSocialLinks} submitLabel="Save links">
      <FormSection title="Social links" description="Shown in the hero, contact section and footer, in this order.">
        <SocialLinksEditor defaultValue={links} />
      </FormSection>
    </EntityForm>
  );
}

function PasswordForm() {
  return (
    <EntityForm action={changePassword} submitLabel="Update password">
      <FormSection title="Change password" description="Use at least 12 characters with upper- and lowercase letters and a number.">
        <TextField name="currentPassword" label="Current password" type="password" autoComplete="current-password" required className="max-w-md" />
        <FieldGrid>
          <TextField name="newPassword" label="New password" type="password" autoComplete="new-password" required />
          <TextField name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" required />
        </FieldGrid>
      </FormSection>
    </EntityForm>
  );
}

export function SettingsTabs({
  canEditSite,
  profile,
  socialLinks,
  settings,
}: {
  canEditSite: boolean;
  profile: Profile | null;
  socialLinks: { platform: string; label: string; url: string; isVisible: boolean }[];
  settings: SiteSetting | null;
}) {
  return (
    <Tabs defaultValue={canEditSite ? "profile" : "account"}>
      <TabsList>
        {canEditSite && <TabsTrigger value="profile">Profile</TabsTrigger>}
        {canEditSite && <TabsTrigger value="social">Social links</TabsTrigger>}
        {canEditSite && <TabsTrigger value="site">SEO & theme</TabsTrigger>}
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      {canEditSite ? (
        <>
          <TabsContent value="profile">
            <ProfileForm profile={profile} />
          </TabsContent>
          <TabsContent value="social">
            <SocialForm links={socialLinks} />
          </TabsContent>
          <TabsContent value="site">
            <SiteForm settings={settings} />
          </TabsContent>
        </>
      ) : (
        <p className="flex items-center gap-2 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <ShieldAlert className="size-4" aria-hidden="true" /> Site-wide settings can only be changed by administrators.
        </p>
      )}
      <TabsContent value="account">
        <PasswordForm />
      </TabsContent>
    </Tabs>
  );
}
