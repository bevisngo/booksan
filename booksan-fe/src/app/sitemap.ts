import { MetadataRoute } from 'next';
import { api } from '@/lib/fetcher';

interface VenueSitemapData {
  slug: string;
  updatedAt: string;
  isPublished: boolean;
}

async function getVenuesSitemapData(): Promise<VenueSitemapData[]> {
  try {
    // This would be a new endpoint to get venue sitemap data
    const venues = await api.get<VenueSitemapData[]>('/venues/sitemap', {
      revalidate: 3600, // Cache for 1 hour
    });
    return venues.filter(venue => venue.isPublished);
  } catch (error) {
    console.error('Failed to fetch venues for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://booksan.com';
  
  // Get dynamic venue pages
  const venues = await getVenuesSitemapData();
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/venues`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/venues/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic venue pages
  const venuePages: MetadataRoute.Sitemap = venues.map((venue) => ({
    url: `${baseUrl}/venues/${venue.slug}`,
    lastModified: new Date(venue.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...venuePages];
}
