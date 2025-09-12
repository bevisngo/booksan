import { apiClient } from '@/lib/api';
import type {
  Facility,
  CreateFacilityData,
  UpdateFacilityData,
  FacilityFilters,
  FacilitiesResponse,
  CreateCourtData,
  UpdateCourtData,
  Court,
} from '@/types/facility';

export class FacilityApi {
  // Facility operations
  static async getFacilities(filters: FacilityFilters = {}): Promise<FacilitiesResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('isPublished', filters.status === 'published' ? 'true' : 'false');
    if (filters.city) params.append('city', filters.city);
    if (filters.ward) params.append('ward', filters.ward);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const endpoint = `/owner/facilities${params.toString() ? '?' + params.toString() : ''}`;
    return apiClient.get<FacilitiesResponse>(endpoint);
  }

  static async getFacility(id: string): Promise<Facility> {
    return apiClient.get<Facility>(`/owner/facilities/${id}`);
  }

  static async createFacility(data: CreateFacilityData): Promise<Facility> {
    return apiClient.post<Facility>('/owner/facilities', data);
  }

  static async updateFacility(id: string, data: UpdateFacilityData): Promise<Facility> {
    return apiClient.put<Facility>(`/owner/facilities/${id}`, data);
  }

  static async deleteFacility(id: string): Promise<void> {
    return apiClient.delete(`/owner/facilities/${id}`);
  }

  static async toggleFacilityPublish(
    id: string,
    published: boolean
  ): Promise<Facility> {
    return apiClient.put<Facility>(`/owner/facilities/${id}/publish`, {
      isPublished: published,
    });
  }

  // Court operations
  static async getFacilityCourts(facilityId: string): Promise<Court[]> {
    return apiClient.get<Court[]>(`/owner/facilities/${facilityId}/courts`);
  }

  static async createCourt(data: CreateCourtData): Promise<Court> {
    return apiClient.post<Court>('/owner/courts', data);
  }

  static async updateCourt(id: string, data: UpdateCourtData): Promise<Court> {
    return apiClient.put<Court>(`/owner/courts/${id}`, data);
  }

  static async deleteCourt(id: string): Promise<void> {
    return apiClient.delete(`/owner/courts/${id}`);
  }

  static async toggleCourtActive(
    id: string,
    active: boolean
  ): Promise<Court> {
    return apiClient.put<Court>(`/owner/courts/${id}/status`, {
      isActive: active,
    });
  }

  static async geocodeAddress(
    address: string
  ): Promise<{ latitude: number; longitude: number }> {
    return apiClient.post<{ latitude: number; longitude: number }>('/geocode', {
      address,
    });
  }
}

export const facilityApi = FacilityApi;
