import { fetchInitialFacilities } from "@/app/(search)/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchFiltersWrapper } from "@/components/facility/SearchFiltersWrapper";
import { FacilityListClient } from "@/components/facility/FacilityListClient";
import {
  buildCanonicalUrl,
  generatePageDescription,
  generatePageTitle,
  parseSearchParams,
  shouldNoIndex,
} from "@/lib/search/params";
import {
  generateOpenGraphData,
  generateSearchResultsStructuredData,
  generateTwitterCardData,
} from "@/lib/seo/structuredData";
import { Metadata } from "next";
import { Suspense } from "react";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const parsedSearchParams = await parseSearchParams(searchParams);

  const title = generatePageTitle(undefined, undefined, undefined, parsedSearchParams);
  const description = generatePageDescription(undefined, undefined, undefined, parsedSearchParams);
  const canonicalUrl = buildCanonicalUrl(parsedSearchParams);
  const noIndex = shouldNoIndex(parsedSearchParams);

  // Generate OpenGraph and Twitter data
  const openGraph = generateOpenGraphData({
    canonicalUrl,
  });

  const twitter = generateTwitterCardData({});

  return {
    title,
    description,
    robots: noIndex ? "noindex,nofollow" : "index,follow",
    openGraph,
    twitter,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const parsedSearchParams = await parseSearchParams(searchParams);

  // Fetch initial facilities for SSR
  const result = await fetchInitialFacilities(undefined, undefined, undefined, searchParams);
  if (!result.success || !result.data) {
    // Handle error state
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Search Error</h1>
          <p className="text-muted-foreground">
            {result.error || "Failed to load facilities. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  const facilityData = result.data;
  const canonicalUrl = buildCanonicalUrl(parsedSearchParams);

  // Generate structured data for SEO
  const structuredData = generateSearchResultsStructuredData({
    facilities: facilityData.facilities,
    totalCount: facilityData.total,
    currentPage: parsedSearchParams.page,
    canonicalUrl,
  });

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.itemList),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.breadcrumbList),
        }}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {generatePageTitle(
              undefined,
              undefined,
              undefined,
              parsedSearchParams
            ).replace(" - Booksan", "")}
          </h1>
          <p className="text-muted-foreground">
            {generatePageDescription(
              undefined,
              undefined,
              undefined,
              parsedSearchParams
            )}
          </p>
        </div>

        {/* Search Filters */}
        <Suspense fallback={<FiltersSkeleton />}>
          <SearchFiltersWrapper
            currentParams={parsedSearchParams}
          />
        </Suspense>

        {/* Facility List with Infinite Scroll */}
        <Suspense fallback={<FacilityListSkeleton />}>
          <FacilityListClient
            initialData={facilityData}
            searchParams={{
              page: parsedSearchParams.page,
              sort: parsedSearchParams.sort,
              radius_km: parsedSearchParams.radius_km,
              open_now: parsedSearchParams.open_now,
              price_min: parsedSearchParams.price_min,
              price_max: parsedSearchParams.price_max,
              ...(parsedSearchParams.sport && { sport: parsedSearchParams.sport }),
              ...(parsedSearchParams.q && { q: parsedSearchParams.q }),
              ...(parsedSearchParams.city && { city: parsedSearchParams.city }),
              ...(parsedSearchParams.district && { district: parsedSearchParams.district }),
              ...(parsedSearchParams.lat && { lat: parsedSearchParams.lat }),
              ...(parsedSearchParams.lng && { lng: parsedSearchParams.lng }),
              ...(parsedSearchParams.cursor && { cursor: parsedSearchParams.cursor }),
            }}
          />
        </Suspense>
      </div>
    </>
  );
}

// Loading skeletons
function FiltersSkeleton() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
}

function FacilityListSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
