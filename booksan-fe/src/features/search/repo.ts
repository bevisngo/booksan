import { api, CacheTags } from "@/lib/fetcher";
import { SearchFacilitiesParams, SearchFacilitiesResponse } from "./types";

export const searchRepo = {
  // Search facilities with filters
  searchFacilities: async (
    params: SearchFacilitiesParams
  ): Promise<SearchFacilitiesResponse> => {
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
    const url = `/facilities/search${queryString ? `?${queryString}` : ""}`;

    return api.get<SearchFacilitiesResponse>(url, {
      tags: [CacheTags.VENUES],
      revalidate: 300, // Cache for 5 minutes
    });
  },

  // Get facility by ID
  getFacility: async (id: string) => {
    return api.get(`/facilities/${id}`, {
      tags: [CacheTags.VENUES],
      revalidate: 600, // Cache for 10 minutes
    });
  },

  // Get popular facilities
  getPopularFacilities: async (limit: number = 10) => {
    return api.get(`/facilities/popular?limit=${limit}`, {
      tags: [CacheTags.VENUES],
      revalidate: 1800, // Cache for 30 minutes
    });
  },

  // Get nearby facilities
  getNearbyFacilities: async (
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

    return api.get<SearchFacilitiesResponse>(
      `/facilities/search?${params.toString()}`,
      {
        tags: [CacheTags.VENUES],
        revalidate: 300, // Cache for 5 minutes
      }
    );
  },
};
