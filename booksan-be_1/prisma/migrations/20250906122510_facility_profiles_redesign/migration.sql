-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('BASIC', 'MODERN', 'CLASSIC', 'SPORT_SPECIFIC', 'PREMIUM');

-- CreateTable
CREATE TABLE "facility_page_templates" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "html_template" TEXT NOT NULL,
    "css_template" TEXT NOT NULL,
    "js_template" TEXT,
    "preview_image" TEXT,
    "category" "TemplateCategory" NOT NULL DEFAULT 'BASIC',
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_page_templates_pkey" PRIMARY KEY ("_id")
);

-- Add slug column to facilities (optional first)
ALTER TABLE "facilities" ADD COLUMN "slug" TEXT;

-- Generate slugs for existing facilities
UPDATE "facilities" 
SET "slug" = LOWER(REPLACE(REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9\s-]', '', 'g'), ' ', '-'), '--', '-')) || '-' || SUBSTRING("_id", -6)
WHERE "slug" IS NULL;

-- Make slug unique and not null
ALTER TABLE "facilities" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "facilities_slug_key" ON "facilities"("slug");

-- Update facility_profiles table structure
-- First backup existing data
CREATE TEMPORARY TABLE facility_profiles_backup AS 
SELECT * FROM "facility_profiles";

-- Drop old facility_profiles table
DROP TABLE "facility_profiles";

-- Create new facility_profiles table with updated structure
CREATE TABLE "facility_profiles" (
    "_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "template_id" TEXT,
    "custom_html" TEXT,
    "custom_css" TEXT,
    "meta_title" TEXT,
    "meta_keywords" TEXT[],
    "meta_description" TEXT,
    "open_graph_title" TEXT,
    "open_graph_description" TEXT,
    "open_graph_image" TEXT,
    "is_customized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_profiles_pkey" PRIMARY KEY ("_id")
);

-- Create unique index
CREATE UNIQUE INDEX "facility_profiles_facility_id_key" ON "facility_profiles"("facility_id");

-- Add foreign key constraints
ALTER TABLE "facility_profiles" ADD CONSTRAINT "facility_profiles_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "facility_profiles" ADD CONSTRAINT "facility_profiles_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "facility_page_templates"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing facility_profiles data
-- Link facility profiles to facilities instead of users
INSERT INTO "facility_profiles" ("_id", "facility_id", "meta_keywords", "meta_description", "createdAt", "updatedAt")
SELECT 
    fp._id,
    f._id as facility_id,
    fp.meta_keywords,
    fp.meta_description,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM facility_profiles_backup fp
JOIN "facilities" f ON f.owner_id = fp.owner_id
-- Only migrate if there's a one-to-one relationship
WHERE fp.owner_id IN (
    SELECT owner_id 
    FROM "facilities" 
    GROUP BY owner_id 
    HAVING COUNT(*) = 1
);

-- Drop the temporary backup table
DROP TABLE facility_profiles_backup;
