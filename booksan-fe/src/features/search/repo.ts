import { api, CacheTags } from "@/lib/fetcher";
import { SearchVenuesParams, SearchVenuesResponse } from "./types";

export const searchRepo = {
  // Search venues with filters
  searchVenues: async (
    params: SearchVenuesParams
  ): Promise<SearchVenuesResponse> => {
    const searchParams = new URLSearchParams();

    // Add parameters to search params
    if (params.lat !== undefined)
      searchParams.append("lat", params.lat.toString());
    if (params.lon !== undefined)
      searchParams.append("lon", params.lon.toString());
    if (params.maxDistance)
      searchParams.append("maxDistance", params.maxDistance);
    if (params.sport) searchParams.append("sport", params.sport);
    if (params.isPublished !== undefined)
      searchParams.append("isPublished", params.isPublished.toString());
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());

    const queryString = searchParams.toString();
    const url = `/venues/search${queryString ? `?${queryString}` : ""}`;

    return api.get<SearchVenuesResponse>(url, {
      tags: [CacheTags.VENUES],
      revalidate: 300, // Cache for 5 minutes
    });
  },

  // Get venue by ID
  getVenue: async (id: string) => {
    return api.get(`/venues/${id}`, {
      tags: [CacheTags.VENUES],
      revalidate: 600, // Cache for 10 minutes
    });
  },

  // Get popular venues
  getPopularVenues: async (limit: number = 10) => {
    return api.get(`/venues/popular?limit=${limit}`, {
      tags: [CacheTags.VENUES],
      revalidate: 1800, // Cache for 30 minutes
    });
  },

  // Get nearby venues
  getNearbyVenues: async (
    lat: number,
    lon: number,
    maxDistance: string = "10km",
    limit: number = 20
  ) => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      maxDistance,
      limit: limit.toString(),
      sortBy: "DISTANCE",
      sortOrder: "ASC",
    });

    return api.get<SearchVenuesResponse>(
      `/venues/search?${params.toString()}`,
      {
        tags: [CacheTags.VENUES],
        revalidate: 300, // Cache for 5 minutes
      }
    );
  },
};
