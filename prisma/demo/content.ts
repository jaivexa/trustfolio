/**
 * DEMO SEED CONTENT — FICTIONAL.
 *
 * "Aram Community Trust" and every person, figure, document, certificate,
 * testimonial and event below are invented to demonstrate Trustfolio. None
 * of it describes a real organisation. There are deliberately no
 * registration numbers, government approvals, audited accounts or real
 * people's details. Every record is written with `isDemo: true`.
 *
 * Keys are stable: they become deterministic database ids (`demo-…`), so
 * re-running the seed updates records instead of duplicating them.
 */

export const DEMO_NOTE = {
  en: "_This is fictional demonstration content created for Trustfolio._",
  ta: "_இது Trustfolio தளத்திற்காக உருவாக்கப்பட்ட கற்பனை மாதிரி உள்ளடக்கம்._",
};

export const DEMO_METHOD = {
  en: "Fictional demo figure used to test layouts. It is not a real count and must not be reported as impact.",
  ta: "வடிவமைப்பைச் சோதிப்பதற்கான கற்பனை மாதிரி எண். இது உண்மையான கணக்கெடுப்பு அல்ல; தாக்கமாகக் குறிப்பிடக் கூடாது.",
};

type Bi = { en: string; ta: string | null };
const bi = (en: string, ta: string | null): Bi => ({ en, ta });

// ─── Media (local SVG/PDF placeholders in /public/demo) ─────────────────────

export type DemoMediaKey = keyof typeof MEDIA;

export const MEDIA = {
  "learning-hub": { file: "learning-hub.svg", alt: bi("Demo illustration: learning hub", "மாதிரி விளக்கப்படம்: கற்றல் மையம்") },
  "digital-literacy": { file: "digital-literacy.svg", alt: bi("Demo illustration: digital literacy", "மாதிரி விளக்கப்படம்: டிஜிட்டல் எழுத்தறிவு") },
  "youth-skills": { file: "youth-skills.svg", alt: bi("Demo illustration: youth skills", "மாதிரி விளக்கப்படம்: இளைஞர் திறன்கள்") },
  "women-digital": { file: "women-digital.svg", alt: bi("Demo illustration: women's digital empowerment", "மாதிரி விளக்கப்படம்: பெண்களுக்கான டிஜிட்டல் அதிகாரமளிப்பு") },
  "green-community": { file: "green-community.svg", alt: bi("Demo illustration: green community", "மாதிரி விளக்கப்படம்: பசுமைச் சமூகம்") },
  "school-support": { file: "school-support.svg", alt: bi("Demo illustration: school support", "மாதிரி விளக்கப்படம்: பள்ளி ஆதரவு") },
  "health-awareness": { file: "health-awareness.svg", alt: bi("Demo illustration: health awareness", "மாதிரி விளக்கப்படம்: சுகாதார விழிப்புணர்வு") },
  "volunteer-network": { file: "volunteer-network.svg", alt: bi("Demo illustration: volunteers", "மாதிரி விளக்கப்படம்: தன்னார்வலர்கள்") },
  "reading-program": { file: "reading-program.svg", alt: bi("Demo illustration: children's reading", "மாதிரி விளக்கப்படம்: குழந்தைகள் வாசிப்பு") },
  nutrition: { file: "nutrition.svg", alt: bi("Demo illustration: nutrition awareness", "மாதிரி விளக்கப்படம்: ஊட்டச்சத்து விழிப்புணர்வு") },
  consultation: { file: "consultation.svg", alt: bi("Demo illustration: community meeting", "மாதிரி விளக்கப்படம்: சமூகக் கூட்டம்") },
  cleanliness: { file: "cleanliness.svg", alt: bi("Demo illustration: cleanliness campaign", "மாதிரி விளக்கப்படம்: தூய்மைப் பிரச்சாரம்") },
  community: { file: "community.svg", alt: bi("Demo illustration: village community", "மாதிரி விளக்கப்படம்: கிராமச் சமூகம்") },
  "tree-plantation": { file: "tree-plantation.svg", alt: bi("Demo illustration: tree planting", "மாதிரி விளக்கப்படம்: மரம் நடுதல்") },
  "career-awareness": { file: "career-awareness.svg", alt: bi("Demo illustration: career awareness", "மாதிரி விளக்கப்படம்: தொழில் வழிகாட்டல்") },
  supplies: { file: "supplies.svg", alt: bi("Demo illustration: school supplies", "மாதிரி விளக்கப்படம்: பள்ளிப் பொருட்கள்") },
  workshop: { file: "workshop.svg", alt: bi("Demo illustration: workshop", "மாதிரி விளக்கப்படம்: பயிலரங்கு") },
  orientation: { file: "orientation.svg", alt: bi("Demo illustration: volunteer orientation", "மாதிரி விளக்கப்படம்: தன்னார்வலர் அறிமுகம்") },
  report: { file: "report.svg", alt: bi("Demo illustration: report", "மாதிரி விளக்கப்படம்: அறிக்கை") },
  trust: { file: "trust.svg", alt: bi("Demo illustration: community trust", "மாதிரி விளக்கப்படம்: சமூக அறக்கட்டளை") },
  certificate: { file: "certificate.svg", alt: bi("Demo certificate example — not a real certificate", "மாதிரிச் சான்றிதழ் — உண்மையான சான்றிதழ் அல்ல") },
  "person-1": { file: "person-1.svg", alt: bi("Placeholder portrait (demo)", "மாதிரி உருவப்படம்") },
  "person-2": { file: "person-2.svg", alt: bi("Placeholder portrait (demo)", "மாதிரி உருவப்படம்") },
  "person-3": { file: "person-3.svg", alt: bi("Placeholder portrait (demo)", "மாதிரி உருவப்படம்") },
  "person-4": { file: "person-4.svg", alt: bi("Placeholder portrait (demo)", "மாதிரி உருவப்படம்") },
  "person-5": { file: "person-5.svg", alt: bi("Placeholder portrait (demo)", "மாதிரி உருவப்படம்") },
  "person-6": { file: "person-6.svg", alt: bi("Placeholder portrait (demo)", "மாதிரி உருவப்படம்") },
  "person-7": { file: "person-7.svg", alt: bi("Placeholder portrait (demo)", "மாதிரி உருவப்படம்") },
  "person-8": { file: "person-8.svg", alt: bi("Placeholder portrait (demo)", "மாதிரி உருவப்படம்") },
  "person-9": { file: "person-9.svg", alt: bi("Placeholder portrait (demo)", "மாதிரி உருவப்படம்") },
  "person-10": { file: "person-10.svg", alt: bi("Placeholder portrait (demo)", "மாதிரி உருவப்படம்") },
  "pdf-trust-profile": { file: "trust-profile-sample.pdf", alt: bi("Trust profile sample (demo PDF)", "அறக்கட்டளை விவரக்குறிப்பு மாதிரி (மாதிரி PDF)") },
  "pdf-activity-report": { file: "activity-report.pdf", alt: bi("Demo activity report (PDF)", "மாதிரி செயல்பாட்டு அறிக்கை (PDF)") },
  "pdf-annual-report": { file: "annual-report.pdf", alt: bi("Demo annual report (PDF)", "மாதிரி ஆண்டு அறிக்கை (PDF)") },
  "pdf-project-report": { file: "project-report.pdf", alt: bi("Demo project report (PDF)", "மாதிரி திட்ட அறிக்கை (PDF)") },
  "pdf-policy": { file: "policy-document.pdf", alt: bi("Demo policy document (PDF)", "மாதிரி கொள்கை ஆவணம் (PDF)") },
  "pdf-certificate": { file: "certificate-example.pdf", alt: bi("Demo certificate example (PDF)", "மாதிரிச் சான்றிதழ் எடுத்துக்காட்டு (PDF)") },
} satisfies Record<string, { file: string; alt: Bi }>;

// ─── Trust profile & site settings ─────────────────────────────────────────

export const PROFILE = {
  name: bi("Aram Community Trust", "அறம் சமூக அறக்கட்டளை"),
  shortName: bi("Aram Trust", "அறம் அறக்கட்டளை"),
  tagline: bi("Education, opportunity and collective action for stronger communities.", "வலுவான சமூகங்களுக்காகக் கல்வி, வாய்ப்பு, கூட்டுச் செயல்பாடு."),
  heroText: bi(
    "Aram Community Trust is a fictional demonstration organization created to showcase the Trustfolio platform. The organization focuses on community development, education support, social welfare and local capacity building.",
    "அறம் சமூக அறக்கட்டளை என்பது Trustfolio தளத்தின் செயல்பாடுகளை விளக்குவதற்காக உருவாக்கப்பட்ட கற்பனை மாதிரி அமைப்பாகும். கல்வி ஆதரவு, சமூக மேம்பாடு, சமூக நலன் மற்றும் உள்ளூர் திறன் மேம்பாடு போன்ற துறைகளை எடுத்துக்காட்டாகக் கொண்டுள்ளது.",
  ),
  about: bi(
    `**DEMO DATA.** Aram Community Trust is a fictional demonstration organization created to showcase the Trustfolio platform. The organization focuses on community development, education support, social welfare and local capacity building.

In this demo, the trust works with families in and around Thirumangalam in Madurai district: weekend learning support for children, digital skills for young people and women, health awareness sessions and neighbourhood environment activities.

No part of this profile describes a real organisation, and no registration or legal status is claimed.`,
    `**மாதிரித் தரவு.** அறம் சமூக அறக்கட்டளை என்பது Trustfolio தளத்தின் செயல்பாடுகளை விளக்குவதற்காக உருவாக்கப்பட்ட கற்பனை மாதிரி அமைப்பாகும். கல்வி ஆதரவு, சமூக மேம்பாடு, சமூக நலன் மற்றும் உள்ளூர் திறன் மேம்பாடு போன்ற துறைகளை எடுத்துக்காட்டாகக் கொண்டுள்ளது.

இந்த மாதிரியில், மதுரை மாவட்டம் திருமங்கலம் மற்றும் அதைச் சுற்றியுள்ள குடும்பங்களுடன் அறக்கட்டளை பணியாற்றுகிறது: குழந்தைகளுக்கான வார இறுதி கற்றல் உதவி, இளைஞர்களுக்கும் பெண்களுக்கும் டிஜிட்டல் திறன்கள், சுகாதார விழிப்புணர்வு அமர்வுகள், அக்கம்பக்கச் சுற்றுச்சூழல் செயல்பாடுகள்.

இந்த விவரக்குறிப்பின் எந்தப் பகுதியும் உண்மையான அமைப்பைக் குறிக்கவில்லை; எந்தப் பதிவோ சட்ட அந்தஸ்தோ கோரப்படவில்லை.`,
  ),
  purpose: bi(
    "Many families in the demo area have children who are the first in their family to finish school, and few shared spaces to learn. The trust exists to make that learning easier and to bring neighbours together to solve local problems.",
    "மாதிரிப் பகுதியில் உள்ள பல குடும்பங்களில், பள்ளிப் படிப்பை முடிக்கும் முதல் தலைமுறையினராகக் குழந்தைகள் உள்ளனர்; கற்பதற்கான பொது இடங்கள் குறைவு. அந்தக் கற்றலை எளிதாக்கவும், உள்ளூர்ப் பிரச்சினைகளுக்குத் தீர்வுகாண அக்கம்பக்கத்தினரை ஒன்றிணைக்கவும் இந்த அறக்கட்டளை செயல்படுகிறது.",
  ),
  history: bi(
    "The demo trust grew out of informal study sessions organised by neighbours in 2021. Over the following years it added youth, women's and health programmes. See the timeline below — every milestone is fictional.",
    "2021-இல் அக்கம்பக்கத்தினர் நடத்திய முறைசாரா படிப்பு வகுப்புகளிலிருந்து இந்த மாதிரி அறக்கட்டளை உருவானது. அடுத்தடுத்த ஆண்டுகளில் இளைஞர், பெண்கள், சுகாதாரத் திட்டங்கள் சேர்க்கப்பட்டன. கீழே உள்ள காலவரிசையைப் பார்க்கவும் — ஒவ்வொரு நிகழ்வும் கற்பனையானது.",
  ),
  geographicFocus: bi(
    "Thirumangalam and nearby villages, Madurai district, Tamil Nadu (fictional demo setting).",
    "திருமங்கலம் மற்றும் அருகிலுள்ள கிராமங்கள், மதுரை மாவட்டம், தமிழ்நாடு (கற்பனை மாதிரி அமைவிடம்).",
  ),
  vision: bi(
    "To contribute to stronger, inclusive and resilient communities through education, opportunity and collective action.",
    "கல்வி, வாய்ப்புகள் மற்றும் கூட்டு செயல்பாடுகள் மூலம் வலுவான, உள்ளடக்கிய மற்றும் தன்னிறைவு கொண்ட சமூகங்களை உருவாக்குவதற்கு பங்களிப்பதே எங்கள் நோக்கம்.",
  ),
  mission: bi(
    "To support communities through practical programs, transparent service, collaboration and responsible use of resources.",
    "நடைமுறை திட்டங்கள், வெளிப்படையான சேவை, ஒத்துழைப்பு மற்றும் வளங்களின் பொறுப்பான பயன்பாட்டின் மூலம் சமூகங்களுக்கு ஆதரவளிப்பதே எங்கள் செயல்நோக்கம்.",
  ),
  officialAddress: bi(
    "No. 12, Demo Street, Thirumangalam, Madurai District, Tamil Nadu — DEMO ADDRESS (not a real office)",
    "எண் 12, மாதிரித் தெரு, திருமங்கலம், மதுரை மாவட்டம், தமிழ்நாடு — மாதிரி முகவரி (உண்மையான அலுவலகம் அல்ல)",
  ),
  officeHours: bi("Monday – Saturday, 10:00 am – 5:00 pm (demo)", "திங்கள் – சனி, காலை 10:00 – மாலை 5:00 (மாதிரி)"),
  publicEmail: "demo@trustfolio.example",
  publicPhone: "+91 00000 00000",
  establishedDate: "2022-06-15",
};

export const SETTINGS = {
  seoTitle: bi("Aram Community Trust (Demo)", "அறம் சமூக அறக்கட்டளை (மாதிரி)"),
  seoDescription: bi(
    "Demonstration website of a fictional Tamil Nadu charitable trust, built to showcase the Trustfolio transparency platform.",
    "Trustfolio வெளிப்படைத்தன்மைத் தளத்தை விளக்குவதற்காக உருவாக்கப்பட்ட, தமிழ்நாட்டைச் சேர்ந்த கற்பனை அறக்கட்டளையின் மாதிரி இணையதளம்.",
  ),
  seoKeywords: ["demo", "charitable trust", "Tamil Nadu", "transparency", "Trustfolio"],
  footerNote: bi(
    "Demo website — the organisation, people and figures shown are fictional.",
    "மாதிரி இணையதளம் — இதில் காட்டப்படும் அமைப்பு, நபர்கள், எண்ணிக்கைகள் அனைத்தும் கற்பனையானவை.",
  ),
};

/** Placeholder links only — never real accounts. */
export const SOCIAL_LINKS = [
  { platform: "website", label: "Website (demo)", url: "https://example.com" },
  { platform: "facebook", label: "Facebook (demo)", url: "https://example.com/demo/facebook" },
  { platform: "instagram", label: "Instagram (demo)", url: "https://example.com/demo/instagram" },
  { platform: "youtube", label: "YouTube (demo)", url: "https://example.com/demo/youtube" },
  { platform: "email", label: "Email (demo)", url: "mailto:demo@trustfolio.example" },
];

// ─── Purpose ────────────────────────────────────────────────────────────────

export const OBJECTIVES = [
  {
    key: "education",
    icon: "graduation-cap",
    title: bi("Education Support", "கல்வி ஆதரவு"),
    description: bi(
      "Help children and young people stay in learning through study support, reading programmes and learning materials.",
      "படிப்பு உதவி, வாசிப்புத் திட்டங்கள், கற்றல் பொருட்கள் மூலம் குழந்தைகளும் இளைஞர்களும் தொடர்ந்து கல்வி கற்க உதவுதல்.",
    ),
  },
  {
    key: "community",
    icon: "home",
    title: bi("Community Development", "சமூக மேம்பாடு"),
    description: bi(
      "Work with residents to identify local needs and plan practical, shared solutions.",
      "உள்ளூர்த் தேவைகளைக் கண்டறிந்து, நடைமுறைக்கு ஏற்ற பொதுத் தீர்வுகளைத் திட்டமிட ஊர் மக்களுடன் இணைந்து செயல்படுதல்.",
    ),
  },
  {
    key: "youth",
    icon: "lightbulb",
    title: bi("Youth Development", "இளைஞர் மேம்பாடு"),
    description: bi(
      "Offer career awareness, digital skills and leadership opportunities for young people.",
      "இளைஞர்களுக்குத் தொழில் வழிகாட்டல், டிஜிட்டல் திறன்கள், தலைமைப் பண்பை வளர்க்கும் வாய்ப்புகளை வழங்குதல்.",
    ),
  },
  {
    key: "women",
    icon: "users",
    title: bi("Women Empowerment", "பெண்கள் முன்னேற்றம்"),
    description: bi(
      "Support women with digital literacy, confidence building and access to information.",
      "டிஜிட்டல் எழுத்தறிவு, தன்னம்பிக்கை வளர்ப்பு, தகவல்களை அணுகும் வசதி ஆகியவற்றின் மூலம் பெண்களுக்கு ஆதரவளித்தல்.",
    ),
  },
  {
    key: "health",
    icon: "stethoscope",
    title: bi("Health Awareness", "சுகாதார விழிப்புணர்வு"),
    description: bi(
      "Share practical information on nutrition, hygiene and preventive health.",
      "ஊட்டச்சத்து, சுகாதாரப் பழக்கவழக்கங்கள், நோய்த் தடுப்பு பற்றிய நடைமுறைத் தகவல்களைப் பகிர்தல்.",
    ),
  },
  {
    key: "environment",
    icon: "sprout",
    title: bi("Environmental Responsibility", "சுற்றுச்சூழல் பொறுப்பு"),
    description: bi(
      "Encourage tree planting, clean public spaces and responsible use of resources.",
      "மரம் நடுதல், பொது இடங்களைத் தூய்மையாக வைத்தல், வளங்களைப் பொறுப்புடன் பயன்படுத்துதல் ஆகியவற்றை ஊக்குவித்தல்.",
    ),
  },
] as const;

// ─── People ─────────────────────────────────────────────────────────────────

const FICTIONAL_BIO = bi(
  "Fictional profile created for Trustfolio demonstration purposes.",
  "Trustfolio தளத்தின் மாதிரி பயன்பாட்டிற்காக உருவாக்கப்பட்ட கற்பனை சுயவிவரம்.",
);

export const TRUSTEES = [
  {
    key: "aravind",
    slug: "r-aravind",
    isFounder: true,
    photo: "person-1",
    name: bi("R. Aravind", "ஆர். அரவிந்த்"),
    position: bi("Founder & Trustee", "நிறுவனர் மற்றும் அறங்காவலர்"),
    bio: bi(
      `${FICTIONAL_BIO.en} In this demo, R. Aravind started the trust's first weekend study sessions and now guides its overall direction.`,
      `${FICTIONAL_BIO.ta} இந்த மாதிரியில், ஆர். அரவிந்த் அறக்கட்டளையின் முதல் வார இறுதி படிப்பு வகுப்புகளைத் தொடங்கி, தற்போது அதன் ஒட்டுமொத்த வழிகாட்டுதலை வழங்குகிறார்.`,
    ),
    vision: bi(
      "Every child in our area should have a quiet place to study and someone to ask for help.",
      "எங்கள் பகுதியில் உள்ள ஒவ்வொரு குழந்தைக்கும் அமைதியாகப் படிக்க ஓர் இடமும், உதவி கேட்க ஒருவரும் இருக்க வேண்டும்.",
    ),
    responsibilities: { en: ["Overall direction", "Partnerships", "Programme review"], ta: ["ஒட்டுமொத்த வழிகாட்டுதல்", "கூட்டாண்மைகள்", "திட்ட மதிப்பாய்வு"] },
  },
  {
    key: "meena",
    slug: "meena-krishnan",
    isFounder: false,
    photo: "person-2",
    name: bi("Meena Krishnan", "மீனா கிருஷ்ணன்"),
    position: bi("Managing Trustee", "நிர்வாக அறங்காவலர்"),
    bio: bi(
      `${FICTIONAL_BIO.en} In this demo, Meena manages day-to-day operations and coordinates volunteers across programmes.`,
      `${FICTIONAL_BIO.ta} இந்த மாதிரியில், மீனா அன்றாடச் செயல்பாடுகளை நிர்வகித்து, அனைத்துத் திட்டங்களிலும் தன்னார்வலர்களை ஒருங்கிணைக்கிறார்.`,
    ),
    vision: null,
    responsibilities: { en: ["Day-to-day management", "Volunteer coordination"], ta: ["அன்றாட நிர்வாகம்", "தன்னார்வலர் ஒருங்கிணைப்பு"] },
  },
  {
    key: "karthikeyan",
    slug: "s-karthikeyan",
    isFounder: false,
    photo: "person-3",
    name: bi("S. Karthikeyan", "எஸ். கார்த்திகேயன்"),
    position: bi("Secretary", "செயலாளர்"),
    bio: bi(
      `${FICTIONAL_BIO.en} In this demo, he keeps meeting records and handles the trust's correspondence.`,
      `${FICTIONAL_BIO.ta} இந்த மாதிரியில், இவர் கூட்டக் குறிப்புகளைப் பராமரித்து, அறக்கட்டளையின் கடிதப் போக்குவரத்தைக் கவனிக்கிறார்.`,
    ),
    vision: null,
    responsibilities: { en: ["Meeting records", "Correspondence"], ta: ["கூட்டக் குறிப்புகள்", "கடிதப் போக்குவரத்து"] },
  },
  {
    key: "revathi",
    slug: "revathi-raman",
    isFounder: false,
    photo: "person-4",
    name: bi("Revathi Raman", "ரேவதி ராமன்"),
    position: bi("Treasurer", "பொருளாளர்"),
    bio: bi(
      `${FICTIONAL_BIO.en} In this demo, she looks after accounts and budget planning. No financial figures are included in the demo data.`,
      `${FICTIONAL_BIO.ta} இந்த மாதிரியில், இவர் கணக்குகளையும் வரவு–செலவுத் திட்டமிடலையும் கவனிக்கிறார். மாதிரித் தரவில் நிதி விவரங்கள் எதுவும் சேர்க்கப்படவில்லை.`,
    ),
    vision: null,
    responsibilities: { en: ["Accounts", "Budget planning"], ta: ["கணக்குகள்", "வரவு–செலவுத் திட்டமிடல்"] },
  },
  {
    key: "prakash",
    slug: "m-prakash",
    isFounder: false,
    photo: "person-5",
    name: bi("M. Prakash", "எம். பிரகாஷ்"),
    position: bi("Trustee", "அறங்காவலர்"),
    bio: bi(
      `${FICTIONAL_BIO.en} In this demo, he leads the youth and environment activities.`,
      `${FICTIONAL_BIO.ta} இந்த மாதிரியில், இவர் இளைஞர் மற்றும் சுற்றுச்சூழல் செயல்பாடுகளை முன்னின்று நடத்துகிறார்.`,
    ),
    vision: null,
    responsibilities: { en: ["Youth programmes", "Environment activities"], ta: ["இளைஞர் திட்டங்கள்", "சுற்றுச்சூழல் செயல்பாடுகள்"] },
  },
] as const;

export const HISTORY = [
  {
    key: "2021",
    date: "2021-03-01",
    title: bi("Foundation concept", "அமைப்புக்கான கருத்துருவாக்கம்"),
    description: bi(
      "A group of neighbours begins meeting to discuss informal study support for local children.",
      "உள்ளூர்க் குழந்தைகளுக்கு முறைசாரா படிப்பு உதவி வழங்குவது குறித்து அக்கம்பக்கத்தினர் சிலர் கலந்துரையாடத் தொடங்குகின்றனர்.",
    ),
    trustee: null,
    document: null,
  },
  {
    key: "2022",
    date: "2022-06-15",
    title: bi("Trust formation phase", "அறக்கட்டளை உருவாக்க நிலை"),
    description: bi(
      "The founding members agree on the trust's objectives and roles. (Demo — no registration details are claimed.)",
      "நிறுவன உறுப்பினர்கள் அறக்கட்டளையின் நோக்கங்களையும் பொறுப்புகளையும் இறுதி செய்கின்றனர். (மாதிரி — பதிவு விவரங்கள் எதுவும் கோரப்படவில்லை.)",
    ),
    trustee: "aravind",
    document: null,
  },
  {
    key: "2023",
    date: "2023-06-10",
    title: bi("First community education initiative", "முதல் சமூகக் கல்வி முயற்சி"),
    description: bi(
      "Weekend learning sessions start in a borrowed community hall.",
      "இரவல் பெற்ற சமுதாயக் கூடத்தில் வார இறுதி கற்றல் வகுப்புகள் தொடங்குகின்றன.",
    ),
    trustee: null,
    document: null,
  },
  {
    key: "2024",
    date: "2024-06-01",
    title: bi("Youth development program", "இளைஞர் மேம்பாட்டுத் திட்டம்"),
    description: bi(
      "Career awareness and digital skills sessions are added for young people.",
      "இளைஞர்களுக்காகத் தொழில் வழிகாட்டல் மற்றும் டிஜிட்டல் திறன் அமர்வுகள் சேர்க்கப்படுகின்றன.",
    ),
    trustee: "prakash",
    document: null,
  },
  {
    key: "2025",
    date: "2025-02-01",
    title: bi("Community resource initiative", "சமூக வள முயற்சி"),
    description: bi(
      "A small shared library and learning-materials corner opens for residents.",
      "ஊர் மக்களுக்காகச் சிறிய பொது நூலகமும் கற்றல் பொருட்கள் பகுதியும் திறக்கப்படுகின்றன.",
    ),
    trustee: null,
    document: null,
  },
  {
    key: "2026",
    date: "2026-01-10",
    title: bi("Digital transparency initiative", "டிஜிட்டல் வெளிப்படைத்தன்மை முயற்சி"),
    description: bi(
      "The trust begins publishing its activities, documents and figures online in English and Tamil.",
      "அறக்கட்டளை தனது செயல்பாடுகள், ஆவணங்கள், எண்ணிக்கைகளை ஆங்கிலத்திலும் தமிழிலும் இணையத்தில் வெளியிடத் தொடங்குகிறது.",
    ),
    trustee: null,
    document: "trust-profile-sample",
  },
] as const;

export const FAQS = [
  {
    key: "real",
    question: bi("Is this a real organisation?", "இது உண்மையான அமைப்பா?"),
    answer: bi(
      "No. Aram Community Trust is fictional demo data used to show how Trustfolio works. The people, figures, documents and events on this site are invented.",
      "இல்லை. Trustfolio எவ்வாறு செயல்படுகிறது என்பதைக் காட்டப் பயன்படுத்தப்படும் கற்பனை மாதிரித் தரவே அறம் சமூக அறக்கட்டளை. இந்தத் தளத்தில் உள்ள நபர்கள், எண்ணிக்கைகள், ஆவணங்கள், நிகழ்வுகள் அனைத்தும் கற்பனையானவை.",
    ),
  },
  {
    key: "volunteer",
    question: bi("How can I volunteer?", "நான் எப்படித் தன்னார்வலராக இணையலாம்?"),
    answer: bi(
      "In a real deployment, visitors would write through the contact page. In this demo, messages are stored only for testing.",
      "உண்மையான பயன்பாட்டில், பார்வையாளர்கள் தொடர்புப் பக்கத்தின் மூலம் எழுதலாம். இந்த மாதிரியில், செய்திகள் சோதனைக்காக மட்டுமே சேமிக்கப்படுகின்றன.",
    ),
  },
  {
    key: "where",
    question: bi("Where does the trust work?", "அறக்கட்டளை எங்கு செயல்படுகிறது?"),
    answer: bi(
      "In the demo story, around Thirumangalam in Madurai district. The village names used in projects are illustrative.",
      "மாதிரிக் கதையில், மதுரை மாவட்டம் திருமங்கலத்தைச் சுற்றியுள்ள பகுதிகளில். திட்டங்களில் பயன்படுத்தப்பட்டுள்ள கிராமப் பெயர்கள் எடுத்துக்காட்டுக்காக மட்டுமே.",
    ),
  },
  {
    key: "figures",
    question: bi("How are the figures on this site counted?", "இந்தத் தளத்தில் உள்ள எண்ணிக்கைகள் எவ்வாறு கணக்கிடப்படுகின்றன?"),
    answer: bi(
      "Every figure shows its period, method and source. In this demo all figures are fictional and exist only to test the layout.",
      "ஒவ்வொரு எண்ணிக்கையும் அதன் காலம், கணக்கிடும் முறை, ஆதாரம் ஆகியவற்றைக் காட்டுகிறது. இந்த மாதிரியில் அனைத்து எண்ணிக்கைகளும் கற்பனையானவை; வடிவமைப்பைச் சோதிப்பதற்காக மட்டுமே உள்ளன.",
    ),
  },
] as const;

// ─── Work ──────────────────────────────────────────────────────────────────

type Place = { en: string; ta: string };
const PLACES = {
  thirumangalam: { en: "Thirumangalam, Madurai District", ta: "திருமங்கலம், மதுரை மாவட்டம்" },
  mullaiyur: { en: "Mullaiyur, Madurai District", ta: "முல்லையூர், மதுரை மாவட்டம்" },
  poovanur: { en: "Poovanur, Madurai District", ta: "பூவனூர், மதுரை மாவட்டம்" },
  kurinjipatti: { en: "Kurinjipatti, Madurai District", ta: "குறிஞ்சிப்பட்டி, மதுரை மாவட்டம்" },
  senthurai: { en: "Senthurai, Madurai District", ta: "செந்துறை, மதுரை மாவட்டம்" },
  maruthapuram: { en: "Maruthapuram, Madurai District", ta: "மருதபுரம், மதுரை மாவட்டம்" },
} satisfies Record<string, Place>;

export type ProjectKey = (typeof PROJECTS)[number]["key"];

export const PROJECTS = [
  {
    key: "learning-hub",
    slug: "community-learning-hub",
    category: "education",
    phase: "ONGOING",
    status: "PUBLISHED",
    featured: true,
    cover: "learning-hub",
    start: "2023-06-10",
    end: null,
    place: PLACES.thirumangalam,
    title: bi("Community Learning Hub", "சமூகக் கற்றல் மையம்"),
    summary: bi(
      "A weekend learning space where school children get study support, reading time and a quiet place to work.",
      "பள்ளிக் குழந்தைகளுக்குப் படிப்பு உதவி, வாசிப்பு நேரம், அமைதியாகப் படிக்க ஓர் இடம் ஆகியவற்றை வழங்கும் வார இறுதி கற்றல் மையம்.",
    ),
    need: bi(
      "Many children in the area study in crowded homes and have no one at home who can help with homework.",
      "இப்பகுதியில் உள்ள பல குழந்தைகள் நெரிசலான வீடுகளில் படிக்கின்றனர்; வீட்டுப்பாடத்தில் உதவ வீட்டில் யாரும் இல்லை.",
    ),
    approach: bi(
      "Trained volunteers run small-group sessions every Saturday and Sunday, with a reading corner and simple learning materials.",
      "பயிற்சி பெற்ற தன்னார்வலர்கள் ஒவ்வொரு சனி, ஞாயிறு அன்றும் சிறு குழு வகுப்புகளை நடத்துகின்றனர்; வாசிப்புப் பகுதியும் எளிய கற்றல் பொருட்களும் உள்ளன.",
    ),
    outcome: bi(
      "Children attend regularly and parents report more confidence with homework (demo narrative, not a measured result).",
      "குழந்தைகள் தொடர்ந்து வருகின்றனர்; வீட்டுப்பாடத்தில் தன்னம்பிக்கை கூடியுள்ளதாகப் பெற்றோர் கூறுகின்றனர் (மாதிரி விவரிப்பு, அளவிடப்பட்ட முடிவு அல்ல).",
    ),
    content: bi(
      "The hub opened in a borrowed community hall. Sessions cover reading, mathematics practice and homework help, grouped by class.",
      "இரவல் பெற்ற சமுதாயக் கூடத்தில் இந்த மையம் தொடங்கப்பட்டது. வகுப்பு வாரியாகப் பிரிக்கப்பட்டு வாசிப்பு, கணிதப் பயிற்சி, வீட்டுப்பாட உதவி ஆகியவை நடைபெறுகின்றன.",
    ),
    documents: ["project-report-learning-hub"],
  },
  {
    key: "digital-literacy",
    slug: "digital-literacy-initiative",
    category: "education",
    phase: "ONGOING",
    status: "PUBLISHED",
    featured: true,
    cover: "digital-literacy",
    start: "2024-01-15",
    end: null,
    place: PLACES.mullaiyur,
    title: bi("Digital Literacy Initiative", "டிஜிட்டல் எழுத்தறிவு முயற்சி"),
    summary: bi(
      "Short, hands-on sessions on using phones and computers safely for study, work and everyday services.",
      "படிப்பு, வேலை, அன்றாடச் சேவைகளுக்காகக் கைப்பேசி, கணினியைப் பாதுகாப்பாகப் பயன்படுத்துவது குறித்த சுருக்கமான நேரடிப் பயிற்சிகள்.",
    ),
    need: bi(
      "Young people and adults increasingly need online forms and digital payments, but few have had any guided practice.",
      "இணையப் படிவங்களும் டிஜிட்டல் பணப்பரிமாற்றங்களும் இளைஞர்களுக்கும் பெரியவர்களுக்கும் அதிகம் தேவைப்படுகின்றன; ஆனால் வழிகாட்டுதலுடன் பயிற்சி பெற்றவர்கள் மிகக் குறைவு.",
    ),
    approach: bi(
      "Two-hour workshops in Tamil on basic phone skills, safe browsing, online safety and common government service portals.",
      "அடிப்படைக் கைப்பேசித் திறன்கள், பாதுகாப்பான இணையப் பயன்பாடு, இணையப் பாதுகாப்பு, பொதுவான அரசு சேவைத் தளங்கள் குறித்துத் தமிழில் இரண்டு மணி நேரப் பயிலரங்குகள்.",
    ),
    outcome: bi(
      "Participants practise tasks they actually need, such as filling a form or checking a bus timetable (demo narrative).",
      "படிவம் நிரப்புதல், பேருந்து நேர அட்டவணையைப் பார்த்தல் போன்ற தங்களுக்கு உண்மையில் தேவையான பணிகளைப் பங்கேற்பாளர்கள் பயிற்சி செய்கின்றனர் (மாதிரி விவரிப்பு).",
    ),
    content: bi(
      "Sessions use borrowed laptops and participants' own phones. Each workshop ends with a practical task.",
      "இரவல் பெற்ற மடிக்கணினிகளும் பங்கேற்பாளர்களின் சொந்தக் கைப்பேசிகளும் பயன்படுத்தப்படுகின்றன. ஒவ்வொரு பயிலரங்கும் ஒரு நடைமுறைப் பணியுடன் நிறைவடைகிறது.",
    ),
    documents: [],
  },
  {
    key: "youth-skills",
    slug: "youth-skills-connect",
    category: "youth",
    phase: "ONGOING",
    status: "PUBLISHED",
    featured: false,
    cover: "youth-skills",
    start: "2024-06-01",
    end: null,
    place: PLACES.thirumangalam,
    title: bi("Youth Skills Connect", "இளைஞர் திறன் இணைப்பு"),
    summary: bi(
      "Career awareness and practical skills sessions that help young people plan their next step after school.",
      "பள்ளிப் படிப்புக்குப் பிறகு அடுத்த அடியைத் திட்டமிட இளைஞர்களுக்கு உதவும் தொழில் வழிகாட்டல் மற்றும் நடைமுறைத் திறன் அமர்வுகள்.",
    ),
    need: bi(
      "Students often choose courses without knowing where they lead, and have few role models in skilled jobs.",
      "மாணவர்கள் பெரும்பாலும் எந்தப் படிப்பு எங்கு வழிவகுக்கும் என்று அறியாமலேயே தேர்வு செய்கின்றனர்; திறன்சார்ந்த பணிகளில் முன்மாதிரிகள் குறைவு.",
    ),
    approach: bi(
      "Talks by working professionals, simple aptitude activities and guidance on scholarships and applications.",
      "பணியாற்றும் நிபுணர்களின் உரைகள், எளிய திறனறி செயல்பாடுகள், கல்வி உதவித்தொகை மற்றும் விண்ணப்பங்கள் குறித்த வழிகாட்டுதல்.",
    ),
    outcome: bi(
      "Young people leave with a written plan for their next academic year (demo narrative).",
      "அடுத்த கல்வியாண்டுக்கான எழுத்துப்பூர்வத் திட்டத்துடன் இளைஞர்கள் செல்கின்றனர் (மாதிரி விவரிப்பு).",
    ),
    content: bi(
      "Sessions are held after school hours and during holidays, in partnership with fictional local volunteers.",
      "பள்ளி நேரத்திற்குப் பிறகும் விடுமுறை நாட்களிலும், கற்பனை உள்ளூர்த் தன்னார்வலர்களின் ஒத்துழைப்புடன் அமர்வுகள் நடைபெறுகின்றன.",
    ),
    documents: [],
  },
  {
    key: "women-digital",
    slug: "women-digital-empowerment",
    category: "women-empowerment",
    phase: "COMPLETED",
    status: "PUBLISHED",
    featured: true,
    cover: "women-digital",
    start: "2024-08-01",
    end: "2025-03-31",
    place: PLACES.poovanur,
    title: bi("Women Digital Empowerment", "பெண்களுக்கான டிஜிட்டல் அதிகாரமளிப்பு"),
    summary: bi(
      "A series of workshops helping women use phones confidently for communication, information and small businesses.",
      "தகவல் தொடர்பு, தகவல் பெறுதல், சிறு தொழில்கள் ஆகியவற்றுக்குக் கைப்பேசியைத் தன்னம்பிக்கையுடன் பயன்படுத்தப் பெண்களுக்கு உதவும் பயிலரங்குத் தொடர்.",
    ),
    need: bi(
      "Many women in the area share a family phone and have not had time or support to learn beyond calls.",
      "இப்பகுதியில் உள்ள பல பெண்கள் குடும்பக் கைப்பேசியைப் பகிர்ந்து பயன்படுத்துகின்றனர்; அழைப்புகளுக்கு அப்பால் கற்க நேரமோ ஆதரவோ கிடைக்கவில்லை.",
    ),
    approach: bi(
      "Afternoon batches at convenient times, taught by women volunteers, with a focus on safety and privacy.",
      "வசதியான நேரத்தில் பிற்பகல் வகுப்புகள், பெண் தன்னார்வலர்களால் நடத்தப்பட்டன; பாதுகாப்பு மற்றும் தனியுரிமைக்கு முன்னுரிமை.",
    ),
    outcome: bi(
      "The planned batches were completed; several participants now help neighbours (demo narrative).",
      "திட்டமிட்ட அனைத்து வகுப்புகளும் நிறைவடைந்தன; பல பங்கேற்பாளர்கள் இப்போது அக்கம்பக்கத்தினருக்கு உதவுகின்றனர் (மாதிரி விவரிப்பு).",
    ),
    content: bi(
      "Topics included video calls, digital payments, spotting scams and finding information on government schemes.",
      "வீடியோ அழைப்புகள், டிஜிட்டல் பணப்பரிமாற்றம், மோசடிகளைக் கண்டறிதல், அரசுத் திட்டங்கள் குறித்த தகவல்களைத் தேடுதல் ஆகியவை பாடங்களில் இடம்பெற்றன.",
    ),
    documents: [],
  },
  {
    key: "green-community",
    slug: "green-community-program",
    category: "environment",
    phase: "ONGOING",
    status: "PUBLISHED",
    featured: false,
    cover: "green-community",
    start: "2025-06-05",
    end: null,
    place: PLACES.kurinjipatti,
    title: bi("Green Community Program", "பசுமைச் சமூகத் திட்டம்"),
    summary: bi(
      "Neighbourhood tree planting and cleanliness activities, with residents caring for the saplings afterwards.",
      "அக்கம்பக்க மரம் நடுதல் மற்றும் தூய்மைச் செயல்பாடுகள்; நட்ட பிறகு மரக்கன்றுகளை ஊர் மக்களே பராமரிக்கின்றனர்.",
    ),
    need: bi(
      "Streets have little shade, and waste collects near water channels during the monsoon.",
      "தெருக்களில் நிழல் குறைவு; மழைக்காலத்தில் நீர்வழிகளுக்கு அருகில் குப்பைகள் சேர்கின்றன.",
    ),
    approach: bi(
      "Residents choose planting spots, each household adopts saplings, and monthly clean-up walks follow.",
      "நடவுக்கான இடங்களை ஊர் மக்களே தேர்வு செய்கின்றனர்; ஒவ்வொரு குடும்பமும் மரக்கன்றுகளைத் தத்தெடுக்கிறது; மாதந்தோறும் தூய்மை நடைப்பயணங்கள் நடைபெறுகின்றன.",
    ),
    outcome: bi("Most saplings are cared for by the families who planted them (demo narrative).", "நட்ட குடும்பங்களே பெரும்பாலான மரக்கன்றுகளைப் பராமரிக்கின்றன (மாதிரி விவரிப்பு)."),
    content: bi(
      "The programme runs with support from school eco-clubs and local shopkeepers in the demo story.",
      "மாதிரிக் கதையில், பள்ளிச் சுற்றுச்சூழல் மன்றங்களும் உள்ளூர்க் கடைக்காரர்களும் இத்திட்டத்திற்கு ஆதரவளிக்கின்றனர்.",
    ),
    documents: [],
  },
  {
    key: "school-support",
    slug: "school-support-initiative",
    category: "education",
    phase: "COMPLETED",
    status: "PUBLISHED",
    featured: false,
    cover: "school-support",
    start: "2024-05-20",
    end: "2024-07-15",
    place: PLACES.senthurai,
    title: bi("School Support Initiative", "பள்ளி ஆதரவு முயற்சி"),
    summary: bi(
      "Learning kits distributed to students before the new academic year.",
      "புதிய கல்வியாண்டுக்கு முன் மாணவர்களுக்குக் கற்றல் தொகுப்புகள் வழங்கப்பட்டன.",
    ),
    need: bi(
      "Some families struggle to buy notebooks and stationery at the start of the school year.",
      "கல்வியாண்டின் தொடக்கத்தில் நோட்டுப் புத்தகங்கள், எழுதுபொருட்கள் வாங்கச் சில குடும்பங்கள் சிரமப்படுகின்றன.",
    ),
    approach: bi(
      "Kits were packed by volunteers and handed over at a community event, with a list shared with parents.",
      "தன்னார்வலர்கள் தொகுப்புகளைத் தயாரித்து, சமூக நிகழ்வில் வழங்கினர்; பொருட்களின் பட்டியல் பெற்றோருடன் பகிரப்பட்டது.",
    ),
    outcome: bi("All planned kits were distributed before schools reopened (demo narrative).", "பள்ளிகள் திறப்பதற்கு முன்பே திட்டமிட்ட அனைத்துத் தொகுப்புகளும் வழங்கப்பட்டன (மாதிரி விவரிப்பு)."),
    content: bi(
      "Each kit contained notebooks, a geometry box, pens and pencils, and a reading book in Tamil.",
      "ஒவ்வொரு தொகுப்பிலும் நோட்டுப் புத்தகங்கள், கணித உபகரணப் பெட்டி, பேனா, பென்சில்கள், ஒரு தமிழ் வாசிப்புப் புத்தகம் இருந்தன.",
    ),
    documents: [],
  },
  {
    key: "health-awareness",
    slug: "community-health-awareness",
    category: "health",
    phase: "ONGOING",
    status: "PUBLISHED",
    featured: false,
    cover: "health-awareness",
    start: "2025-02-01",
    end: null,
    place: PLACES.maruthapuram,
    title: bi("Community Health Awareness", "சமூகச் சுகாதார விழிப்புணர்வு"),
    summary: bi(
      "Informal sessions on nutrition, hygiene and preventive health, held in Tamil in community spaces.",
      "ஊட்டச்சத்து, சுகாதாரப் பழக்கங்கள், நோய்த் தடுப்பு குறித்து, சமுதாய இடங்களில் தமிழில் நடைபெறும் இயல்பான அமர்வுகள்.",
    ),
    need: bi(
      "Residents have questions about diet, blood pressure and child nutrition but rarely a relaxed place to ask them.",
      "உணவு முறை, இரத்த அழுத்தம், குழந்தை ஊட்டச்சத்து பற்றி மக்களுக்குக் கேள்விகள் உள்ளன; ஆனால் அவற்றைக் கேட்க இயல்பான சூழல் அரிது.",
    ),
    approach: bi(
      "Volunteer health workers lead short talks followed by open questions. The sessions give information only — no treatment.",
      "தன்னார்வச் சுகாதாரப் பணியாளர்கள் சுருக்கமான உரைகளை நடத்தி, பின்னர் கேள்விகளுக்குப் பதிலளிக்கின்றனர். அமர்வுகள் தகவல் வழங்குவதற்கு மட்டுமே — சிகிச்சை அளிக்கப்படுவதில்லை.",
    ),
    outcome: bi("Sessions are well attended and residents ask for follow-up topics (demo narrative).", "அமர்வுகளில் நல்ல வருகை உள்ளது; தொடர் தலைப்புகளை மக்கள் கேட்கின்றனர் (மாதிரி விவரிப்பு)."),
    content: bi(
      "Topics so far: balanced meals on a budget, safe drinking water, and understanding blood pressure.",
      "இதுவரை இடம்பெற்ற தலைப்புகள்: குறைந்த செலவில் சத்தான உணவு, பாதுகாப்பான குடிநீர், இரத்த அழுத்தத்தைப் புரிந்துகொள்ளுதல்.",
    ),
    documents: [],
  },
  {
    key: "volunteer-network",
    slug: "volunteer-network-program",
    category: "community-development",
    phase: "PLANNED",
    status: "DRAFT",
    featured: false,
    cover: "volunteer-network",
    start: "2026-11-01",
    end: null,
    place: PLACES.thirumangalam,
    title: bi("Volunteer Network Program", "தன்னார்வலர் வலையமைப்புத் திட்டம்"),
    summary: bi(
      "A planned programme to train and coordinate a wider network of local volunteers.",
      "உள்ளூர்த் தன்னார்வலர்களின் பரந்த வலையமைப்பைப் பயிற்றுவித்து ஒருங்கிணைப்பதற்கான திட்டமிடப்பட்ட முயற்சி.",
    ),
    need: bi(
      "Programmes depend on a few regular volunteers; more people want to help but need guidance.",
      "திட்டங்கள் சில வழக்கமான தன்னார்வலர்களையே சார்ந்துள்ளன; உதவ விரும்பும் பலருக்கு வழிகாட்டுதல் தேவை.",
    ),
    approach: bi(
      "Orientation, a simple code of conduct and a shared schedule so volunteers can choose what suits them.",
      "அறிமுகப் பயிற்சி, எளிய நடத்தை விதிமுறைகள், பொது அட்டவணை — இதனால் தன்னார்வலர்கள் தங்களுக்கு ஏற்றதைத் தேர்வு செய்யலாம்.",
    ),
    outcome: bi("Not started — this record is a draft in the demo.", "இன்னும் தொடங்கவில்லை — மாதிரியில் இது வரைவுப் பதிவு."),
    content: bi("Draft plan, not yet published on the website.", "வரைவுத் திட்டம்; இணையதளத்தில் இன்னும் வெளியிடப்படவில்லை."),
    documents: ["policy-document"],
  },
] as const;

export type ActivityKey = (typeof ACTIVITIES)[number]["key"];

const COUNTED = bi("Counted from the demo attendance sheet.", "மாதிரி வருகைப் பதிவேட்டின் அடிப்படையில் கணக்கிடப்பட்டது.");

export const ACTIVITIES = [
  {
    key: "learning-camp",
    slug: "community-learning-support-camp",
    project: "learning-hub",
    category: "education",
    date: "2025-05-10",
    end: "2025-05-11",
    cover: "learning-hub",
    place: PLACES.thirumangalam,
    beneficiaries: 64,
    title: bi("Community Learning Support Camp", "சமூகக் கற்றல் ஆதரவு முகாம்"),
    summary: bi(
      "A two-day summer camp with reading games, maths practice and study-skills sessions for Classes 4 to 8.",
      "4 முதல் 8-ஆம் வகுப்பு மாணவர்களுக்கு வாசிப்பு விளையாட்டுகள், கணிதப் பயிற்சி, படிப்புத் திறன் அமர்வுகளுடன் இரண்டு நாள் கோடை முகாம்.",
    ),
    description: bi(
      "Children rotated between reading, maths and study-skills corners. Volunteers noted which topics each group found difficult.",
      "குழந்தைகள் வாசிப்பு, கணிதம், படிப்புத் திறன் ஆகிய பகுதிகளுக்குச் சுழற்சி முறையில் சென்றனர். ஒவ்வொரு குழுவுக்கும் கடினமாக இருந்த தலைப்புகளைத் தன்னார்வலர்கள் குறித்துக்கொண்டனர்.",
    ),
    impact: bi("Topics that needed more help were added to the weekend sessions.", "கூடுதல் உதவி தேவைப்பட்ட தலைப்புகள் வார இறுதி வகுப்புகளில் சேர்க்கப்பட்டன."),
    documents: ["activity-report"],
  },
  {
    key: "reading-program",
    slug: "childrens-reading-program",
    project: "learning-hub",
    category: "education",
    date: "2025-08-16",
    end: null,
    cover: "reading-program",
    place: PLACES.thirumangalam,
    beneficiaries: 38,
    title: bi("Children's Reading Program", "குழந்தைகள் வாசிப்புத் திட்டம்"),
    summary: bi(
      "Weekly story reading and library borrowing for younger children, in Tamil and English.",
      "சிறு குழந்தைகளுக்காகத் தமிழிலும் ஆங்கிலத்திலும் வாராந்திரக் கதை வாசிப்பும் நூலக இரவலும்.",
    ),
    description: bi(
      "Volunteers read aloud, then children chose a book to take home for the week.",
      "தன்னார்வலர்கள் கதைகளை உரக்க வாசித்தனர்; பின்னர் குழந்தைகள் ஒரு வாரத்திற்கு வீட்டுக்கு எடுத்துச் செல்ல ஒரு புத்தகத்தைத் தேர்வு செய்தனர்.",
    ),
    impact: bi("Most borrowed books were returned on time, and the list of requested titles grew.", "இரவல் பெற்ற பெரும்பாலான புத்தகங்கள் உரிய நேரத்தில் திருப்பித் தரப்பட்டன; கோரப்பட்ட புத்தகங்களின் பட்டியல் வளர்ந்தது."),
    documents: ["activity-report"],
  },
  {
    key: "supplies",
    slug: "school-supplies-distribution",
    project: "school-support",
    category: "education",
    date: "2024-06-08",
    end: null,
    cover: "supplies",
    place: PLACES.senthurai,
    beneficiaries: 85,
    title: bi("School Supplies Distribution", "பள்ளிப் பொருட்கள் வழங்கல்"),
    summary: bi(
      "Learning kits handed to students and parents at a community event before schools reopened.",
      "பள்ளிகள் திறப்பதற்கு முன், சமூக நிகழ்வில் மாணவர்களுக்கும் பெற்றோருக்கும் கற்றல் தொகுப்புகள் வழங்கப்பட்டன.",
    ),
    description: bi(
      "Families collected kits against a list prepared with the help of class teachers in the demo story.",
      "மாதிரிக் கதையில், வகுப்பு ஆசிரியர்களின் உதவியுடன் தயாரிக்கப்பட்ட பட்டியலின்படி குடும்பங்கள் தொகுப்புகளைப் பெற்றுக்கொண்டன.",
    ),
    impact: bi("Students started the year with the basic materials they needed.", "தேவையான அடிப்படைப் பொருட்களுடன் மாணவர்கள் கல்வியாண்டைத் தொடங்கினர்."),
    documents: [],
  },
  {
    key: "women-workshop",
    slug: "womens-digital-literacy-workshop",
    project: "women-digital",
    category: "women-empowerment",
    date: "2024-09-21",
    end: null,
    cover: "women-digital",
    place: PLACES.poovanur,
    beneficiaries: 26,
    title: bi("Women's Digital Literacy Workshop", "பெண்களுக்கான டிஜிட்டல் எழுத்தறிவுப் பயிலரங்கு"),
    summary: bi(
      "An afternoon workshop on video calls, digital payments and recognising common phone scams.",
      "வீடியோ அழைப்பு, டிஜிட்டல் பணப்பரிமாற்றம், பொதுவான கைப்பேசி மோசடிகளைக் கண்டறிதல் குறித்த பிற்பகல் பயிலரங்கு.",
    ),
    description: bi(
      "Participants practised in pairs on their own phones, with one volunteer for every five women.",
      "பங்கேற்பாளர்கள் தங்கள் சொந்தக் கைப்பேசிகளில் இருவர் இருவராகப் பயிற்சி செய்தனர்; ஐந்து பேருக்கு ஒரு தன்னார்வலர் இருந்தார்.",
    ),
    impact: bi("Participants asked for a follow-up session on online safety.", "இணையப் பாதுகாப்பு குறித்த தொடர் அமர்வைப் பங்கேற்பாளர்கள் கேட்டனர்."),
    documents: [],
  },
  {
    key: "career-session",
    slug: "youth-career-awareness-session",
    project: "youth-skills",
    category: "youth",
    date: "2024-11-09",
    end: null,
    cover: "career-awareness",
    place: PLACES.thirumangalam,
    beneficiaries: 42,
    title: bi("Youth Career Awareness Session", "இளைஞர் தொழில் வழிகாட்டல் அமர்வு"),
    summary: bi(
      "Talks and Q&A on courses after Class 12, skilled trades and scholarship applications.",
      "பன்னிரண்டாம் வகுப்புக்குப் பிந்தைய படிப்புகள், திறன்சார் தொழில்கள், கல்வி உதவித்தொகை விண்ணப்பங்கள் குறித்த உரைகளும் கேள்வி–பதிலும்.",
    ),
    description: bi(
      "Three volunteer speakers shared their own education paths, followed by small-group questions.",
      "மூன்று தன்னார்வப் பேச்சாளர்கள் தங்கள் கல்விப் பயணத்தைப் பகிர்ந்தனர்; அதைத் தொடர்ந்து சிறு குழுக்களில் கேள்விகள் கேட்கப்பட்டன.",
    ),
    impact: bi("Students listed courses they want to explore further.", "மேலும் அறிய விரும்பும் படிப்புகளை மாணவர்கள் பட்டியலிட்டனர்."),
    documents: [],
  },
  {
    key: "digital-workshop",
    slug: "digital-skills-workshop",
    project: "digital-literacy",
    category: "education",
    date: "2025-01-25",
    end: null,
    cover: "workshop",
    place: PLACES.mullaiyur,
    beneficiaries: 30,
    title: bi("Digital Skills Workshop", "டிஜிட்டல் திறன் பயிலரங்கு"),
    summary: bi(
      "Hands-on practice with email, online forms and safe browsing for young people and adults.",
      "இளைஞர்களுக்கும் பெரியவர்களுக்கும் மின்னஞ்சல், இணையப் படிவங்கள், பாதுகாப்பான இணையப் பயன்பாடு குறித்த நேரடிப் பயிற்சி.",
    ),
    description: bi(
      "Each participant created an email account and completed a practice application form.",
      "ஒவ்வொரு பங்கேற்பாளரும் மின்னஞ்சல் கணக்கைத் தொடங்கி, ஒரு பயிற்சி விண்ணப்பப் படிவத்தை நிரப்பினர்.",
    ),
    impact: bi("Participants completed the practice tasks with volunteer support.", "தன்னார்வலர்களின் உதவியுடன் பங்கேற்பாளர்கள் பயிற்சிப் பணிகளை நிறைவு செய்தனர்."),
    documents: [],
  },
  {
    key: "health-camp",
    slug: "health-awareness-camp",
    project: "health-awareness",
    category: "health",
    date: "2025-03-15",
    end: null,
    cover: "health-awareness",
    place: PLACES.maruthapuram,
    beneficiaries: 70,
    title: bi("Health Awareness Camp", "சுகாதார விழிப்புணர்வு முகாம்"),
    summary: bi(
      "A morning of short talks on blood pressure, safe drinking water and hygiene, with open questions.",
      "இரத்த அழுத்தம், பாதுகாப்பான குடிநீர், சுகாதாரம் குறித்த சுருக்கமான உரைகளும் கேள்வி நேரமும் கொண்ட காலை நிகழ்வு.",
    ),
    description: bi(
      "An awareness session only: no diagnosis or treatment was provided. Residents were encouraged to visit their nearest health centre.",
      "இது விழிப்புணர்வு அமர்வு மட்டுமே: நோயறிதலோ சிகிச்சையோ வழங்கப்படவில்லை. அருகிலுள்ள சுகாதார நிலையத்தை அணுகுமாறு மக்கள் ஊக்குவிக்கப்பட்டனர்.",
    ),
    impact: bi("Residents requested a session on child nutrition.", "குழந்தை ஊட்டச்சத்து குறித்த அமர்வை மக்கள் கோரினர்."),
    documents: [],
  },
  {
    key: "nutrition-session",
    slug: "nutrition-awareness-session",
    project: "health-awareness",
    category: "health",
    date: "2025-07-12",
    end: null,
    cover: "nutrition",
    place: PLACES.maruthapuram,
    beneficiaries: 34,
    title: bi("Nutrition Awareness Session", "ஊட்டச்சத்து விழிப்புணர்வு அமர்வு"),
    summary: bi(
      "Practical ideas for balanced, low-cost meals for children, using locally available foods.",
      "உள்ளூரில் கிடைக்கும் உணவுப் பொருட்களைக் கொண்டு, குழந்தைகளுக்குக் குறைந்த செலவில் சத்தான உணவு தயாரிப்பதற்கான நடைமுறை யோசனைகள்.",
    ),
    description: bi(
      "Parents shared recipes and discussed millets, pulses and seasonal vegetables.",
      "பெற்றோர் சமையல் குறிப்புகளைப் பகிர்ந்து, சிறுதானியங்கள், பருப்பு வகைகள், பருவகாலக் காய்கறிகள் குறித்துக் கலந்துரையாடினர்.",
    ),
    impact: bi("A simple recipe sheet in Tamil was shared with families.", "தமிழில் எளிய சமையல் குறிப்புத் தாள் குடும்பங்களுடன் பகிரப்பட்டது."),
    documents: [],
  },
  {
    key: "tree-plantation",
    slug: "tree-plantation-drive",
    project: "green-community",
    category: "environment",
    date: "2025-06-05",
    end: null,
    cover: "tree-plantation",
    place: PLACES.kurinjipatti,
    beneficiaries: 55,
    title: bi("Tree Plantation Drive", "மரம் நடும் இயக்கம்"),
    summary: bi(
      "Residents and students planted native saplings along two streets and near the school.",
      "ஊர் மக்களும் மாணவர்களும் இரண்டு தெருக்களிலும் பள்ளிக்கு அருகிலும் நாட்டு மரக்கன்றுகளை நட்டனர்.",
    ),
    description: bi(
      "Each household adopted saplings and agreed to water them through the summer.",
      "ஒவ்வொரு குடும்பமும் மரக்கன்றுகளைத் தத்தெடுத்து, கோடை முழுவதும் அவற்றுக்குத் தண்ணீர் ஊற்ற ஒப்புக்கொண்டது.",
    ),
    impact: bi("Volunteers check the saplings once a month.", "தன்னார்வலர்கள் மாதம் ஒருமுறை மரக்கன்றுகளைப் பார்வையிடுகின்றனர்."),
    documents: ["activity-report"],
  },
  {
    key: "cleanliness",
    slug: "community-cleanliness-campaign",
    project: "green-community",
    category: "environment",
    date: "2025-10-02",
    end: null,
    cover: "cleanliness",
    place: PLACES.kurinjipatti,
    beneficiaries: 48,
    title: bi("Community Cleanliness Campaign", "சமூகத் தூய்மைப் பிரச்சாரம்"),
    summary: bi(
      "A clean-up walk along the water channel, with waste separated for recycling.",
      "நீர்வழிப் பாதையில் தூய்மை நடைப்பயணம்; மறுசுழற்சிக்காகக் குப்பைகள் தரம் பிரிக்கப்பட்டன.",
    ),
    description: bi(
      "Volunteers and residents worked in teams, with gloves and bags provided by the demo trust.",
      "மாதிரி அறக்கட்டளை வழங்கிய கையுறைகள், பைகளுடன் தன்னார்வலர்களும் ஊர் மக்களும் குழுக்களாகப் பணியாற்றினர்.",
    ),
    impact: bi("Residents agreed on a monthly clean-up day.", "மாதாந்திரத் தூய்மை நாளுக்கு ஊர் மக்கள் ஒப்புக்கொண்டனர்."),
    documents: [],
  },
  {
    key: "volunteer-orientation",
    slug: "volunteer-orientation",
    project: null,
    category: "community-development",
    date: "2026-01-18",
    end: null,
    cover: "orientation",
    place: PLACES.thirumangalam,
    beneficiaries: 24,
    title: bi("Volunteer Orientation", "தன்னார்வலர் அறிமுகக் கூட்டம்"),
    summary: bi(
      "An introduction for new volunteers: programmes, safeguarding basics and how to sign up for sessions.",
      "புதிய தன்னார்வலர்களுக்கான அறிமுகம்: திட்டங்கள், பாதுகாப்பு நெறிமுறைகளின் அடிப்படைகள், அமர்வுகளில் பதிவு செய்யும் முறை.",
    ),
    description: bi(
      "New volunteers met the programme leads and walked through the demo code of conduct.",
      "புதிய தன்னார்வலர்கள் திட்டப் பொறுப்பாளர்களைச் சந்தித்து, மாதிரி நடத்தை விதிமுறைகளை விரிவாகப் பார்த்தனர்.",
    ),
    impact: bi("New volunteers chose the programmes they want to support.", "புதிய தன்னார்வலர்கள் தாங்கள் ஆதரிக்க விரும்பும் திட்டங்களைத் தேர்வு செய்தனர்."),
    documents: ["policy-document"],
  },
  {
    key: "consultation",
    slug: "community-consultation-meeting",
    project: null,
    category: "community-development",
    date: "2026-08-22",
    end: null,
    cover: "consultation",
    place: PLACES.thirumangalam,
    beneficiaries: 40,
    title: bi("Community Consultation Meeting", "சமூகக் கலந்தாய்வுக் கூட்டம்"),
    summary: bi(
      "Residents discussed priorities for the coming year and suggested new activities.",
      "வரும் ஆண்டுக்கான முன்னுரிமைகள் குறித்து ஊர் மக்கள் கலந்துரையாடி, புதிய செயல்பாடுகளைப் பரிந்துரைத்தனர்.",
    ),
    description: bi(
      "Suggestions were grouped by theme and read back to the meeting before it closed.",
      "பரிந்துரைகள் தலைப்பு வாரியாகத் தொகுக்கப்பட்டு, கூட்டம் நிறைவடைவதற்கு முன் வாசித்துக் காட்டப்பட்டன.",
    ),
    impact: bi("Evening study support and a senior citizens' group were the most requested ideas.", "மாலை நேரப் படிப்பு உதவியும் மூத்த குடிமக்கள் குழுவும் அதிகம் கோரப்பட்ட யோசனைகள்."),
    documents: [],
  },
] as const;

export { COUNTED };

// ─── Impact ────────────────────────────────────────────────────────────────

type MetricDef = {
  key: string;
  metricKey: string;
  value: number;
  label: Bi;
  unit: Bi | null;
  category: string | null;
  headline?: boolean;
  period: "2024-25" | "2025-26" | "project";
  project?: ProjectKey;
  activities?: ActivityKey[];
};

const people = bi("people", "பேர்");
const sessions = bi("sessions", "அமர்வுகள்");

/** Organisation-wide figures for 2025–26 (10) plus an earlier period for a trend. */
export const METRICS: MetricDef[] = [
  { key: "participants-2526", metricKey: "participants-supported", value: 240, label: bi("Participants supported", "பயன்பெற்ற பங்கேற்பாளர்கள்"), unit: people, category: null, headline: true, period: "2025-26" },
  { key: "workshops-2526", metricKey: "workshops-conducted", value: 18, label: bi("Workshops conducted", "நடத்தப்பட்ட பயிலரங்குகள்"), unit: bi("workshops", "பயிலரங்குகள்"), category: null, headline: true, period: "2025-26" },
  { key: "volunteer-hours-2526", metricKey: "volunteer-hours", value: 420, label: bi("Volunteer hours", "தன்னார்வலர் சேவை நேரம்"), unit: bi("hours", "மணி நேரம்"), category: null, headline: true, period: "2025-26" },
  { key: "community-sessions-2526", metricKey: "community-sessions", value: 12, label: bi("Community sessions", "சமூக அமர்வுகள்"), unit: sessions, category: "community-development", headline: true, period: "2025-26", activities: ["consultation", "volunteer-orientation"] },
  { key: "materials-2526", metricKey: "learning-materials-distributed", value: 350, label: bi("Learning materials distributed", "வழங்கப்பட்ட கற்றல் பொருட்கள்"), unit: bi("items", "பொருட்கள்"), category: "education", period: "2025-26", activities: ["learning-camp", "reading-program"] },
  { key: "youth-2526", metricKey: "youth-participants", value: 96, label: bi("Youth participants", "இளைஞர் பங்கேற்பாளர்கள்"), unit: people, category: "youth", period: "2025-26", activities: ["digital-workshop"] },
  { key: "women-2526", metricKey: "women-participants", value: 74, label: bi("Women participants", "பெண் பங்கேற்பாளர்கள்"), unit: people, category: "women-empowerment", period: "2025-26" },
  { key: "trees-2526", metricKey: "trees-planted", value: 150, label: bi("Trees planted", "நடப்பட்ட மரக்கன்றுகள்"), unit: bi("saplings", "மரக்கன்றுகள்"), category: "environment", period: "2025-26", activities: ["tree-plantation"] },
  { key: "health-2526", metricKey: "health-awareness-sessions", value: 6, label: bi("Health awareness sessions", "சுகாதார விழிப்புணர்வு அமர்வுகள்"), unit: sessions, category: "health", period: "2025-26", activities: ["health-camp", "nutrition-session"] },
  { key: "digital-2526", metricKey: "digital-skills-sessions", value: 10, label: bi("Digital skills sessions", "டிஜிட்டல் திறன் அமர்வுகள்"), unit: sessions, category: "education", period: "2025-26", activities: ["digital-workshop"] },
  // Earlier period, so the impact page can show a comparison.
  { key: "participants-2425", metricKey: "participants-supported", value: 150, label: bi("Participants supported", "பயன்பெற்ற பங்கேற்பாளர்கள்"), unit: people, category: null, period: "2024-25" },
  { key: "workshops-2425", metricKey: "workshops-conducted", value: 11, label: bi("Workshops conducted", "நடத்தப்பட்ட பயிலரங்குகள்"), unit: bi("workshops", "பயிலரங்குகள்"), category: null, period: "2024-25" },
  { key: "volunteer-hours-2425", metricKey: "volunteer-hours", value: 260, label: bi("Volunteer hours", "தன்னார்வலர் சேவை நேரம்"), unit: bi("hours", "மணி நேரம்"), category: null, period: "2024-25" },
  { key: "community-sessions-2425", metricKey: "community-sessions", value: 7, label: bi("Community sessions", "சமூக அமர்வுகள்"), unit: sessions, category: "community-development", period: "2024-25" },
];

/** Figures reported for individual projects (small, per-project). */
export const PROJECT_METRICS: MetricDef[] = [
  { key: "clh-participants", metricKey: "learning-hub-participants", value: 120, label: bi("Learning Hub participants", "கற்றல் மையப் பங்கேற்பாளர்கள்"), unit: people, category: "education", period: "project", project: "learning-hub", activities: ["learning-camp", "reading-program"] },
  { key: "clh-sessions", metricKey: "learning-hub-sessions", value: 24, label: bi("Learning Hub sessions", "கற்றல் மைய அமர்வுகள்"), unit: sessions, category: "education", period: "project", project: "learning-hub" },
  { key: "dli-workshops", metricKey: "digital-literacy-workshops", value: 8, label: bi("Digital literacy workshops", "டிஜிட்டல் எழுத்தறிவுப் பயிலரங்குகள்"), unit: bi("workshops", "பயிலரங்குகள்"), category: "education", period: "project", project: "digital-literacy", activities: ["digital-workshop"] },
  { key: "dli-participants", metricKey: "digital-literacy-participants", value: 60, label: bi("Digital literacy participants", "டிஜிட்டல் எழுத்தறிவுப் பங்கேற்பாளர்கள்"), unit: people, category: "education", period: "project", project: "digital-literacy" },
  { key: "ysc-sessions", metricKey: "youth-skills-sessions", value: 6, label: bi("Youth career sessions", "இளைஞர் தொழில் வழிகாட்டல் அமர்வுகள்"), unit: sessions, category: "youth", period: "project", project: "youth-skills", activities: ["career-session"] },
  { key: "ysc-youth", metricKey: "youth-skills-participants", value: 45, label: bi("Youth Skills Connect participants", "இளைஞர் திறன் இணைப்புப் பங்கேற்பாளர்கள்"), unit: people, category: "youth", period: "project", project: "youth-skills" },
  { key: "wde-women", metricKey: "women-digital-trained", value: 40, label: bi("Women trained in digital skills", "டிஜிட்டல் திறன் பயிற்சி பெற்ற பெண்கள்"), unit: people, category: "women-empowerment", period: "project", project: "women-digital", activities: ["women-workshop"] },
  { key: "gcp-saplings", metricKey: "green-saplings", value: 150, label: bi("Green programme saplings planted", "பசுமைத் திட்டத்தில் நடப்பட்ட மரக்கன்றுகள்"), unit: bi("saplings", "மரக்கன்றுகள்"), category: "environment", period: "project", project: "green-community", activities: ["tree-plantation"] },
  { key: "ssi-kits", metricKey: "school-kits", value: 85, label: bi("School learning kits distributed", "வழங்கப்பட்ட பள்ளிக் கற்றல் தொகுப்புகள்"), unit: bi("kits", "தொகுப்புகள்"), category: "education", period: "project", project: "school-support", activities: ["supplies"] },
  { key: "cha-sessions", metricKey: "health-community-sessions", value: 6, label: bi("Community health sessions", "சமூகச் சுகாதார அமர்வுகள்"), unit: sessions, category: "health", period: "project", project: "health-awareness", activities: ["health-camp", "nutrition-session"] },
];

// ─── Voices ─────────────────────────────────────────────────────────────────

const PERSONA = bi("Fictional demo persona", "கற்பனை மாதிரி நபர்");

export const TESTIMONIALS = [
  {
    key: "priya",
    status: "PUBLISHED",
    photo: "person-6",
    date: "2025-09-06",
    project: "learning-hub",
    activity: "reading-program",
    name: bi("Priya S.", "பிரியா எஸ்."),
    role: bi("Community Volunteer", "சமூகத் தன்னார்வலர்"),
    content: bi(
      "Coming to the learning hub every Saturday, I saw children who were shy in the first week start asking questions by the third.",
      "ஒவ்வொரு சனிக்கிழமையும் கற்றல் மையத்துக்கு வந்தபோது, முதல் வாரத்தில் தயங்கிய குழந்தைகள் மூன்றாவது வாரத்திலேயே கேள்வி கேட்கத் தொடங்கியதைப் பார்த்தேன்.",
    ),
  },
  {
    key: "lakshmi",
    status: "PUBLISHED",
    photo: "person-7",
    date: "2024-06-20",
    project: "school-support",
    activity: "supplies",
    name: bi("Lakshmi R.", "லட்சுமி ஆர்."),
    role: bi("Parent", "பெற்றோர்"),
    content: bi(
      "The notebooks and geometry box arrived before school reopened, which made the first week much easier for my daughter.",
      "பள்ளி திறப்பதற்கு முன்பே நோட்டுப் புத்தகங்களும் கணித உபகரணப் பெட்டியும் கிடைத்ததால், என் மகளுக்கு முதல் வாரம் மிகவும் எளிதாக இருந்தது.",
    ),
  },
  {
    key: "arun",
    status: "PUBLISHED",
    photo: "person-8",
    date: "2024-11-15",
    project: "youth-skills",
    activity: "career-session",
    name: bi("Arun K.", "அருண் கே."),
    role: bi("Youth participant", "இளைஞர் பங்கேற்பாளர்"),
    content: bi(
      "The career session helped me understand which courses lead to which jobs. I now have a plan for after Class 12.",
      "எந்தப் படிப்பு எந்த வேலைக்கு வழிவகுக்கும் என்பதைத் தொழில் வழிகாட்டல் அமர்வு எனக்குப் புரியவைத்தது. பன்னிரண்டாம் வகுப்புக்குப் பிறகு என்ன செய்வது என்று இப்போது திட்டம் உள்ளது.",
    ),
  },
  {
    key: "kavitha",
    status: "PUBLISHED",
    photo: "person-9",
    date: "2024-09-28",
    project: "women-digital",
    activity: "women-workshop",
    name: bi("Kavitha M.", "கவிதா எம்."),
    role: bi("Workshop participant", "பயிலரங்கப் பங்கேற்பாளர்"),
    content: bi(
      "I learned to make a video call to my son and to check bus timings on my phone. Small things, but they matter to me.",
      "மகனுடன் வீடியோ அழைப்பில் பேசவும், கைப்பேசியில் பேருந்து நேரத்தைப் பார்க்கவும் கற்றுக்கொண்டேன். சிறிய விஷயங்கள்தான், ஆனால் எனக்கு முக்கியமானவை.",
    ),
  },
  {
    key: "selvam",
    status: "PUBLISHED",
    photo: "person-10",
    date: "2025-03-20",
    project: "health-awareness",
    activity: "health-camp",
    name: bi("N. Selvam", "என். செல்வம்"),
    role: bi("Health camp volunteer", "சுகாதார முகாம் தன்னார்வலர்"),
    content: bi(
      "People asked practical questions about diet and blood pressure. Keeping the session in Tamil and informal made a big difference.",
      "உணவு முறை, இரத்த அழுத்தம் பற்றி மக்கள் நடைமுறைக் கேள்விகளைக் கேட்டனர். அமர்வைத் தமிழில், இயல்பாக நடத்தியது பெரிய மாற்றத்தை ஏற்படுத்தியது.",
    ),
  },
  {
    key: "sudha",
    status: "DRAFT",
    photo: null,
    date: "2025-06-20",
    project: "green-community",
    activity: "tree-plantation",
    name: bi("Sudha P.", "சுதா பி."),
    role: bi("Resident", "ஊர்வாசி"),
    content: bi(
      "Our street planted saplings together, and the children now take turns watering them.",
      "எங்கள் தெருவினர் அனைவரும் சேர்ந்து மரக்கன்றுகளை நட்டோம்; இப்போது குழந்தைகள் முறைவைத்து அவற்றுக்குத் தண்ணீர் ஊற்றுகின்றனர்.",
    ),
  },
] as const;

export { PERSONA };

export const STORIES = [
  {
    key: "student",
    slug: "a-students-learning-journey",
    cover: "reading-program",
    project: "learning-hub",
    activity: "learning-camp",
    album: "education",
    title: bi("A student's learning journey", "ஒரு மாணவியின் கற்றல் பயணம்"),
    summary: bi(
      "How weekend study support helped a Class 7 student catch up in mathematics (fictional story).",
      "வார இறுதி படிப்பு உதவி, ஏழாம் வகுப்பு மாணவி ஒருவர் கணிதத்தில் முன்னேற எவ்வாறு உதவியது (கற்பனைக் கதை).",
    ),
    subject: bi("A Class 7 student (fictional, name withheld)", "ஏழாம் வகுப்பு மாணவி (கற்பனை, பெயர் குறிப்பிடப்படவில்லை)"),
    challenge: bi(
      "She had fallen behind in mathematics after a long illness and was losing interest in school.",
      "நீண்ட நாள் உடல்நலக் குறைவுக்குப் பிறகு கணிதத்தில் பின்தங்கி, பள்ளியில் ஆர்வத்தை இழந்து வந்தார்.",
    ),
    response: bi(
      "A volunteer worked with her in a small group every weekend, starting from topics she already knew.",
      "ஒரு தன்னார்வலர் ஒவ்வொரு வார இறுதியிலும் சிறு குழுவில் அவருடன் பணியாற்றினார்; அவருக்கு ஏற்கனவே தெரிந்த தலைப்புகளிலிருந்து தொடங்கினார்.",
    ),
    journey: bi(
      "Over three months she moved from basic practice to her current class topics, and began helping younger children.",
      "மூன்று மாதங்களில் அடிப்படைப் பயிற்சியிலிருந்து தனது தற்போதைய வகுப்புப் பாடங்களுக்கு முன்னேறி, இளைய குழந்தைகளுக்கும் உதவத் தொடங்கினார்.",
    ),
    outcome: bi("She now attends every session and says mathematics is her favourite subject.", "இப்போது ஒவ்வொரு வகுப்பிலும் கலந்துகொள்கிறார்; கணிதமே தனக்குப் பிடித்த பாடம் என்கிறார்."),
  },
  {
    key: "digital-youth",
    slug: "a-young-persons-digital-skills-journey",
    cover: "workshop",
    project: "digital-literacy",
    activity: "digital-workshop",
    album: "youth-programs",
    title: bi("A young person's digital skills journey", "ஓர் இளைஞரின் டிஜிட்டல் திறன் பயணம்"),
    summary: bi(
      "From never having sent an email to applying for a course online (fictional story).",
      "ஒருமுறைகூட மின்னஞ்சல் அனுப்பியிராத நிலையிலிருந்து, இணையத்தில் படிப்புக்கு விண்ணப்பிக்கும் நிலை வரை (கற்பனைக் கதை).",
    ),
    subject: bi("A 19-year-old from Mullaiyur (fictional)", "முல்லையூரைச் சேர்ந்த 19 வயது இளைஞர் (கற்பனை)"),
    challenge: bi(
      "He wanted to apply for a diploma course, but the application was only available online.",
      "டிப்ளமோ படிப்புக்கு விண்ணப்பிக்க விரும்பினார்; ஆனால் விண்ணப்பம் இணையத்தில் மட்டுமே கிடைத்தது.",
    ),
    response: bi("He joined the digital skills workshop and practised on a sample form first.", "டிஜிட்டல் திறன் பயிலரங்கில் சேர்ந்து, முதலில் மாதிரிப் படிவத்தில் பயிற்சி செய்தார்."),
    journey: bi(
      "With a volunteer's help he created an email account, scanned his certificates and completed the real form.",
      "ஒரு தன்னார்வலரின் உதவியுடன் மின்னஞ்சல் கணக்கைத் தொடங்கி, சான்றிதழ்களை ஸ்கேன் செய்து, உண்மையான படிவத்தை நிரப்பினார்.",
    ),
    outcome: bi("He submitted his application on time and now helps friends with theirs.", "உரிய நேரத்தில் விண்ணப்பத்தைச் சமர்ப்பித்தார்; இப்போது நண்பர்களுக்கும் உதவுகிறார்."),
  },
  {
    key: "women",
    slug: "womens-digital-literacy-journey",
    cover: "women-digital",
    project: "women-digital",
    activity: "women-workshop",
    album: "women-empowerment",
    title: bi("Women's digital literacy journey", "பெண்களின் டிஜிட்டல் எழுத்தறிவுப் பயணம்"),
    summary: bi(
      "A group of women who learned phone skills together and now teach others (fictional story).",
      "ஒன்றாகக் கைப்பேசித் திறன்களைக் கற்று, இப்போது மற்றவர்களுக்கும் கற்றுத்தரும் பெண்கள் குழு (கற்பனைக் கதை).",
    ),
    subject: bi("A women's self-help group in Poovanur (fictional)", "பூவனூரில் உள்ள ஒரு மகளிர் சுயஉதவிக் குழு (கற்பனை)"),
    challenge: bi(
      "Members relied on their children to read messages and could not check scheme information themselves.",
      "செய்திகளைப் படிக்கக் குழு உறுப்பினர்கள் தங்கள் பிள்ளைகளைச் சார்ந்திருந்தனர்; திட்டத் தகவல்களைத் தாங்களே பார்க்க முடியவில்லை.",
    ),
    response: bi("The group attended the workshop series together, practising with each other.", "குழுவினர் அனைவரும் சேர்ந்து பயிலரங்குத் தொடரில் கலந்துகொண்டு, ஒருவருக்கொருவர் பயிற்சி செய்தனர்."),
    journey: bi(
      "They started with voice messages and video calls, then moved to payments and safety settings.",
      "குரல் செய்திகள், வீடியோ அழைப்புகளில் தொடங்கி, பின்னர் பணப்பரிமாற்றம், பாதுகாப்பு அமைப்புகளுக்கு முன்னேறினர்.",
    ),
    outcome: bi("Two members now run an informal help session at their monthly meeting.", "இரண்டு உறுப்பினர்கள் இப்போது தங்கள் மாதாந்திரக் கூட்டத்தில் முறைசாரா உதவி அமர்வை நடத்துகின்றனர்."),
  },
  {
    key: "environment",
    slug: "a-communitys-environmental-effort",
    cover: "tree-plantation",
    project: "green-community",
    activity: "tree-plantation",
    album: "environment",
    title: bi("A community's environmental effort", "ஒரு சமூகத்தின் சுற்றுச்சூழல் முயற்சி"),
    summary: bi(
      "How two streets turned a planting day into a shared routine (fictional story).",
      "இரண்டு தெருக்கள் ஒரு மரம் நடும் நாளை எவ்வாறு பொது வழக்கமாக மாற்றின (கற்பனைக் கதை).",
    ),
    subject: bi("Residents of two streets in Kurinjipatti (fictional)", "குறிஞ்சிப்பட்டியின் இரண்டு தெருக்களில் வசிப்பவர்கள் (கற்பனை)"),
    challenge: bi(
      "Earlier planting efforts failed because nobody was responsible for watering the saplings.",
      "மரக்கன்றுகளுக்குத் தண்ணீர் ஊற்றும் பொறுப்பை யாரும் ஏற்காததால் முந்தைய நடவு முயற்சிகள் தோல்வியடைந்தன.",
    ),
    response: bi("This time, every household adopted specific saplings before planting began.", "இம்முறை, நடவு தொடங்குவதற்கு முன்பே ஒவ்வொரு குடும்பமும் குறிப்பிட்ட மரக்கன்றுகளைத் தத்தெடுத்தது."),
    journey: bi(
      "Children made name tags for the saplings, and neighbours shared water during the dry weeks.",
      "குழந்தைகள் மரக்கன்றுகளுக்குப் பெயர் அட்டைகள் செய்தனர்; வறண்ட வாரங்களில் அக்கம்பக்கத்தினர் தண்ணீரைப் பகிர்ந்துகொண்டனர்.",
    ),
    outcome: bi("Most saplings survived the summer, and the streets now hold a monthly clean-up.", "பெரும்பாலான மரக்கன்றுகள் கோடையைத் தாண்டி வளர்ந்தன; தெருக்களில் இப்போது மாதாந்திரத் தூய்மைப் பணி நடைபெறுகிறது."),
  },
  {
    key: "volunteer",
    slug: "from-participant-to-volunteer",
    cover: "orientation",
    project: null,
    activity: "volunteer-orientation",
    album: "volunteer-events",
    title: bi("From participant to volunteer", "பங்கேற்பாளரிலிருந்து தன்னார்வலராக"),
    summary: bi(
      "A former learning-hub student who returned as a volunteer (fictional story).",
      "கற்றல் மையத்தின் முன்னாள் மாணவர் ஒருவர் தன்னார்வலராகத் திரும்பி வந்த கதை (கற்பனைக் கதை).",
    ),
    subject: bi("A college student from Thirumangalam (fictional)", "திருமங்கலத்தைச் சேர்ந்த கல்லூரி மாணவர் (கற்பனை)"),
    challenge: bi(
      "He wanted to give back but was unsure whether he could teach younger children.",
      "சமூகத்திற்குத் திருப்பித் தர விரும்பினார்; ஆனால் இளைய குழந்தைகளுக்குக் கற்பிக்க முடியுமா என்று தயங்கினார்.",
    ),
    response: bi("He attended the volunteer orientation and shadowed an experienced volunteer.", "தன்னார்வலர் அறிமுகக் கூட்டத்தில் கலந்துகொண்டு, அனுபவமிக்க தன்னார்வலருடன் இணைந்து கற்றார்."),
    journey: bi("After a month of observing, he started leading a small reading group.", "ஒரு மாதம் கவனித்த பிறகு, சிறிய வாசிப்புக் குழுவை நடத்தத் தொடங்கினார்."),
    outcome: bi("He now coordinates the Sunday reading sessions.", "இப்போது ஞாயிற்றுக்கிழமை வாசிப்பு அமர்வுகளை ஒருங்கிணைக்கிறார்."),
  },
] as const;

// ─── Evidence ───────────────────────────────────────────────────────────────

const DEMO_SOURCE = bi("Aram Community Trust (fictional demo)", "அறம் சமூக அறக்கட்டளை (கற்பனை மாதிரி)");

export const DOCUMENTS = [
  {
    key: "trust-profile-sample",
    slug: "trust-profile-sample",
    category: "trust-documents",
    file: "pdf-trust-profile",
    thumbnail: "trust",
    year: 2026,
    date: "2026-01-10",
    title: bi("Trust Profile Sample", "அறக்கட்டளை விவரக்குறிப்பு மாதிரி"),
    description: bi(
      "A sample profile document showing how a trust overview can be shared. Demo file — not an official or registered document.",
      "அறக்கட்டளையின் கண்ணோட்டத்தை எவ்வாறு பகிரலாம் என்பதைக் காட்டும் மாதிரி விவரக்குறிப்பு ஆவணம். மாதிரிக் கோப்பு — அதிகாரப்பூர்வ அல்லது பதிவு செய்யப்பட்ட ஆவணம் அல்ல.",
    ),
  },
  {
    key: "activity-report",
    slug: "demo-activity-report-2025",
    category: "publications",
    file: "pdf-activity-report",
    thumbnail: "report",
    year: 2025,
    date: "2025-10-15",
    title: bi("Demo Activity Report 2025", "மாதிரி செயல்பாட்டு அறிக்கை 2025"),
    description: bi(
      "Sample activity report covering the learning camp, reading programme and tree plantation drive. Fictional content.",
      "கற்றல் முகாம், வாசிப்புத் திட்டம், மரம் நடும் இயக்கம் ஆகியவற்றை உள்ளடக்கிய மாதிரி செயல்பாட்டு அறிக்கை. கற்பனை உள்ளடக்கம்.",
    ),
  },
  {
    key: "annual-report",
    slug: "demo-annual-report-2025-26",
    category: "annual-reports",
    file: "pdf-annual-report",
    thumbnail: "report",
    year: 2026,
    date: "2026-05-30",
    title: bi("Demo Annual Report 2025–26", "மாதிரி ஆண்டு அறிக்கை 2025–26"),
    description: bi(
      "Sample annual report file. It contains no financial statements and is not audited.",
      "மாதிரி ஆண்டு அறிக்கைக் கோப்பு. இதில் நிதி அறிக்கைகள் எதுவும் இல்லை; தணிக்கை செய்யப்படவில்லை.",
    ),
  },
  {
    key: "project-report-learning-hub",
    slug: "demo-project-report-community-learning-hub",
    category: "publications",
    file: "pdf-project-report",
    thumbnail: "learning-hub",
    year: 2025,
    date: "2025-12-01",
    title: bi("Demo Project Report: Community Learning Hub", "மாதிரி திட்ட அறிக்கை: சமூகக் கற்றல் மையம்"),
    description: bi("Sample project report for the Community Learning Hub. Fictional content.", "சமூகக் கற்றல் மையத்திற்கான மாதிரி திட்ட அறிக்கை. கற்பனை உள்ளடக்கம்."),
  },
  {
    key: "policy-document",
    slug: "demo-policy-volunteer-code-of-conduct",
    category: "policies",
    file: "pdf-policy",
    thumbnail: "orientation",
    year: 2026,
    date: "2026-01-05",
    title: bi("Demo Policy Document: Volunteer Code of Conduct", "மாதிரி கொள்கை ஆவணம்: தன்னார்வலர் நடத்தை விதிமுறைகள்"),
    description: bi(
      "Sample policy showing how a code of conduct can be published. Not an adopted policy of any organisation.",
      "நடத்தை விதிமுறைகளை எவ்வாறு வெளியிடலாம் என்பதைக் காட்டும் மாதிரிக் கொள்கை. எந்த அமைப்பாலும் ஏற்றுக்கொள்ளப்பட்ட கொள்கை அல்ல.",
    ),
  },
  {
    key: "certificate-example",
    slug: "demo-certificate-example",
    category: "certificates",
    file: "pdf-certificate",
    thumbnail: "certificate",
    year: 2025,
    date: "2025-08-01",
    title: bi("Demo Certificate Example", "மாதிரிச் சான்றிதழ் எடுத்துக்காட்டு"),
    description: bi(
      "Example of how a certificate file appears in the document vault. It is not a real certificate.",
      "ஆவணக் களஞ்சியத்தில் சான்றிதழ் கோப்பு எவ்வாறு தோன்றும் என்பதற்கான எடுத்துக்காட்டு. இது உண்மையான சான்றிதழ் அல்ல.",
    ),
  },
] as const;

export type DocumentKey = (typeof DOCUMENTS)[number]["key"];

export { DEMO_SOURCE };

const NO_FINANCIALS = bi(
  "No financial statements are included in the demo data. A real report would link the audited accounts here.",
  "மாதிரித் தரவில் நிதி அறிக்கைகள் எதுவும் சேர்க்கப்படவில்லை. உண்மையான அறிக்கையில் தணிக்கை செய்யப்பட்ட கணக்குகள் இங்கு இணைக்கப்படும்.",
);

export const REPORTS = [
  {
    key: "2024-25",
    slug: "2024-25",
    periodLabel: "2024–25",
    startYear: 2024,
    document: null,
    cover: "report",
    title: bi("2024–25 Demo Annual Report", "2024–25 மாதிரி ஆண்டு அறிக்கை"),
    summary: bi(
      "Demo report metadata for the 2024–25 year. No report document has been uploaded.",
      "2024–25 ஆண்டுக்கான மாதிரி அறிக்கை விவரங்கள். அறிக்கை ஆவணம் எதுவும் பதிவேற்றப்படவில்லை.",
    ),
    highlights: bi(
      "- School Support Initiative completed\n- Women Digital Empowerment workshops began\n- Youth Skills Connect launched",
      "- பள்ளி ஆதரவு முயற்சி நிறைவடைந்தது\n- பெண்களுக்கான டிஜிட்டல் அதிகாரமளிப்புப் பயிலரங்குகள் தொடங்கின\n- இளைஞர் திறன் இணைப்பு தொடங்கப்பட்டது",
    ),
    impact: bi("See the figures below. All are fictional demo values.", "கீழே உள்ள எண்ணிக்கைகளைப் பார்க்கவும். அனைத்தும் கற்பனை மாதிரி மதிப்புகள்."),
    financial: NO_FINANCIALS,
  },
  {
    key: "2025-26",
    slug: "2025-26",
    periodLabel: "2025–26",
    startYear: 2025,
    document: "annual-report",
    cover: "report",
    title: bi("2025–26 Demo Annual Report", "2025–26 மாதிரி ஆண்டு அறிக்கை"),
    summary: bi(
      "A demo annual report showing how a year's programmes, figures and documents can be presented together.",
      "ஓராண்டின் திட்டங்கள், எண்ணிக்கைகள், ஆவணங்கள் ஆகியவற்றை ஒன்றாக எவ்வாறு வழங்கலாம் என்பதைக் காட்டும் மாதிரி ஆண்டு அறிக்கை.",
    ),
    highlights: bi(
      "- Community Learning Hub continued every weekend\n- Green Community Program started\n- Community Health Awareness sessions expanded",
      "- சமூகக் கற்றல் மையம் ஒவ்வொரு வார இறுதியிலும் தொடர்ந்தது\n- பசுமைச் சமூகத் திட்டம் தொடங்கியது\n- சமூகச் சுகாதார விழிப்புணர்வு அமர்வுகள் விரிவடைந்தன",
    ),
    impact: bi("See the figures below. All are fictional demo values.", "கீழே உள்ள எண்ணிக்கைகளைப் பார்க்கவும். அனைத்தும் கற்பனை மாதிரி மதிப்புகள்."),
    financial: NO_FINANCIALS,
  },
] as const;

const DEMO_ISSUER = bi("Demo Community Learning Network", "மாதிரி சமூகக் கற்றல் வலையமைப்பு");

export const CERTIFICATES = [
  {
    key: "leadership",
    kind: "RECOGNITION",
    credentialId: "DEMO-CERT-001",
    issuedAt: "2025-08-15",
    document: "certificate-example",
    title: bi("Community Leadership Recognition", "சமூகத் தலைமைத்துவ அங்கீகாரம்"),
  },
  { key: "volunteer", kind: "CERTIFICATE", credentialId: "DEMO-CERT-002", issuedAt: "2025-02-10", document: null, title: bi("Volunteer Development Certificate", "தன்னார்வலர் மேம்பாட்டுச் சான்றிதழ்") },
  { key: "digital", kind: "CERTIFICATE", credentialId: "DEMO-CERT-003", issuedAt: "2025-04-05", document: null, title: bi("Digital Skills Program Certificate", "டிஜிட்டல் திறன் திட்டச் சான்றிதழ்") },
  { key: "environment", kind: "RECOGNITION", credentialId: "DEMO-CERT-004", issuedAt: "2025-11-20", document: null, title: bi("Environmental Awareness Recognition", "சுற்றுச்சூழல் விழிப்புணர்வு அங்கீகாரம்") },
] as const;

export const CERTIFICATE_TEXT = {
  issuer: DEMO_ISSUER,
  description: bi(
    "Demo certificate record. The issuer is fictional and the certificate has not been verified.",
    "மாதிரிச் சான்றிதழ் பதிவு. வழங்கிய அமைப்பு கற்பனையானது; சான்றிதழ் சரிபார்க்கப்படவில்லை.",
  ),
};

/** Evidence Center entries: they point to demo files, and say so. Nothing is marked as verified. */
export const VERIFICATION = [
  {
    key: "identity",
    area: "IDENTITY",
    document: "trust-profile-sample",
    project: null,
    title: bi("Trust profile sample (demo)", "அறக்கட்டளை விவரக்குறிப்பு மாதிரி (மாதிரி)"),
  },
  {
    key: "projects",
    area: "PROJECTS",
    document: "project-report-learning-hub",
    project: "learning-hub",
    title: bi("Project report: Community Learning Hub (demo)", "திட்ட அறிக்கை: சமூகக் கற்றல் மையம் (மாதிரி)"),
  },
  {
    key: "activities",
    area: "ACTIVITIES",
    document: "activity-report",
    project: null,
    title: bi("Activity report 2025 (demo)", "செயல்பாட்டு அறிக்கை 2025 (மாதிரி)"),
  },
] as const;

export const VERIFICATION_TEXT = bi(
  "Demo record for testing the Evidence Center. The linked file is fictional and nothing here has been independently verified.",
  "Evidence Center-ஐச் சோதிப்பதற்கான மாதிரிப் பதிவு. இணைக்கப்பட்ட கோப்பு கற்பனையானது; இங்கு எதுவும் தனித்தனியாகச் சரிபார்க்கப்படவில்லை.",
);

// ─── Gallery & news ────────────────────────────────────────────────────────

export const ALBUMS = [
  {
    key: "community-activities",
    slug: "community-activities",
    category: "community-development",
    project: null,
    activity: "consultation",
    date: "2026-08-22",
    cover: "consultation",
    images: ["consultation", "community", "cleanliness", "orientation"],
    title: bi("Community Activities", "சமூகச் செயல்பாடுகள்"),
    description: bi("Meetings and neighbourhood activities (demo illustrations).", "கூட்டங்களும் அக்கம்பக்கச் செயல்பாடுகளும் (மாதிரி விளக்கப்படங்கள்)."),
  },
  {
    key: "education",
    slug: "education",
    category: "education",
    project: "learning-hub",
    activity: "learning-camp",
    date: "2025-05-10",
    cover: "learning-hub",
    images: ["learning-hub", "reading-program", "supplies", "school-support", "workshop"],
    title: bi("Education", "கல்வி"),
    description: bi("Learning hub sessions, reading and school support (demo illustrations).", "கற்றல் மைய வகுப்புகள், வாசிப்பு, பள்ளி ஆதரவு (மாதிரி விளக்கப்படங்கள்)."),
  },
  {
    key: "youth-programs",
    slug: "youth-programs",
    category: "youth",
    project: "youth-skills",
    activity: "career-session",
    date: "2024-11-09",
    cover: "youth-skills",
    images: ["career-awareness", "youth-skills", "digital-literacy", "workshop"],
    title: bi("Youth Programs", "இளைஞர் திட்டங்கள்"),
    description: bi("Career awareness and digital skills sessions (demo illustrations).", "தொழில் வழிகாட்டல், டிஜிட்டல் திறன் அமர்வுகள் (மாதிரி விளக்கப்படங்கள்)."),
  },
  {
    key: "women-empowerment",
    slug: "women-empowerment",
    category: "women-empowerment",
    project: "women-digital",
    activity: "women-workshop",
    date: "2024-09-21",
    cover: "women-digital",
    images: ["women-digital", "digital-literacy", "workshop"],
    title: bi("Women Empowerment", "பெண்கள் முன்னேற்றம்"),
    description: bi("Women's digital literacy workshops (demo illustrations).", "பெண்களுக்கான டிஜிட்டல் எழுத்தறிவுப் பயிலரங்குகள் (மாதிரி விளக்கப்படங்கள்)."),
  },
  {
    key: "environment",
    slug: "environment",
    category: "environment",
    project: "green-community",
    activity: "tree-plantation",
    date: "2025-06-05",
    cover: "tree-plantation",
    images: ["tree-plantation", "green-community", "cleanliness"],
    title: bi("Environment", "சுற்றுச்சூழல்"),
    description: bi("Tree planting and clean-up activities (demo illustrations).", "மரம் நடுதல், தூய்மைப் பணிகள் (மாதிரி விளக்கப்படங்கள்)."),
  },
  {
    key: "volunteer-events",
    slug: "volunteer-events",
    category: "events",
    project: null,
    activity: "volunteer-orientation",
    date: "2026-01-18",
    cover: "orientation",
    images: ["orientation", "volunteer-network", "consultation"],
    title: bi("Volunteer Events", "தன்னார்வலர் நிகழ்வுகள்"),
    description: bi("Volunteer orientation and team events (demo illustrations).", "தன்னார்வலர் அறிமுகமும் குழு நிகழ்வுகளும் (மாதிரி விளக்கப்படங்கள்)."),
  },
] as const;

export type AlbumKey = (typeof ALBUMS)[number]["key"];

export const NEWS = [
  {
    key: "learning-begins",
    slug: "community-learning-program-begins",
    kind: "NEWS",
    status: "PUBLISHED",
    date: "2023-06-12",
    category: "education",
    project: "learning-hub",
    activity: null,
    cover: "learning-hub",
    event: null,
    title: bi("Community Learning Program Begins", "சமூகக் கற்றல் திட்டம் தொடக்கம்"),
    excerpt: bi(
      "Weekend learning sessions opened in a borrowed community hall in Thirumangalam.",
      "திருமங்கலத்தில் இரவல் பெற்ற சமுதாயக் கூடத்தில் வார இறுதி கற்றல் வகுப்புகள் தொடங்கின.",
    ),
    content: bi(
      "The first sessions focused on reading and homework help. Parents were invited to see how the space works.",
      "முதல் வகுப்புகள் வாசிப்பு மற்றும் வீட்டுப்பாட உதவியில் கவனம் செலுத்தின. மையம் எவ்வாறு செயல்படுகிறது என்பதைப் பார்க்கப் பெற்றோர் அழைக்கப்பட்டனர்.",
    ),
  },
  {
    key: "orientation",
    slug: "volunteer-orientation-conducted",
    kind: "NEWS",
    status: "PUBLISHED",
    date: "2026-01-20",
    category: "community-development",
    project: null,
    activity: "volunteer-orientation",
    cover: "orientation",
    event: null,
    title: bi("Volunteer Orientation Conducted", "தன்னார்வலர் அறிமுகக் கூட்டம் நடைபெற்றது"),
    excerpt: bi("New volunteers met programme leads and reviewed the code of conduct.", "புதிய தன்னார்வலர்கள் திட்டப் பொறுப்பாளர்களைச் சந்தித்து நடத்தை விதிமுறைகளைப் பார்வையிட்டனர்."),
    content: bi(
      "The orientation covered each programme, basic safeguarding and how to choose sessions.",
      "அறிமுகக் கூட்டத்தில் ஒவ்வொரு திட்டமும், அடிப்படைப் பாதுகாப்பு நெறிமுறைகளும், அமர்வுகளைத் தேர்வு செய்யும் முறையும் விளக்கப்பட்டன.",
    ),
  },
  {
    key: "women-workshop",
    slug: "digital-literacy-workshop-completed",
    kind: "NEWS",
    status: "PUBLISHED",
    date: "2024-09-23",
    category: "women-empowerment",
    project: "women-digital",
    activity: "women-workshop",
    cover: "women-digital",
    event: null,
    title: bi("Digital Literacy Workshop Completed", "டிஜிட்டல் எழுத்தறிவுப் பயிலரங்கு நிறைவு"),
    excerpt: bi("Women in Poovanur practised video calls, payments and scam awareness.", "பூவனூர்ப் பெண்கள் வீடியோ அழைப்பு, பணப்பரிமாற்றம், மோசடி விழிப்புணர்வு ஆகியவற்றில் பயிற்சி பெற்றனர்."),
    content: bi("Participants asked for a follow-up session on online safety, planned for next month.", "இணையப் பாதுகாப்பு குறித்த தொடர் அமர்வைப் பங்கேற்பாளர்கள் கேட்டனர்; அது அடுத்த மாதம் திட்டமிடப்பட்டுள்ளது."),
  },
  {
    key: "youth-session",
    slug: "youth-skills-session-held",
    kind: "NEWS",
    status: "PUBLISHED",
    date: "2024-11-11",
    category: "youth",
    project: "youth-skills",
    activity: "career-session",
    cover: "career-awareness",
    event: null,
    title: bi("Youth Skills Session Held", "இளைஞர் திறன் அமர்வு நடைபெற்றது"),
    excerpt: bi("Students heard from volunteer speakers about courses and careers.", "படிப்புகள், தொழில்கள் குறித்துத் தன்னார்வப் பேச்சாளர்களிடமிருந்து மாணவர்கள் அறிந்துகொண்டனர்."),
    content: bi("Small-group questions followed the talks, and students listed courses to explore.", "உரைகளைத் தொடர்ந்து சிறு குழுக்களில் கேள்விகள் கேட்கப்பட்டன; மேலும் அறிய விரும்பும் படிப்புகளை மாணவர்கள் பட்டியலிட்டனர்."),
  },
  {
    key: "environment-drive",
    slug: "environment-awareness-drive",
    kind: "EVENT",
    status: "PUBLISHED",
    date: "2026-09-15",
    category: "environment",
    project: "green-community",
    activity: null,
    cover: "green-community",
    event: { start: "2026-10-18", end: null, place: PLACES.kurinjipatti },
    title: bi("Environment Awareness Drive", "சுற்றுச்சூழல் விழிப்புணர்வு இயக்கம்"),
    excerpt: bi("An upcoming morning walk and sapling check with students and residents.", "மாணவர்களும் ஊர் மக்களும் பங்கேற்கும் வரவிருக்கும் காலை நடைப்பயணமும் மரக்கன்றுப் பார்வையிடலும்."),
    content: bi(
      "Volunteers will check last year's saplings, replace any that did not survive and talk about waste separation.",
      "கடந்த ஆண்டு நடப்பட்ட மரக்கன்றுகளைத் தன்னார்வலர்கள் பார்வையிட்டு, பட்டுப்போனவற்றுக்குப் பதிலாகப் புதியவற்றை நடுவர்; குப்பைகளைத் தரம் பிரிப்பது குறித்தும் பேசுவர்.",
    ),
  },
  {
    key: "consultation",
    slug: "community-consultation-session",
    kind: "EVENT",
    status: "PUBLISHED",
    date: "2026-08-10",
    category: "community-development",
    project: null,
    activity: "consultation",
    cover: "consultation",
    event: { start: "2026-08-22", end: null, place: PLACES.thirumangalam },
    title: bi("Community Consultation Session", "சமூகக் கலந்தாய்வு அமர்வு"),
    excerpt: bi("Residents were invited to share priorities for the coming year.", "வரும் ஆண்டுக்கான முன்னுரிமைகளைப் பகிர ஊர் மக்கள் அழைக்கப்பட்டனர்."),
    content: bi("The session was open to all residents. A summary of suggestions will be shared.", "இந்த அமர்வு அனைத்து ஊர் மக்களுக்கும் திறந்திருந்தது. பரிந்துரைகளின் சுருக்கம் பகிரப்படும்."),
  },
  {
    key: "education-support",
    slug: "education-support-activity",
    kind: "NEWS",
    status: "ARCHIVED",
    date: "2024-06-10",
    category: "education",
    project: "school-support",
    activity: "supplies",
    cover: "supplies",
    event: null,
    title: bi("Education Support Activity", "கல்வி ஆதரவுச் செயல்பாடு"),
    excerpt: bi("Learning kits were distributed before schools reopened. (Archived demo post.)", "பள்ளிகள் திறப்பதற்கு முன் கற்றல் தொகுப்புகள் வழங்கப்பட்டன. (காப்பகப்படுத்தப்பட்ட மாதிரிப் பதிவு.)"),
    content: bi("Families collected kits at a community event.", "சமூக நிகழ்வில் குடும்பங்கள் தொகுப்புகளைப் பெற்றுக்கொண்டன."),
  },
  {
    key: "annual-review",
    slug: "annual-activity-review",
    kind: "NEWS",
    status: "DRAFT",
    date: "2026-04-15",
    category: "updates",
    project: null,
    activity: null,
    cover: "report",
    event: null,
    // Tamil left empty on purpose, to demonstrate "Translation missing" in the admin.
    title: bi("Annual Activity Review", "ஆண்டுச் செயல்பாட்டு மதிப்பாய்வு"),
    excerpt: bi("A draft review of the year's programmes, waiting for Tamil translation.", null),
    content: bi("Draft: summarise each programme, what worked and what the trust will change next year.", null),
  },
] as const;

// ─── Contact messages ──────────────────────────────────────────────────────

export const MESSAGES = [
  {
    key: "volunteer",
    status: "UNREAD",
    locale: "en",
    at: "2026-09-28T09:15:00Z",
    name: "Kumar V.",
    email: "kumar.v@example.com",
    phone: null,
    subject: "Volunteering on weekends",
    message: "Hello, I am a college student and free on Saturdays. Can I help at the learning hub? (demo message)",
  },
  {
    key: "project",
    status: "UNREAD",
    locale: "ta",
    at: "2026-09-27T14:40:00Z",
    name: "தேவி ஆர்.",
    email: "devi.r@example.com",
    phone: "+91 00000 00000",
    subject: "கற்றல் மையம் பற்றிய விவரம்",
    message: "வணக்கம். என் மகனை வார இறுதி வகுப்புகளில் சேர்க்க விரும்புகிறேன். எந்த வகுப்பு மாணவர்கள் சேரலாம்? (மாதிரிச் செய்தி)",
  },
  {
    key: "partnership",
    status: "READ",
    locale: "en",
    at: "2026-09-20T11:05:00Z",
    name: "Anitha S.",
    email: "anitha.s@example.com",
    phone: null,
    subject: "Partnership with our college NSS unit",
    message: "Our NSS unit would like to partner on the green community programme next semester. (demo message)",
  },
  {
    key: "document",
    status: "READ",
    locale: "en",
    at: "2026-09-12T08:30:00Z",
    name: "Rahul M.",
    email: "rahul.m@example.com",
    phone: null,
    subject: "Request for the 2025–26 report",
    message: "Could you share the full 2025–26 annual report and any audited statements? (demo message)",
  },
  {
    key: "digital-timings",
    status: "REPLIED",
    locale: "en",
    at: "2026-08-30T16:20:00Z",
    name: "Sangeetha P.",
    email: "sangeetha.p@example.com",
    phone: null,
    subject: "Digital literacy class timings",
    message: "When is the next digital literacy batch for women? Afternoons suit me best. (demo message)",
  },
  {
    key: "books",
    status: "REPLIED",
    locale: "en",
    at: "2026-08-18T10:00:00Z",
    name: "Joseph D.",
    email: "joseph.d@example.com",
    phone: null,
    subject: "Donating used books",
    message: "I have about 40 children's books in good condition. Can I drop them off? (demo message)",
  },
  {
    key: "general-ta",
    status: "ARCHIVED",
    locale: "ta",
    at: "2026-07-02T12:45:00Z",
    name: "முருகன் கே.",
    email: "murugan.k@example.com",
    phone: null,
    subject: "பொதுவான கேள்வி",
    message: "உங்கள் அலுவலகம் எந்த நாட்களில் திறந்திருக்கும்? (மாதிரிச் செய்தி)",
  },
  {
    key: "general",
    status: "ARCHIVED",
    locale: "en",
    at: "2026-06-15T07:10:00Z",
    name: "Demo Tester",
    email: "tester@example.com",
    phone: null,
    subject: "General question",
    message: "This is a demo message used to test the archive folder.",
  },
] as const;
