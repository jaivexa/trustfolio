import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getProfile, getSiteSettings } from "@/server/queries/public";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms that apply when using this website.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);
  const owner = profile?.fullName ?? settings.siteName;

  return (
    <LegalPage
      title="Terms of use"
      updatedAt={profile?.updatedAt ?? new Date().toISOString()}
      body={`By accessing this website you agree to these terms.

## Content

All content on this site — including text, case studies, images and code samples — is owned by **${owner}** or used with permission, unless stated otherwise. Client names and outcomes are shared with consent. You may not reproduce content for commercial purposes without written permission.

## No professional advice

Information on this site is provided for general purposes and does not constitute a binding offer. Engagements are governed by a separate written agreement.

## External links

Links to third-party websites are provided for convenience. I am not responsible for their content or availability.

## Acceptable use

You agree not to misuse this website, including attempting to gain unauthorised access, sending unsolicited bulk messages through the contact form, or interfering with its operation.

## Changes

These terms may be updated from time to time. Continued use of the site constitutes acceptance of the current version.`}
    />
  );
}
