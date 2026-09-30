import type { Metadata } from "next";
import { LocalizedMarkdown } from "@/components/i18n/tx";
import { PageIntro, Section } from "@/components/layout/section";
import { getPageContext } from "@/lib/i18n";
import { l10n } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/terms", title: t.legal.termsTitle });
}

export default async function TermsPage({ params }: PageProps<"/[locale]/terms">) {
  const { locale, t } = await getPageContext(params);
  const body = l10n(
    `By using this website you agree to these terms.

## Content
Text, photographs and documents on this site are published by the trust for information and transparency. Unless stated otherwise, they may not be reproduced for commercial purposes without permission.

## Accuracy
We publish information from our records and official documents and correct errors when we become aware of them. If you believe something is inaccurate, please contact us.

## External links
Links to other websites, including issuers and public registries, are provided so you can check information independently. We are not responsible for their content.

## Acceptable use
Do not misuse this website, attempt unauthorised access, or send unsolicited bulk messages through the contact form.`,
    `இந்த இணையதளத்தைப் பயன்படுத்துவதன் மூலம் இந்த விதிமுறைகளை ஏற்றுக்கொள்கிறீர்கள்.

## உள்ளடக்கம்
இந்தத் தளத்தில் உள்ள உரைகள், புகைப்படங்கள் மற்றும் ஆவணங்கள் தகவல் மற்றும் வெளிப்படைத்தன்மைக்காக அறக்கட்டளையால் வெளியிடப்படுகின்றன. வேறுவிதமாகக் குறிப்பிடப்படாவிட்டால், அனுமதியின்றி வணிக நோக்கங்களுக்காக அவற்றை மீண்டும் பயன்படுத்தக் கூடாது.

## துல்லியம்
எங்கள் பதிவுகள் மற்றும் அதிகாரப்பூர்வ ஆவணங்களிலிருந்து தகவல்களை வெளியிடுகிறோம்; பிழைகள் தெரியவரும்போது திருத்துகிறோம். ஏதேனும் தவறு இருப்பதாக நீங்கள் கருதினால், எங்களைத் தொடர்பு கொள்ளுங்கள்.

## வெளி இணைப்புகள்
வழங்கியவர்கள் மற்றும் பொதுப் பதிவேடுகள் உள்ளிட்ட பிற இணையதளங்களுக்கான இணைப்புகள், நீங்களே தகவல்களைச் சரிபார்க்க உதவுவதற்காக வழங்கப்படுகின்றன. அவற்றின் உள்ளடக்கத்திற்கு நாங்கள் பொறுப்பல்ல.

## ஏற்கத்தக்க பயன்பாடு
இந்த இணையதளத்தைத் தவறாகப் பயன்படுத்தவோ, அங்கீகாரமற்ற அணுகலுக்கு முயலவோ, தொடர்புப் படிவத்தின் மூலம் தேவையற்ற மொத்தச் செய்திகளை அனுப்பவோ கூடாது.`,
  );
  return (
    <>
      <PageIntro title={t.legal.termsTitle} breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.legal.termsTitle }]} />
      <Section>
        <LocalizedMarkdown value={body} locale={locale} t={t} className="max-w-3xl" />
      </Section>
    </>
  );
}
