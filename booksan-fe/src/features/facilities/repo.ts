import { api } from "@/lib/fetcher";
import { FacilitiesCacheTags } from "./cache";
import type {
  Facility,
  FacilitySearchFilters,
  FacilitySearchResult,
  CreateFacilityRequest,
  UpdateFacilityRequest,
  FacilityAvailability,
  FacilityReview,
  CreateReviewRequest,
  FacilityStats,
  Sport,
} from "./types";

class FacilitiesRepository {
  // Search and listing
  async searchFacilities(filters: FacilitySearchFilters): Promise<FacilitySearchResult> {
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

    return api.get(`/facilities/search?${params.toString()}`, {
      tags: [FacilitiesCacheTags.SEARCH],
      revalidate: 300, // 5 minutes
    });
  }

  async getAllFacilitys(): Promise<Facility[]> {
    return api.get("/facilities", {
      tags: [FacilitiesCacheTags.ALL],
      revalidate: 600, // 10 minutes
    });
  }

  // Individual facility operations
  async getFacilityById(id: string): Promise<Facility> {
    return api.get(`/facilities/${id}`, {
      tags: [FacilitiesCacheTags.DETAIL(id)],
      revalidate: 300, // 5 minutes
    });
  }

  async createFacility(data: CreateFacilityRequest): Promise<Facility> {
    return api.post("/facilities", data, {
      tags: [FacilitiesCacheTags.ALL, FacilitiesCacheTags.SEARCH],
    });
  }

  async updateFacility(id: string, data: UpdateFacilityRequest): Promise<Facility> {
    return api.patch(`/facilities/${id}`, data, {
      tags: [
        FacilitiesCacheTags.DETAIL(id),
        FacilitiesCacheTags.ALL,
        FacilitiesCacheTags.SEARCH,
      ],
    });
  }

  async deleteFacility(id: string): Promise<void> {
    return api.delete(`/facilities/${id}`, {
      tags: [
        FacilitiesCacheTags.DETAIL(id),
        FacilitiesCacheTags.ALL,
        FacilitiesCacheTags.SEARCH,
      ],
    });
  }

  // Facility availability
  async getFacilityAvailability(
    facilityId: string,
    date: string
  ): Promise<FacilityAvailability> {
    return api.get(`/facilities/${facilityId}/availability/${date}`, {
      tags: [FacilitiesCacheTags.AVAILABILITY(facilityId, date)],
      revalidate: 60, // 1 minute
    });
  }

  async getFacilityAvailabilityRange(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<FacilityAvailability[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return api.get(`/facilities/${facilityId}/availability?${params.toString()}`, {
      revalidate: 300, // 5 minutes
    });
  }

  // Reviews
  async getFacilityReviews(
    facilityId: string,
    page = 1,
    limit = 20
  ): Promise<{
    reviews: FacilityReview[];
    total: number;
    averageRating: number;
  }> {
    return api.get(
      `/facilities/${facilityId}/reviews?page=${page}&limit=${limit}`,
      {
        tags: [FacilitiesCacheTags.REVIEWS(facilityId)],
        revalidate: 600, // 10 minutes
      }
    );
  }

  async createReview(
    facilityId: string,
    data: CreateReviewRequest
  ): Promise<FacilityReview> {
    return api.post(`/facilities/${facilityId}/reviews`, data, {
      tags: [FacilitiesCacheTags.REVIEWS(facilityId), FacilitiesCacheTags.DETAIL(facilityId)],
    });
  }

  async updateReview(
    facilityId: string,
    reviewId: string,
    data: Partial<CreateReviewRequest>
  ): Promise<FacilityReview> {
    return api.patch(`/facilities/${facilityId}/reviews/${reviewId}`, data, {
      tags: [FacilitiesCacheTags.REVIEWS(facilityId), FacilitiesCacheTags.DETAIL(facilityId)],
    });
  }

  async deleteReview(facilityId: string, reviewId: string): Promise<void> {
    return api.delete(`/facilities/${facilityId}/reviews/${reviewId}`, {
      tags: [FacilitiesCacheTags.REVIEWS(facilityId), FacilitiesCacheTags.DETAIL(facilityId)],
    });
  }

  // Owner operations
  async getOwnerFacilities(ownerId: string): Promise<Facility[]> {
    return api.get(`/facilities/owner/${ownerId}`, {
      tags: [FacilitiesCacheTags.OWNER_FACILITIES(ownerId)],
      revalidate: 300, // 5 minutes
    });
  }

  async getFacilityStats(facilityId: string): Promise<FacilityStats> {
    return api.get(`/facilities/${facilityId}/stats`, {
      tags: [FacilitiesCacheTags.STATS(facilityId)],
      revalidate: 3600, // 1 hour
    });
  }

  // Master data
  async getSports(): Promise<Sport[]> {
    return api.get("/facilities/sports", {
      tags: [FacilitiesCacheTags.SPORTS],
      revalidate: 86400, // 24 hours
    });
  }

  async getAmenities(): Promise<string[]> {
    return api.get("/facilities/amenities", {
      tags: [FacilitiesCacheTags.AMENITIES],
      revalidate: 86400, // 24 hours
    });
  }

  // Favorites (if implemented)
  async addToFavorites(facilityId: string): Promise<void> {
    return api.post(`/facilities/${facilityId}/favorite`);
  }

  async removeFromFavorites(facilityId: string): Promise<void> {
    return api.delete(`/facilities/${facilityId}/favorite`);
  }

  async getFavoriteFacilities(): Promise<Facility[]> {
    return api.get("/facilities/favorites", {
      revalidate: 300, // 5 minutes
    });
  }
}

export const facilitiesRepository = new FacilitiesRepository();
