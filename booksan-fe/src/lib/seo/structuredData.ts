import { Facility } from "@/features/search/types";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface StructuredDataOptions {
  sport?: string;
  city?: string;
  district?: string;
  facilities: Facility[];
  totalCount: number;
  currentPage: number;
  canonicalUrl: string;
}

/**
 * Generate JSON-LD structured data for facility search results
 */
export function generateSearchResultsStructuredData({
  sport,
  city,
  district,
  facilities,
  totalCount,
  currentPage,
  canonicalUrl,
}: StructuredDataOptions) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Generate breadcrumbs
  const breadcrumbs = generateBreadcrumbs(sport, city, district);

  // Generate ItemList for facilities
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: generateListName(sport, city, district),
    description: generateListDescription(sport, city, district),
    url: canonicalUrl,
    numberOfItems: totalCount,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: facilities.map((facility, index) => ({
      "@type": "ListItem",
      position: (currentPage - 1) * 20 + index + 1, // Assuming 20 items per page
      item: generateFacilityStructuredData(facility),
    })),
  };

  // Generate BreadcrumbList
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: `${baseUrl}${breadcrumb.url}`,
    })),
  };

  return {
    itemList,
    breadcrumbList,
  };
}

/**
 * Generate structured data for a single facility
 */
function generateFacilityStructuredData(facility: Facility) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    "@type": "SportsActivityLocation",
    "@id": `${baseUrl}/facilities/${facility.id}`,
    name: facility.name,
    description: facility.description,
    url: `${baseUrl}/facilities/${facility.id}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: facility.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: facility.location.lat,
      longitude: facility.location.lon,
    },
    telephone: facility.phone,
    ...(facility.website && { sameAs: [facility.website] }),
    ...(facility.rating &&
      facility.reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: facility.rating,
          reviewCount: facility.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    ...(facility.priceRange && {
      priceRange: `$${facility.priceRange.min}-$${facility.priceRange.max}`,
    }),
    sport: facility.courts
      .map((court) => court.sport)
      .filter((sport, index, array) => array.indexOf(sport) === index),
    amenityFeature: facility.courts.map((court) => ({
      "@type": "LocationFeatureSpecification",
      name: court.name,
      value: court.sport,
    })),
    ...(facility.isPublished && {
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        businessFunction: "https://schema.org/LeaseOut",
      },
    }),
  };
}

/**
 * Generate breadcrumbs for navigation
 */
function generateBreadcrumbs(
  sport?: string,
  city?: string,
  district?: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", url: "/" },
    { name: "Facilities", url: "/facilities" },
    { name: "Search", url: "/facilities/search" },
  ];

  if (sport) {
    breadcrumbs.push({
      name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Facilities`,
      url: `/facilities/search?sport=${sport}`,
    });
  }

  if (city) {
    breadcrumbs.push({
      name: city,
      url: `/facilities/search?city=${city}`,
    });
  }

  if (district) {
    breadcrumbs.push({
      name: district,
      url: `/facilities/search?district=${district}`,
    });
  }

  return breadcrumbs;
}

/**
 * Generate list name for structured data
 */
function generateListName(
  sport?: string,
  city?: string,
  district?: string
): string {
  const parts: string[] = [];

  if (sport) {
    parts.push(`${sport.charAt(0).toUpperCase() + sport.slice(1)} Facilities`);
  } else {
    parts.push("Sports Facilities");
  }

  if (district && city) {
    parts.push(`in ${district}, ${city}`);
  } else if (city) {
    parts.push(`in ${city}`);
  }

  return parts.join(" ");
}

/**
 * Generate list description for structured data
 */
function generateListDescription(
  sport?: string,
  city?: string,
  district?: string
): string {
  let description = "Discover and book amazing sports facilities";

  if (sport) {
    description = `Find the best ${sport} facilities`;
  }

  if (district && city) {
    description += ` in ${district}, ${city}`;
  } else if (city) {
    description += ` in ${city}`;
  }

  description +=
    ". Book instantly with verified reviews and competitive prices.";

  return description;
}

/**
 * Generate OpenGraph data for social sharing
 */
export function generateOpenGraphData({
  sport,
  city,
  district,
  canonicalUrl,
}: Omit<StructuredDataOptions, "currentPage" | "facilities" | "totalCount">) {
  const title = generateListName(sport, city, district);
  const description = generateListDescription(sport, city, district);

  return {
    title,
    description,
    url: canonicalUrl,
    type: "website" as const,
    images: [
      {
        url: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/api/og/facilities?sport=${sport || ""}&city=${city || ""}&district=${
          district || ""
        }`,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    siteName: "Booksan",
    locale: "en_US",
  };
}

/**
 * Generate Twitter Card data
 */
export function generateTwitterCardData({
  sport,
  city,
  district,
}: {
  sport?: string;
  city?: string;
  district?: string;
}) {
  const title = generateListName(sport, city, district);
  const description = generateListDescription(sport, city, district);

  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/og/facilities?sport=${sport || ""}&city=${city || ""}&district=${
        district || ""
      }`,
    ],
    creator: "@booksan",
    site: "@booksan",
  };
}
