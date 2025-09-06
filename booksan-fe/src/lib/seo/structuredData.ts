import { Venue } from "@/features/search/types";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface StructuredDataOptions {
  sport?: string;
  city?: string;
  district?: string;
  venues: Venue[];
  totalCount: number;
  currentPage: number;
  canonicalUrl: string;
}

/**
 * Generate JSON-LD structured data for venue search results
 */
export function generateSearchResultsStructuredData({
  sport,
  city,
  district,
  venues,
  totalCount,
  currentPage,
  canonicalUrl,
}: StructuredDataOptions) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Generate breadcrumbs
  const breadcrumbs = generateBreadcrumbs(sport, city, district);

  // Generate ItemList for venues
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: generateListName(sport, city, district),
    description: generateListDescription(sport, city, district),
    url: canonicalUrl,
    numberOfItems: totalCount,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: venues.map((venue, index) => ({
      "@type": "ListItem",
      position: (currentPage - 1) * 20 + index + 1, // Assuming 20 items per page
      item: generateVenueStructuredData(venue),
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
 * Generate structured data for a single venue
 */
function generateVenueStructuredData(venue: Venue) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    "@type": "SportsActivityLocation",
    "@id": `${baseUrl}/venues/${venue.id}`,
    name: venue.name,
    description: venue.description,
    url: `${baseUrl}/venues/${venue.id}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: venue.location.lat,
      longitude: venue.location.lon,
    },
    telephone: venue.phone,
    ...(venue.website && { sameAs: [venue.website] }),
    ...(venue.rating &&
      venue.reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: venue.rating,
          reviewCount: venue.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    ...(venue.priceRange && {
      priceRange: `$${venue.priceRange.min}-$${venue.priceRange.max}`,
    }),
    sport: venue.courts
      .map((court) => court.sport)
      .filter((sport, index, array) => array.indexOf(sport) === index),
    amenityFeature: venue.courts.map((court) => ({
      "@type": "LocationFeatureSpecification",
      name: court.name,
      value: court.sport,
    })),
    ...(venue.isPublished && {
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
    { name: "Venues", url: "/venues" },
    { name: "Search", url: "/venues/search" },
  ];

  if (sport) {
    breadcrumbs.push({
      name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Venues`,
      url: `/venues/search?sport=${sport}`,
    });
  }

  if (city) {
    breadcrumbs.push({
      name: city,
      url: `/venues/search?city=${city}`,
    });
  }

  if (district) {
    breadcrumbs.push({
      name: district,
      url: `/venues/search?district=${district}`,
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
    parts.push(`${sport.charAt(0).toUpperCase() + sport.slice(1)} Venues`);
  } else {
    parts.push("Sports Venues");
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
  let description = "Discover and book amazing sports venues";

  if (sport) {
    description = `Find the best ${sport} venues`;
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
}: Omit<StructuredDataOptions, "currentPage" | "venues" | "totalCount">) {
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
        }/api/og/venues?sport=${sport || ""}&city=${city || ""}&district=${
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
      }/api/og/venues?sport=${sport || ""}&city=${city || ""}&district=${
        district || ""
      }`,
    ],
    creator: "@booksan",
    site: "@booksan",
  };
}
