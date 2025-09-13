import { MetadataRoute } from 'next';
import { api } from '@/lib/fetcher';

interface FacilitySitemapData {
  slug: string;
  updatedAt: string;
  isPublished: boolean;
}

async function getFacilitiesSitemapData(): Promise<FacilitySitemapData[]> {
  try {
    // This would be a new endpoint to get facility sitemap data
    const facilities = await api.get<FacilitySitemapData[]>('/facilities/sitemap', {
      revalidate: 3600, // Cache for 1 hour
    });
    return facilities.filter(facility => facility.isPublished);
  } catch (error) {
    console.error('Failed to fetch facilities for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://booksan.com';
  
  // Get dynamic facility pages
  const facilities = await getFacilitiesSitemapData();
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/facilities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/facilities/search`,
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

  // Dynamic facility pages
  const facilityPages: MetadataRoute.Sitemap = facilities.map((facility) => ({
    url: `${baseUrl}/facilities/${facility.slug}`,
    lastModified: new Date(facility.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...facilityPages];
}
