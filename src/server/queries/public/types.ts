/**
 * Serializable DTOs passed from the data layer to UI components. Text is
 * bilingual (`Localized`), dates are ISO strings so values survive caching.
 * Only PUBLISHED content and PUBLIC media ever reach these shapes.
 */
import type { Localized, OptionalLocalized } from "@/lib/i18n/localized";
import type {
  CertificateKind,
  DocumentLanguage,
  EvidenceArea,
  NewsKind,
  ProjectPhase,
  ThemePreference,
  VerificationMethod,
} from "@/generated/prisma/enums";
import type { NavKey } from "@/lib/constants";

export type MediaDTO = {
  id: string;
  url: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  alt: OptionalLocalized;
  caption: OptionalLocalized;
};

export type CategoryDTO = { id: string; slug: string; name: Localized };

export type LinkRef = { slug: string; title: Localized };

export type SocialLinkDTO = { id: string; platform: string; label: string; url: string };

export type TrustDTO = {
  name: Localized;
  /** True until the official name has been entered in the admin. */
  namePending: boolean;
  shortName: OptionalLocalized;
  tagline: OptionalLocalized;
  heroText: OptionalLocalized;
  about: OptionalLocalized;
  history: OptionalLocalized;
  purpose: OptionalLocalized;
  geographicFocus: OptionalLocalized;
  vision: OptionalLocalized;
  mission: OptionalLocalized;
  registration: {
    number: string | null;
    office: OptionalLocalized;
    date: string | null;
    legalStatus: OptionalLocalized;
    address: OptionalLocalized;
    established: string | null;
    document: DocumentCardDTO | null;
  };
  contact: {
    email: string | null;
    phone: string | null;
    hours: OptionalLocalized;
    mapUrl: string | null;
    address: OptionalLocalized;
  };
  logo: MediaDTO | null;
  heroImage: MediaDTO | null;
  socialLinks: SocialLinkDTO[];
  updatedAt: string;
};

export type SettingsDTO = {
  seoTitle: Localized;
  seoDescription: Localized;
  seoKeywords: string[];
  ogImage: MediaDTO | null;
  twitterHandle: string | null;
  defaultTheme: ThemePreference;
  accentColor: string;
  navigation: { key: NavKey; visible: boolean }[];
  contactEnabled: boolean;
  footerNote: OptionalLocalized;
  analyticsDomain: string | null;
};

export type TrusteeCardDTO = {
  id: string;
  slug: string;
  name: Localized;
  position: Localized;
  photo: MediaDTO | null;
  isFounder: boolean;
  bioExcerpt: OptionalLocalized;
};

export type TrusteeDTO = TrusteeCardDTO & {
  bio: OptionalLocalized;
  joinedAt: string | null;
  responsibilities: { en: string[]; ta: string[] };
  publicEmail: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  vision: OptionalLocalized;
  contribution: OptionalLocalized;
  timeline: HistoryEventDTO[];
  documents: DocumentCardDTO[];
  updatedAt: string;
};

export type ObjectiveDTO = {
  id: string;
  title: Localized;
  description: OptionalLocalized;
  icon: string;
  sourceReference: string | null;
  sourceDocument: LinkRef | null;
};

export type HistoryEventDTO = {
  id: string;
  date: string;
  dateLabel: OptionalLocalized;
  title: Localized;
  description: OptionalLocalized;
  image: MediaDTO | null;
  document: LinkRef | null;
  evidenceUrl: string | null;
};

export type FaqDTO = { id: string; question: Localized; answer: Localized };

export type ProjectCardDTO = {
  id: string;
  slug: string;
  title: Localized;
  summary: Localized;
  category: CategoryDTO | null;
  phase: ProjectPhase;
  startDate: string | null;
  endDate: string | null;
  location: OptionalLocalized;
  cover: MediaDTO | null;
  isFeatured: boolean;
};

export type ActivityCardDTO = {
  id: string;
  slug: string;
  title: Localized;
  summary: Localized;
  date: string;
  endDate: string | null;
  location: OptionalLocalized;
  category: CategoryDTO | null;
  cover: MediaDTO | null;
  beneficiaries: number | null;
  project: LinkRef | null;
};

export type DocumentCardDTO = {
  id: string;
  slug: string;
  title: Localized;
  description: OptionalLocalized;
  category: CategoryDTO | null;
  language: DocumentLanguage;
  year: number | null;
  documentDate: string | null;
  version: string | null;
  isRedacted: boolean;
  file: { url: string; mimeType: string; size: number; filename: string } | null;
  thumbnail: MediaDTO | null;
  publishedAt: string | null;
  updatedAt: string;
};

export type DocumentDTO = DocumentCardDTO & {
  source: OptionalLocalized;
  related: { type: "project" | "activity" | "trustee"; slug: string; title: Localized }[];
};

export type AlbumCardDTO = {
  id: string;
  slug: string;
  title: Localized;
  description: OptionalLocalized;
  date: string | null;
  location: OptionalLocalized;
  category: CategoryDTO | null;
  cover: MediaDTO | null;
  imageCount: number;
};

export type AlbumDTO = AlbumCardDTO & {
  images: MediaDTO[];
  activity: LinkRef | null;
  project: LinkRef | null;
};

export type TestimonialDTO = {
  id: string;
  name: Localized;
  role: OptionalLocalized;
  organization: OptionalLocalized;
  photo: MediaDTO | null;
  content: Localized;
  date: string;
  relationship: OptionalLocalized;
  relationshipVerified: boolean;
  project: LinkRef | null;
};

export type MetricDTO = {
  id: string;
  metricKey: string;
  label: Localized;
  value: number;
  prefix: string | null;
  suffix: string | null;
  unit: OptionalLocalized;
  periodStart: string | null;
  periodEnd: string | null;
  periodLabel: OptionalLocalized;
  methodology: OptionalLocalized;
  category: CategoryDTO | null;
  sourceDocument: LinkRef | null;
  report: { slug: string; periodLabel: string; title: Localized } | null;
  project: LinkRef | null;
  activities: LinkRef[];
  isHeadline: boolean;
  updatedAt: string;
};

export type StoryCardDTO = {
  id: string;
  slug: string;
  title: Localized;
  summary: Localized;
  cover: MediaDTO | null;
  publishedAt: string | null;
  anonymized: boolean;
};

export type StoryDTO = StoryCardDTO & {
  subject: OptionalLocalized;
  challenge: OptionalLocalized;
  support: OptionalLocalized;
  journey: OptionalLocalized;
  outcome: OptionalLocalized;
  images: MediaDTO[];
  activity: LinkRef | null;
  project: LinkRef | null;
};

export type VerificationRecordDTO = {
  id: string;
  area: EvidenceArea;
  method: VerificationMethod;
  title: Localized;
  description: OptionalLocalized;
  referenceNumber: string | null;
  issuingAuthority: OptionalLocalized;
  issuedAt: string | null;
  externalUrl: string | null;
  lastCheckedAt: string | null;
  document: LinkRef | null;
};

export type ProjectDTO = ProjectCardDTO & {
  content: OptionalLocalized;
  need: OptionalLocalized;
  approach: OptionalLocalized;
  objectives: OptionalLocalized;
  externalUrl: string | null;
  externalUrlLabel: OptionalLocalized;
  seoTitle: OptionalLocalized;
  seoDescription: OptionalLocalized;
  activities: ActivityCardDTO[];
  documents: DocumentCardDTO[];
  testimonials: TestimonialDTO[];
  metrics: MetricDTO[];
  albums: AlbumDTO[];
  stories: StoryCardDTO[];
  verificationRecords: VerificationRecordDTO[];
  related: ProjectCardDTO[];
  publishedAt: string | null;
  updatedAt: string;
};

export type ActivityDTO = ActivityCardDTO & {
  description: OptionalLocalized;
  beneficiariesNote: OptionalLocalized;
  impact: OptionalLocalized;
  documents: DocumentCardDTO[];
  albums: AlbumDTO[];
  stories: StoryCardDTO[];
  testimonials: TestimonialDTO[];
  publishedAt: string | null;
  updatedAt: string;
};

export type ReportCardDTO = {
  id: string;
  slug: string;
  periodLabel: string;
  startYear: number;
  title: Localized;
  summary: OptionalLocalized;
  cover: MediaDTO | null;
  documentEn: DocumentCardDTO | null;
  documentTa: DocumentCardDTO | null;
  updatedAt: string;
};

export type ReportDTO = ReportCardDTO & {
  highlights: OptionalLocalized;
  impact: OptionalLocalized;
  financial: OptionalLocalized;
  metrics: MetricDTO[];
};

export type CertificateDTO = {
  id: string;
  kind: CertificateKind;
  title: Localized;
  issuer: Localized;
  issuedAt: string | null;
  expiresAt: string | null;
  credentialId: string | null;
  verificationUrl: string | null;
  description: OptionalLocalized;
  image: MediaDTO | null;
  document: LinkRef | null;
};

export type NewsCardDTO = {
  id: string;
  slug: string;
  kind: NewsKind;
  title: Localized;
  excerpt: Localized;
  date: string;
  eventStart: string | null;
  eventEnd: string | null;
  eventLocation: OptionalLocalized;
  category: CategoryDTO | null;
  cover: MediaDTO | null;
};

export type NewsDTO = NewsCardDTO & {
  content: Localized;
  authorName: string | null;
  activity: LinkRef | null;
  project: LinkRef | null;
  updatedAt: string;
};

export type EvidenceCoverageKey =
  | "identity"
  | "registration"
  | "leadership"
  | "projects"
  | "activities"
  | "impact"
  | "documents"
  | "certificates"
  | "reports"
  | "testimonials";

export type EvidenceCoverageDTO = Record<EvidenceCoverageKey, { available: boolean; count: number }>;
