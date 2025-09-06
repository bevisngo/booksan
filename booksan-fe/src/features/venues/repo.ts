import { api } from "@/lib/fetcher";
import { VenuesCacheTags } from "./cache";
import type {
  Venue,
  VenueSearchFilters,
  VenueSearchResult,
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueAvailability,
  VenueReview,
  CreateReviewRequest,
  VenueStats,
  Sport,
} from "./types";

class VenuesRepository {
  // Search and listing
  async searchVenues(filters: VenueSearchFilters): Promise<VenueSearchResult> {
    const params = new URLSearchParams();

    if (filters.query) params.append("query", filters.query);
    if (filters.location) {
      params.append("lat", filters.location.latitude.toString());
      params.append("lng", filters.location.longitude.toString());
      params.append("radius", filters.location.radius.toString());
    }
    if (filters.sports) params.append("sports", filters.sports.join(","));
    if (filters.amenities)
      params.append("amenities", filters.amenities.join(","));
    if (filters.priceRange) {
      params.append("minPrice", filters.priceRange.min.toString());
      params.append("maxPrice", filters.priceRange.max.toString());
    }
    if (filters.availableDate)
      params.append("availableDate", filters.availableDate);
    if (filters.availableTime) {
      params.append("availableStart", filters.availableTime.start);
      params.append("availableEnd", filters.availableTime.end);
    }
    if (filters.rating) params.append("rating", filters.rating.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 20).toString());

    return api.get(`/venues/search?${params.toString()}`, {
      tags: [VenuesCacheTags.SEARCH],
      revalidate: 300, // 5 minutes
    });
  }

  async getAllVenues(): Promise<Venue[]> {
    return api.get("/venues", {
      tags: [VenuesCacheTags.ALL],
      revalidate: 600, // 10 minutes
    });
  }

  // Individual venue operations
  async getVenueById(id: string): Promise<Venue> {
    return api.get(`/venues/${id}`, {
      tags: [VenuesCacheTags.DETAIL(id)],
      revalidate: 300, // 5 minutes
    });
  }

  async createVenue(data: CreateVenueRequest): Promise<Venue> {
    return api.post("/venues", data, {
      tags: [VenuesCacheTags.ALL, VenuesCacheTags.SEARCH],
    });
  }

  async updateVenue(id: string, data: UpdateVenueRequest): Promise<Venue> {
    return api.patch(`/venues/${id}`, data, {
      tags: [
        VenuesCacheTags.DETAIL(id),
        VenuesCacheTags.ALL,
        VenuesCacheTags.SEARCH,
      ],
    });
  }

  async deleteVenue(id: string): Promise<void> {
    return api.delete(`/venues/${id}`, {
      tags: [
        VenuesCacheTags.DETAIL(id),
        VenuesCacheTags.ALL,
        VenuesCacheTags.SEARCH,
      ],
    });
  }

  // Venue availability
  async getVenueAvailability(
    venueId: string,
    date: string
  ): Promise<VenueAvailability> {
    return api.get(`/venues/${venueId}/availability/${date}`, {
      tags: [VenuesCacheTags.AVAILABILITY(venueId, date)],
      revalidate: 60, // 1 minute
    });
  }

  async getVenueAvailabilityRange(
    venueId: string,
    startDate: string,
    endDate: string
  ): Promise<VenueAvailability[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return api.get(`/venues/${venueId}/availability?${params.toString()}`, {
      revalidate: 300, // 5 minutes
    });
  }

  // Reviews
  async getVenueReviews(
    venueId: string,
    page = 1,
    limit = 20
  ): Promise<{
    reviews: VenueReview[];
    total: number;
    averageRating: number;
  }> {
    return api.get(
      `/venues/${venueId}/reviews?page=${page}&limit=${limit}`,
      {
        tags: [VenuesCacheTags.REVIEWS(venueId)],
        revalidate: 600, // 10 minutes
      }
    );
  }

  async createReview(
    venueId: string,
    data: CreateReviewRequest
  ): Promise<VenueReview> {
    return api.post(`/venues/${venueId}/reviews`, data, {
      tags: [VenuesCacheTags.REVIEWS(venueId), VenuesCacheTags.DETAIL(venueId)],
    });
  }

  async updateReview(
    venueId: string,
    reviewId: string,
    data: Partial<CreateReviewRequest>
  ): Promise<VenueReview> {
    return api.patch(`/venues/${venueId}/reviews/${reviewId}`, data, {
      tags: [VenuesCacheTags.REVIEWS(venueId), VenuesCacheTags.DETAIL(venueId)],
    });
  }

  async deleteReview(venueId: string, reviewId: string): Promise<void> {
    return api.delete(`/venues/${venueId}/reviews/${reviewId}`, {
      tags: [VenuesCacheTags.REVIEWS(venueId), VenuesCacheTags.DETAIL(venueId)],
    });
  }

  // Owner operations
  async getOwnerVenues(ownerId: string): Promise<Venue[]> {
    return api.get(`/venues/owner/${ownerId}`, {
      tags: [VenuesCacheTags.OWNER_VENUES(ownerId)],
      revalidate: 300, // 5 minutes
    });
  }

  async getVenueStats(venueId: string): Promise<VenueStats> {
    return api.get(`/venues/${venueId}/stats`, {
      tags: [VenuesCacheTags.STATS(venueId)],
      revalidate: 3600, // 1 hour
    });
  }

  // Master data
  async getSports(): Promise<Sport[]> {
    return api.get("/venues/sports", {
      tags: [VenuesCacheTags.SPORTS],
      revalidate: 86400, // 24 hours
    });
  }

  async getAmenities(): Promise<string[]> {
    return api.get("/venues/amenities", {
      tags: [VenuesCacheTags.AMENITIES],
      revalidate: 86400, // 24 hours
    });
  }

  // Favorites (if implemented)
  async addToFavorites(venueId: string): Promise<void> {
    return api.post(`/venues/${venueId}/favorite`);
  }

  async removeFromFavorites(venueId: string): Promise<void> {
    return api.delete(`/venues/${venueId}/favorite`);
  }

  async getFavoriteVenues(): Promise<Venue[]> {
    return api.get("/venues/favorites", {
      revalidate: 300, // 5 minutes
    });
  }
}

export const venuesRepo = new VenuesRepository();
