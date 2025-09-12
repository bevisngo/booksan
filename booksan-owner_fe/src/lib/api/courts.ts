import { apiClient } from '@/lib/api';
import type {
  Court,
  CourtWithFacility,
  CreateCourtData,
  UpdateCourtData,
  FacilityFilters,
  CourtStats,
} from '@/types/court';

export class CourtApi {
  static async getCourts(facilityId: string, filters: FacilityFilters = {}): Promise<Court[]> {
    if (!facilityId) {
      throw new Error('facilityId is required to get courts');
    }

    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/owner/courts/facility/${facilityId}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<Court[]>(endpoint);
  }

  static async getCourt(id: string): Promise<CourtWithFacility> {
    return apiClient.get<CourtWithFacility>(`/owner/courts/${id}`);
  }

  static async createCourt(facilityId: string, data: CreateCourtData): Promise<Court> {
    if (!facilityId) {
      throw new Error('facilityId is required to create court');
    }
    return apiClient.post<Court>(`/owner/courts/facility/${facilityId}`, data);
  }

  static async updateCourt(id: string, data: UpdateCourtData): Promise<Court> {
    return apiClient.put<Court>(`/owner/courts/${id}`, data);
  }

  static async deleteCourt(id: string): Promise<void> {
    return apiClient.delete(`/owner/courts/${id}`);
  }

  static async getCourtsByFacility(facilityId: string): Promise<Court[]> {
    if (!facilityId) {
      throw new Error('facilityId is required to get courts');
    }
    return apiClient.get<Court[]>(`/owner/courts/facility/${facilityId}`);
  }

  static async activateCourt(id: string): Promise<Court> {
    return apiClient.put<Court>(`/owner/courts/${id}/activate`);
  }

  static async deactivateCourt(id: string): Promise<Court> {
    return apiClient.put<Court>(`/owner/courts/${id}/deactivate`);
  }

  static async getCourtStats(facilityId: string): Promise<CourtStats> {
    if (!facilityId) {
      throw new Error('facilityId is required to get court stats');
    }
    return apiClient.get<CourtStats>(`/owner/courts/facility/${facilityId}/stats`);
  }
}

export const courtApi = CourtApi;
