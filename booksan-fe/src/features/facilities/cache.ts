import { revalidateTag } from "next/cache";

export const FacilitiesCacheTags = {
  ALL: "facilities:all",
  DETAIL: (id: string) => `facilities:detail:${id}`,
  SEARCH: "facilities:search",
  REVIEWS: (facilityId: string) => `facilities:reviews:${facilityId}`,
  AVAILABILITY: (facilityId: string, date: string) =>
    `facilities:availability:${facilityId}:${date}`,
  OWNER_FACILITIES: (ownerId: string) => `facilities:owner:${ownerId}`,
  STATS: (facilityId: string) => `facilities:stats:${facilityId}`,
  SPORTS: "facilities:sports",
  AMENITIES: "facilities:amenities",
} as const;

export type FacilitiesCacheTag = string;

// Cache invalidation functions
export function invalidateFacilitiesCache() {
  revalidateTag(FacilitiesCacheTags.ALL);
}

export function invalidateFacilityDetailCache(facilityId: string) {
  revalidateTag(FacilitiesCacheTags.DETAIL(facilityId));
}

export function invalidateFacilitySearchCache() {
  revalidateTag(FacilitiesCacheTags.SEARCH);
}

export function invalidateFacilityReviewsCache(facilityId: string) {
  revalidateTag(FacilitiesCacheTags.REVIEWS(facilityId));
}

export function invalidateFacilityAvailabilityCache(
  facilityId: string,
  date?: string
) {
  if (date) {
    revalidateTag(FacilitiesCacheTags.AVAILABILITY(facilityId, date));
  } else {
    // Invalidate all availability for this facility
    revalidateTag(`facilities:availability:${facilityId}`);
  }
}

export function invalidateOwnerFacilitiesCache(ownerId: string) {
  revalidateTag(FacilitiesCacheTags.OWNER_FACILITIES(ownerId));
}

export function invalidateFacilityStatsCache(facilityId: string) {
  revalidateTag(FacilitiesCacheTags.STATS(facilityId));
}

export function invalidateAllFacilitiesCache() {
  Object.values(FacilitiesCacheTags).forEach((tag) => {
    if (typeof tag === "string") {
      revalidateTag(tag);
    }
  });
}

// Query keys for React Query
export const facilitiesKeys = {
  all: ["facilities"] as const,
  lists: () => [...facilitiesKeys.all, "list"] as const,
  list: (filters: unknown) => [...facilitiesKeys.lists(), filters] as const,
  details: () => [...facilitiesKeys.all, "detail"] as const,
  detail: (id: string) => [...facilitiesKeys.details(), id] as const,
  reviews: (facilityId: string) =>
    [...facilitiesKeys.detail(facilityId), "reviews"] as const,
  availability: (facilityId: string, date: string) =>
    [...facilitiesKeys.detail(facilityId), "availability", date] as const,
  stats: (facilityId: string) => [...facilitiesKeys.detail(facilityId), "stats"] as const,
  sports: () => [...facilitiesKeys.all, "sports"] as const,
  amenities: () => [...facilitiesKeys.all, "amenities"] as const,
};
