import { notFound } from "next/navigation";
import { Metadata } from "next";
import { FacilityPageClient } from "@/components/venue/FacilityPageClient";
import { api } from "@/lib/fetcher";
import {
  generateVenuePageMetadata,
  generateVenueStructuredData,
} from "@/lib/seo/venue-seo";

interface VenuePageProps {
  params: Promise<{
    params?: string[];
  }>;
}

interface FacilityPageData {
  html: string;
  css: string;
  metaTitle?: string;
  metaKeywords: string[];
  metaDescription?: string;
  openGraphTitle?: string;
  openGraphDesc?: string;
  openGraphImage?: string;
  slug: string;
  facilityName: string;
  facilityDescription?: string;
  isCustomized: boolean;
}

interface FacilitySEOData {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImage?: string;
  canonicalUrl: string;
  structuredData: Record<string, unknown>;
}

async function getFacilityPageData(
  slug: string
): Promise<FacilityPageData | null> {
  try {
    const data = await api.get<FacilityPageData>(`/venues/${slug}/page`, {
      revalidate: 3600, // Cache for 1 hour
      tags: ["venues", `venue-${slug}`],
    });

    return data;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      return null;
    }
    throw error;
  }
}

async function getFacilitySEOData(
  slug: string
): Promise<FacilitySEOData | null> {
  try {
    const data = await api.get<FacilitySEOData>(`/venues/${slug}/seo`, {
      revalidate: 3600, // Cache for 1 hour
      tags: ["venues", `venue-${slug}-seo`],
    });
    return data;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      return null;
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: VenuePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.params?.[0];

  if (!slug) {
    return {
      title: "Venue Not Found",
      description: "The requested venue could not be found.",
    };
  }

  const seoData = await getFacilitySEOData(slug);

  if (!seoData) {
    return {
      title: "Venue Not Found",
      description: "The requested venue could not be found.",
    };
  }

  return generateVenuePageMetadata(seoData);
}

export default async function VenuePage({ params }: VenuePageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.params?.[0];

  // If no params, redirect to search page
  if (!slug) {
    return <VenueSearchPage />;
  }

  // If slug is 'search', show search page
  if (slug === "search") {
    return <VenueSearchPage />;
  }

  // Otherwise, show individual venue page
  const [pageData, seoData] = await Promise.all([
    getFacilityPageData(slug),
    getFacilitySEOData(slug),
  ]);

  if (!pageData || !seoData) {
    notFound();
  }

  const structuredData = generateVenueStructuredData({
    name: pageData.facilityName,
    description: pageData.facilityDescription || "",
    slug: pageData.slug,
    ...seoData.structuredData,
  });

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <FacilityPageClient pageData={pageData} slug={slug} />
    </>
  );
}

// Import the search page component
async function VenueSearchPage() {
  const { default: SearchPage } = await import("../search/page");
  return <SearchPage searchParams={Promise.resolve({})} />;
}

// Generate static params for popular venues (optional)
export async function generateStaticParams() {
  // You can implement this to pre-generate popular venue pages
  // For now, we'll use ISR (Incremental Static Regeneration)
  return [];
}
