import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getProfile, getSiteSettings } from "@/server/queries/public";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How personal data submitted through this website is collected, used and protected.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);
  const owner = profile?.fullName ?? settings.siteName;
  const email = profile?.email ?? "the email address listed on this site";

  return (
    <LegalPage
      title="Privacy policy"
      updatedAt={profile?.updatedAt ?? new Date().toISOString()}
      body={`This website is operated by **${owner}**. This policy explains what information is collected when you use it and how it is handled.

## Information you provide

When you use the contact form, the name, email address, subject and message you submit are stored so that I can reply to you. A one-way hash of your IP address is stored with the message to prevent abuse; the raw IP address is never stored.

## How information is used

Your information is used only to respond to your enquiry and, where relevant, to discuss a potential engagement. It is never sold or shared with third parties for marketing.

## Cookies and local storage

This site does not use advertising or tracking cookies. Your preferred colour theme is saved in your browser's local storage. Administrators who sign in receive a secure, HTTP-only session cookie.

## Retention

Messages are kept for as long as needed to handle your enquiry and are periodically deleted or archived.

## Your rights

You may request access to, correction of, or deletion of your personal data at any time by contacting ${email}.`}
    />
  );
}
