import { Metadata } from 'next';

interface VenueSEOData {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImage?: string;
  canonicalUrl: string;
  structuredData: any;
}

interface VenueStructuredDataInput {
  name: string;
  description?: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string[];
  sports?: string[];
  priceRange?: string;
}

export function generateVenuePageMetadata(seoData: VenueSEOData): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://booksan.com';
  const canonicalUrl = `${baseUrl}${seoData.canonicalUrl}`;

  return {
    title: seoData.metaTitle,
    description: seoData.metaDescription,
    keywords: seoData.metaKeywords.join(', '),
    authors: [{ name: 'Booksan' }],
    creator: 'Booksan',
    publisher: 'Booksan',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      title: seoData.openGraphTitle,
      description: seoData.openGraphDescription,
      url: canonicalUrl,
      siteName: 'Booksan',
      locale: 'en_US',
      ...(seoData.openGraphImage && {
        images: [
          {
            url: seoData.openGraphImage,
            width: 1200,
            height: 630,
            alt: seoData.openGraphTitle,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.openGraphTitle,
      description: seoData.openGraphDescription,
      site: '@booksan',
      creator: '@booksan',
      ...(seoData.openGraphImage && {
        images: [seoData.openGraphImage],
      }),
    },
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      'business:contact_data:locality': 'Vietnam',
      'business:contact_data:region': 'Ho Chi Minh City',
      'business:contact_data:country_name': 'Vietnam',
    },
  };
}

export function generateVenueStructuredData(data: VenueStructuredDataInput) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://booksan.com';
  const venueUrl = `${baseUrl}/venues/${data.slug}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': venueUrl,
    name: data.name,
    description: data.description,
    url: venueUrl,
    
    // Business information
    ...(data.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: data.address,
        addressLocality: 'Ho Chi Minh City',
        addressCountry: 'VN',
      },
    }),

    // Contact information
    ...(data.phone && {
      telephone: data.phone,
    }),
    ...(data.email && {
      email: data.email,
    }),

    // Location coordinates
    ...(data.latitude && data.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: data.latitude,
        longitude: data.longitude,
      },
    }),

    // Opening hours
    ...(data.openingHours && {
      openingHours: data.openingHours,
    }),

    // Sports and activities
    ...(data.sports && {
      sport: data.sports,
    }),

    // Business details
    ...(data.priceRange && {
      priceRange: data.priceRange,
    }),

    // Booking action
    potentialAction: {
      '@type': 'ReserveAction',
      name: 'Book a Court',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${venueUrl}#booking`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
    },

    // Additional business properties
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '0',
      bestRating: '5',
      worstRating: '1',
    },

    offers: {
      '@type': 'Offer',
      category: 'Sports Facility Booking',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
    },
  };

  return structuredData;
}

export function generateBreadcrumbStructuredData(facilityName: string, slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://booksan.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Venues',
        item: `${baseUrl}/venues`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: facilityName,
        item: `${baseUrl}/venues/${slug}`,
      },
    ],
  };
}

// SEO-optimized meta tags for social sharing
export function generateSocialMetaTags(data: {
  title: string;
  description: string;
  image?: string;
  url: string;
}) {
  return {
    // Facebook/OpenGraph
    'og:type': 'business.business',
    'og:title': data.title,
    'og:description': data.description,
    'og:url': data.url,
    'og:site_name': 'Booksan',
    ...(data.image && { 'og:image': data.image }),

    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:site': '@booksan',
    'twitter:title': data.title,
    'twitter:description': data.description,
    ...(data.image && { 'twitter:image': data.image }),

    // Additional meta tags for better SEO
    'article:publisher': 'https://www.facebook.com/booksan',
    'article:author': 'Booksan',
  };
}

// Generate venue-specific keywords
export function generateVenueKeywords(data: {
  name: string;
  sports?: string[];
  location?: string;
  features?: string[];
}): string[] {
  const baseKeywords = [
    'sports facility',
    'court booking',
    'sports venue',
    'vietnam sports',
    'ho chi minh sports',
    'book sports court',
    'sports facility rental',
  ];

  const nameKeywords = data.name.toLowerCase().split(' ');

  const sportsKeywords = data.sports?.flatMap(sport => [
    sport.toLowerCase(),
    `${sport.toLowerCase()} court`,
    `${sport.toLowerCase()} booking`,
    `${sport.toLowerCase()} venue`,
  ]) || [];

  const locationKeywords = data.location ? [
    data.location.toLowerCase(),
    `sports in ${data.location.toLowerCase()}`,
    `${data.location.toLowerCase()} sports facility`,
  ] : [];

  const featureKeywords = data.features?.map(feature => feature.toLowerCase()) || [];

  return [
    ...new Set([
      ...baseKeywords,
      ...nameKeywords,
      ...sportsKeywords,
      ...locationKeywords,
      ...featureKeywords,
    ]),
  ];
}
