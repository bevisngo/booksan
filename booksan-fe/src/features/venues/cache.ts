import { revalidateTag } from "next/cache";

export const VenuesCacheTags = {
  ALL: "venues:all",
  DETAIL: (id: string) => `venues:detail:${id}`,
  SEARCH: "venues:search",
  REVIEWS: (venueId: string) => `venues:reviews:${venueId}`,
  AVAILABILITY: (venueId: string, date: string) =>
    `venues:availability:${venueId}:${date}`,
  OWNER_VENUES: (ownerId: string) => `venues:owner:${ownerId}`,
  STATS: (venueId: string) => `venues:stats:${venueId}`,
  SPORTS: "venues:sports",
  AMENITIES: "venues:amenities",
} as const;

export type VenuesCacheTag = string;

// Cache invalidation functions
export function invalidateVenuesCache() {
  revalidateTag(VenuesCacheTags.ALL);
}

export function invalidateVenueDetailCache(venueId: string) {
  revalidateTag(VenuesCacheTags.DETAIL(venueId));
}

export function invalidateVenueSearchCache() {
  revalidateTag(VenuesCacheTags.SEARCH);
}

export function invalidateVenueReviewsCache(venueId: string) {
  revalidateTag(VenuesCacheTags.REVIEWS(venueId));
}

export function invalidateVenueAvailabilityCache(
  venueId: string,
  date?: string
) {
  if (date) {
    revalidateTag(VenuesCacheTags.AVAILABILITY(venueId, date));
  } else {
    // Invalidate all availability for this venue
    revalidateTag(`venues:availability:${venueId}`);
  }
}

export function invalidateOwnerVenuesCache(ownerId: string) {
  revalidateTag(VenuesCacheTags.OWNER_VENUES(ownerId));
}

export function invalidateVenueStatsCache(venueId: string) {
  revalidateTag(VenuesCacheTags.STATS(venueId));
}

export function invalidateAllVenuesCache() {
  Object.values(VenuesCacheTags).forEach((tag) => {
    if (typeof tag === "string") {
      revalidateTag(tag);
    }
  });
}

// Query keys for React Query
export const venuesKeys = {
  all: ["venues"] as const,
  lists: () => [...venuesKeys.all, "list"] as const,
  list: (filters: unknown) => [...venuesKeys.lists(), filters] as const,
  details: () => [...venuesKeys.all, "detail"] as const,
  detail: (id: string) => [...venuesKeys.details(), id] as const,
  reviews: (venueId: string) =>
    [...venuesKeys.detail(venueId), "reviews"] as const,
  availability: (venueId: string, date: string) =>
    [...venuesKeys.detail(venueId), "availability", date] as const,
  stats: (venueId: string) => [...venuesKeys.detail(venueId), "stats"] as const,
  sports: () => [...venuesKeys.all, "sports"] as const,
  amenities: () => [...venuesKeys.all, "amenities"] as const,
};
