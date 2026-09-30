import type { Metadata } from "next";
import { LocalizedMarkdown } from "@/components/i18n/tx";
import { PageIntro, Section } from "@/components/layout/section";
import { getPageContext } from "@/lib/i18n";
import { l10n, text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { getTrust } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/privacy", title: t.legal.privacyTitle });
}

/**
 * Describes what this software actually does with data. The trust should have
 * its own policy reviewed; this default is accurate for the platform.
 */
export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale, t } = await getPageContext(params);
  const trust = await getTrust();
  const contact = trust.contact.email ?? localePath(locale, "/contact");
  const owner = trust.namePending ? null : text(trust.name, locale);

  const body = l10n(
    `${owner ? `This website is operated by **${owner}**. ` : ""}This policy explains what information is collected when you use it and how it is handled.

## Information you provide
When you use the contact form, the name, email address, optional phone number, subject and message you submit are stored so that we can reply. A one-way hash of your IP address is stored with the message to prevent abuse; the raw IP address is never stored.

## How information is used
Your information is used only to respond to your enquiry. It is never sold or shared for marketing.

## Cookies and local storage
This site does not use advertising or tracking cookies. Your language and colour-theme preferences are remembered in your browser. Administrators who sign in receive a secure, HTTP-only session cookie.

## Personal information in published documents
Documents are published only after personal identifiers (such as government ID numbers and private contact details) have been removed or redacted.

## Your rights
You may request access to, correction of, or deletion of your personal data by contacting ${contact}.`,
    `${owner ? `இந்த இணையதளத்தை **${owner}** நடத்துகிறது. ` : ""}நீங்கள் இதைப் பயன்படுத்தும்போது எந்தத் தகவல்கள் சேகரிக்கப்படுகின்றன, அவை எவ்வாறு கையாளப்படுகின்றன என்பதை இந்தக் கொள்கை விளக்குகிறது.

## நீங்கள் வழங்கும் தகவல்கள்
தொடர்புப் படிவத்தைப் பயன்படுத்தும்போது நீங்கள் அளிக்கும் பெயர், மின்னஞ்சல் முகவரி, விருப்பத் தொலைபேசி எண், பொருள் மற்றும் செய்தி ஆகியவை உங்களுக்குப் பதிலளிப்பதற்காகச் சேமிக்கப்படுகின்றன. தவறான பயன்பாட்டைத் தடுக்க உங்கள் IP முகவரியின் ஒருவழி ஹாஷ் (hash) மட்டுமே சேமிக்கப்படுகிறது; உண்மையான IP முகவரி ஒருபோதும் சேமிக்கப்படுவதில்லை.

## தகவல்கள் எவ்வாறு பயன்படுத்தப்படுகின்றன
உங்கள் தகவல்கள் உங்கள் கோரிக்கைக்குப் பதிலளிக்க மட்டுமே பயன்படுத்தப்படுகின்றன. அவை ஒருபோதும் விற்கப்படுவதோ சந்தைப்படுத்தலுக்காகப் பகிரப்படுவதோ இல்லை.

## குக்கீகள் மற்றும் உலாவிச் சேமிப்பு
இந்தத் தளம் விளம்பர அல்லது கண்காணிப்புக் குக்கீகளைப் பயன்படுத்துவதில்லை. உங்கள் மொழி மற்றும் வண்ணத் தோற்ற விருப்பங்கள் உங்கள் உலாவியில் நினைவில் வைக்கப்படுகின்றன.

## வெளியிடப்படும் ஆவணங்களில் உள்ள தனிப்பட்ட தகவல்கள்
அரசு அடையாள எண்கள், தனிப்பட்ட தொடர்பு விவரங்கள் போன்ற தனிப்பட்ட தகவல்கள் நீக்கப்பட்ட அல்லது மறைக்கப்பட்ட பின்னரே ஆவணங்கள் வெளியிடப்படுகின்றன.

## உங்கள் உரிமைகள்
உங்கள் தனிப்பட்ட தரவைப் பார்க்க, திருத்த அல்லது நீக்கக் கோர ${contact} என்ற முகவரியில் தொடர்பு கொள்ளலாம்.`,
  );

  return (
    <>
      <PageIntro title={t.legal.privacyTitle} breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.legal.privacyTitle }]} />
      <Section>
        <LocalizedMarkdown value={body} locale={locale} t={t} className="max-w-3xl" />
      </Section>
    </>
  );
}
