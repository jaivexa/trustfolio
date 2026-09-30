-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('ACTIVITY', 'PROJECT', 'DOCUMENT', 'NEWS', 'GALLERY');

-- CreateEnum
CREATE TYPE "ProjectPhase" AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED', 'PAUSED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "DocumentLanguage" AS ENUM ('EN', 'TA', 'BILINGUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "NewsKind" AS ENUM ('NEWS', 'EVENT');

-- CreateEnum
CREATE TYPE "CertificateKind" AS ENUM ('CERTIFICATE', 'AWARD', 'RECOGNITION');

-- CreateEnum
CREATE TYPE "EvidenceArea" AS ENUM ('IDENTITY', 'REGISTRATION', 'LEADERSHIP', 'PROJECTS', 'ACTIVITIES', 'FINANCIAL', 'CERTIFICATES', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('OFFICIAL_DOCUMENT', 'PUBLIC_REGISTRY', 'ISSUER_WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'LOGIN', 'UPLOAD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "ActivityAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "status" "MessageStatus" NOT NULL DEFAULT 'UNREAD',
    "ipHash" TEXT,
    "userAgent" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altEn" TEXT,
    "altTa" TEXT,
    "captionEn" TEXT,
    "captionTa" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustProfile" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "nameEn" TEXT NOT NULL,
    "nameTa" TEXT,
    "shortNameEn" TEXT,
    "shortNameTa" TEXT,
    "taglineEn" TEXT,
    "taglineTa" TEXT,
    "heroTextEn" TEXT,
    "heroTextTa" TEXT,
    "aboutEn" TEXT,
    "aboutTa" TEXT,
    "historyEn" TEXT,
    "historyTa" TEXT,
    "purposeEn" TEXT,
    "purposeTa" TEXT,
    "geographicFocusEn" TEXT,
    "geographicFocusTa" TEXT,
    "visionEn" TEXT,
    "visionTa" TEXT,
    "missionEn" TEXT,
    "missionTa" TEXT,
    "registrationNumber" TEXT,
    "registrationOfficeEn" TEXT,
    "registrationOfficeTa" TEXT,
    "registrationDate" TIMESTAMP(3),
    "legalStatusEn" TEXT,
    "legalStatusTa" TEXT,
    "officialAddressEn" TEXT,
    "officialAddressTa" TEXT,
    "establishedDate" TIMESTAMP(3),
    "registrationDocumentId" TEXT,
    "publicEmail" TEXT,
    "publicPhone" TEXT,
    "officeHoursEn" TEXT,
    "officeHoursTa" TEXT,
    "mapUrl" TEXT,
    "logoId" TEXT,
    "heroImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "seoTitleEn" TEXT NOT NULL,
    "seoTitleTa" TEXT,
    "seoDescriptionEn" TEXT NOT NULL,
    "seoDescriptionTa" TEXT,
    "seoKeywords" TEXT[],
    "ogImageId" TEXT,
    "twitterHandle" TEXT,
    "defaultTheme" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
    "accentColor" TEXT NOT NULL DEFAULT 'teal',
    "navigation" JSONB NOT NULL DEFAULT '[]',
    "contactEnabled" BOOLEAN NOT NULL DEFAULT true,
    "footerNoteEn" TEXT,
    "footerNoteTa" TEXT,
    "analyticsDomain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trustee" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameTa" TEXT,
    "positionEn" TEXT NOT NULL,
    "positionTa" TEXT,
    "photoId" TEXT,
    "bioEn" TEXT,
    "bioTa" TEXT,
    "joinedAt" TIMESTAMP(3),
    "responsibilitiesEn" TEXT[],
    "responsibilitiesTa" TEXT[],
    "publicEmail" TEXT,
    "linkedinUrl" TEXT,
    "websiteUrl" TEXT,
    "isFounder" BOOLEAN NOT NULL DEFAULT false,
    "visionEn" TEXT,
    "visionTa" TEXT,
    "contributionEn" TEXT,
    "contributionTa" TEXT,
    "publicationConsent" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trustee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustObjective" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleTa" TEXT,
    "descriptionEn" TEXT,
    "descriptionTa" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'heart-handshake',
    "sourceReference" TEXT,
    "sourceDocumentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryEvent" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dateLabelEn" TEXT,
    "dateLabelTa" TEXT,
    "titleEn" TEXT NOT NULL,
    "titleTa" TEXT,
    "descriptionEn" TEXT,
    "descriptionTa" TEXT,
    "imageId" TEXT,
    "documentId" TEXT,
    "evidenceUrl" TEXT,
    "trusteeId" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameTa" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleTa" TEXT,
    "summaryEn" TEXT NOT NULL,
    "summaryTa" TEXT,
    "contentEn" TEXT,
    "contentTa" TEXT,
    "needEn" TEXT,
    "needTa" TEXT,
    "approachEn" TEXT,
    "approachTa" TEXT,
    "objectivesEn" TEXT,
    "objectivesTa" TEXT,
    "categoryId" TEXT,
    "phase" "ProjectPhase" NOT NULL DEFAULT 'ONGOING',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "locationEn" TEXT,
    "locationTa" TEXT,
    "coverId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "externalUrl" TEXT,
    "externalUrlLabelEn" TEXT,
    "externalUrlLabelTa" TEXT,
    "seoTitleEn" TEXT,
    "seoTitleTa" TEXT,
    "seoDescriptionEn" TEXT,
    "seoDescriptionTa" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleTa" TEXT,
    "summaryEn" TEXT NOT NULL,
    "summaryTa" TEXT,
    "descriptionEn" TEXT,
    "descriptionTa" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "locationEn" TEXT,
    "locationTa" TEXT,
    "categoryId" TEXT,
    "coverId" TEXT,
    "beneficiaries" INTEGER,
    "beneficiariesNoteEn" TEXT,
    "beneficiariesNoteTa" TEXT,
    "impactEn" TEXT,
    "impactTa" TEXT,
    "projectId" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactMetric" (
    "id" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelTa" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "prefix" TEXT,
    "suffix" TEXT,
    "unitEn" TEXT,
    "unitTa" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "periodLabelEn" TEXT,
    "periodLabelTa" TEXT,
    "methodologyEn" TEXT,
    "methodologyTa" TEXT,
    "categoryId" TEXT,
    "sourceDocumentId" TEXT,
    "reportId" TEXT,
    "projectId" TEXT,
    "isHeadline" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpactMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleTa" TEXT,
    "descriptionEn" TEXT,
    "descriptionTa" TEXT,
    "categoryId" TEXT,
    "language" "DocumentLanguage" NOT NULL DEFAULT 'EN',
    "year" INTEGER,
    "documentDate" TIMESTAMP(3),
    "fileId" TEXT,
    "originalFileId" TEXT,
    "thumbnailId" TEXT,
    "sourceEn" TEXT,
    "sourceTa" TEXT,
    "version" TEXT,
    "isRedacted" BOOLEAN NOT NULL DEFAULT false,
    "containsPersonalData" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualReport" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleTa" TEXT,
    "summaryEn" TEXT,
    "summaryTa" TEXT,
    "highlightsEn" TEXT,
    "highlightsTa" TEXT,
    "impactEn" TEXT,
    "impactTa" TEXT,
    "financialEn" TEXT,
    "financialTa" TEXT,
    "coverId" TEXT,
    "documentEnId" TEXT,
    "documentTaId" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "kind" "CertificateKind" NOT NULL DEFAULT 'CERTIFICATE',
    "titleEn" TEXT NOT NULL,
    "titleTa" TEXT,
    "issuerEn" TEXT NOT NULL,
    "issuerTa" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "credentialId" TEXT,
    "verificationUrl" TEXT,
    "descriptionEn" TEXT,
    "descriptionTa" TEXT,
    "imageId" TEXT,
    "documentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRecord" (
    "id" TEXT NOT NULL,
    "area" "EvidenceArea" NOT NULL,
    "method" "VerificationMethod" NOT NULL DEFAULT 'OFFICIAL_DOCUMENT',
    "titleEn" TEXT NOT NULL,
    "titleTa" TEXT,
    "descriptionEn" TEXT,
    "descriptionTa" TEXT,
    "referenceNumber" TEXT,
    "issuingAuthorityEn" TEXT,
    "issuingAuthorityTa" TEXT,
    "issuedAt" TIMESTAMP(3),
    "externalUrl" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "documentId" TEXT,
    "certificateId" TEXT,
    "projectId" TEXT,
    "trusteeId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameTa" TEXT,
    "roleEn" TEXT,
    "roleTa" TEXT,
    "organizationEn" TEXT,
    "organizationTa" TEXT,
    "photoId" TEXT,
    "contentEn" TEXT NOT NULL,
    "contentTa" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "relationshipEn" TEXT,
    "relationshipTa" TEXT,
    "relationshipVerified" BOOLEAN NOT NULL DEFAULT false,
    "consentObtained" BOOLEAN NOT NULL DEFAULT false,
    "projectId" TEXT,
    "activityId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleTa" TEXT,
    "summaryEn" TEXT NOT NULL,
    "summaryTa" TEXT,
    "subjectEn" TEXT,
    "subjectTa" TEXT,
    "challengeEn" TEXT,
    "challengeTa" TEXT,
    "supportEn" TEXT,
    "supportTa" TEXT,
    "journeyEn" TEXT,
    "journeyTa" TEXT,
    "outcomeEn" TEXT,
    "outcomeTa" TEXT,
    "coverId" TEXT,
    "albumId" TEXT,
    "activityId" TEXT,
    "projectId" TEXT,
    "consentObtained" BOOLEAN NOT NULL DEFAULT false,
    "anonymized" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryAlbum" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleTa" TEXT,
    "descriptionEn" TEXT,
    "descriptionTa" TEXT,
    "categoryId" TEXT,
    "date" TIMESTAMP(3),
    "locationEn" TEXT,
    "locationTa" TEXT,
    "coverId" TEXT,
    "activityId" TEXT,
    "projectId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "NewsKind" NOT NULL DEFAULT 'NEWS',
    "titleEn" TEXT NOT NULL,
    "titleTa" TEXT,
    "excerptEn" TEXT NOT NULL,
    "excerptTa" TEXT,
    "contentEn" TEXT NOT NULL,
    "contentTa" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "eventStart" TIMESTAMP(3),
    "eventEnd" TIMESTAMP(3),
    "eventLocationEn" TEXT,
    "eventLocationTa" TEXT,
    "authorName" TEXT,
    "categoryId" TEXT,
    "coverId" TEXT,
    "activityId" TEXT,
    "projectId" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "questionTa" TEXT,
    "answerEn" TEXT NOT NULL,
    "answerTa" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ActivityDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActivityDocuments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MetricActivities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MetricActivities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProjectDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectDocuments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TrusteeDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TrusteeDocuments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_entity_entityId_idx" ON "ActivityLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "RateLimit_expiresAt_idx" ON "RateLimit"("expiresAt");

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Media_storageKey_key" ON "Media"("storageKey");

-- CreateIndex
CREATE INDEX "Media_visibility_createdAt_idx" ON "Media"("visibility", "createdAt");

-- CreateIndex
CREATE INDEX "Media_mimeType_idx" ON "Media"("mimeType");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLink_platform_key" ON "SocialLink"("platform");

-- CreateIndex
CREATE INDEX "SocialLink_sortOrder_idx" ON "SocialLink"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Trustee_slug_key" ON "Trustee"("slug");

-- CreateIndex
CREATE INDEX "Trustee_status_sortOrder_idx" ON "Trustee"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "TrustObjective_status_sortOrder_idx" ON "TrustObjective"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "HistoryEvent_status_date_idx" ON "HistoryEvent"("status", "date");

-- CreateIndex
CREATE INDEX "Category_type_sortOrder_idx" ON "Category"("type", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Category_type_slug_key" ON "Category"("type", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_status_isFeatured_sortOrder_idx" ON "Project"("status", "isFeatured", "sortOrder");

-- CreateIndex
CREATE INDEX "Project_categoryId_idx" ON "Project"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_slug_key" ON "Activity"("slug");

-- CreateIndex
CREATE INDEX "Activity_status_date_idx" ON "Activity"("status", "date");

-- CreateIndex
CREATE INDEX "Activity_categoryId_idx" ON "Activity"("categoryId");

-- CreateIndex
CREATE INDEX "Activity_projectId_idx" ON "Activity"("projectId");

-- CreateIndex
CREATE INDEX "ImpactMetric_status_isHeadline_sortOrder_idx" ON "ImpactMetric"("status", "isHeadline", "sortOrder");

-- CreateIndex
CREATE INDEX "ImpactMetric_metricKey_periodEnd_idx" ON "ImpactMetric"("metricKey", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Document_slug_key" ON "Document"("slug");

-- CreateIndex
CREATE INDEX "Document_status_visibility_year_idx" ON "Document"("status", "visibility", "year");

-- CreateIndex
CREATE INDEX "Document_categoryId_idx" ON "Document"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualReport_slug_key" ON "AnnualReport"("slug");

-- CreateIndex
CREATE INDEX "AnnualReport_status_startYear_idx" ON "AnnualReport"("status", "startYear");

-- CreateIndex
CREATE INDEX "Certificate_status_sortOrder_idx" ON "Certificate"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "VerificationRecord_status_area_sortOrder_idx" ON "VerificationRecord"("status", "area", "sortOrder");

-- CreateIndex
CREATE INDEX "Testimonial_status_sortOrder_idx" ON "Testimonial"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_status_publishedAt_idx" ON "Story"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryAlbum_slug_key" ON "GalleryAlbum"("slug");

-- CreateIndex
CREATE INDEX "GalleryAlbum_status_date_idx" ON "GalleryAlbum"("status", "date");

-- CreateIndex
CREATE INDEX "GalleryImage_albumId_sortOrder_idx" ON "GalleryImage"("albumId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryImage_albumId_mediaId_key" ON "GalleryImage"("albumId", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsPost_slug_key" ON "NewsPost"("slug");

-- CreateIndex
CREATE INDEX "NewsPost_status_date_idx" ON "NewsPost"("status", "date");

-- CreateIndex
CREATE INDEX "NewsPost_kind_eventStart_idx" ON "NewsPost"("kind", "eventStart");

-- CreateIndex
CREATE INDEX "Faq_status_sortOrder_idx" ON "Faq"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "_ActivityDocuments_B_index" ON "_ActivityDocuments"("B");

-- CreateIndex
CREATE INDEX "_MetricActivities_B_index" ON "_MetricActivities"("B");

-- CreateIndex
CREATE INDEX "_ProjectDocuments_B_index" ON "_ProjectDocuments"("B");

-- CreateIndex
CREATE INDEX "_TrusteeDocuments_B_index" ON "_TrusteeDocuments"("B");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustProfile" ADD CONSTRAINT "TrustProfile_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustProfile" ADD CONSTRAINT "TrustProfile_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustProfile" ADD CONSTRAINT "TrustProfile_registrationDocumentId_fkey" FOREIGN KEY ("registrationDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSetting" ADD CONSTRAINT "SiteSetting_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trustee" ADD CONSTRAINT "Trustee_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustObjective" ADD CONSTRAINT "TrustObjective_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryEvent" ADD CONSTRAINT "HistoryEvent_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryEvent" ADD CONSTRAINT "HistoryEvent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryEvent" ADD CONSTRAINT "HistoryEvent_trusteeId_fkey" FOREIGN KEY ("trusteeId") REFERENCES "Trustee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactMetric" ADD CONSTRAINT "ImpactMetric_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactMetric" ADD CONSTRAINT "ImpactMetric_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactMetric" ADD CONSTRAINT "ImpactMetric_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "AnnualReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactMetric" ADD CONSTRAINT "ImpactMetric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_originalFileId_fkey" FOREIGN KEY ("originalFileId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReport" ADD CONSTRAINT "AnnualReport_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReport" ADD CONSTRAINT "AnnualReport_documentEnId_fkey" FOREIGN KEY ("documentEnId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReport" ADD CONSTRAINT "AnnualReport_documentTaId_fkey" FOREIGN KEY ("documentTaId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_trusteeId_fkey" FOREIGN KEY ("trusteeId") REFERENCES "Trustee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityDocuments" ADD CONSTRAINT "_ActivityDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityDocuments" ADD CONSTRAINT "_ActivityDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MetricActivities" ADD CONSTRAINT "_MetricActivities_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MetricActivities" ADD CONSTRAINT "_MetricActivities_B_fkey" FOREIGN KEY ("B") REFERENCES "ImpactMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectDocuments" ADD CONSTRAINT "_ProjectDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectDocuments" ADD CONSTRAINT "_ProjectDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrusteeDocuments" ADD CONSTRAINT "_TrusteeDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrusteeDocuments" ADD CONSTRAINT "_TrusteeDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "Trustee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
