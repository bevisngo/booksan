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
  static async getCourts(filters: FacilityFilters = {}): Promise<Court[]> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/owner/courts${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<Court[]>(endpoint);
  }

  static async getCourt(id: string): Promise<CourtWithFacility> {
    return apiClient.get<CourtWithFacility>(`/owner/courts/${id}`);
  }

  static async createCourt(data: CreateCourtData): Promise<Court> {
    return apiClient.post<Court>(`/owner/courts`, data);
  }

  static async updateCourt(id: string, data: UpdateCourtData): Promise<Court> {
    return apiClient.put<Court>(`/owner/courts/${id}`, data);
  }

  static async deleteCourt(id: string): Promise<void> {
    return apiClient.delete(`/owner/courts/${id}`);
  }

  static async getCourtsByFacility(): Promise<Court[]> {
    return apiClient.get<Court[]>(`/owner/courts`);
  }

  static async activateCourt(id: string): Promise<Court> {
    return apiClient.put<Court>(`/owner/courts/${id}/activate`);
  }

  static async deactivateCourt(id: string): Promise<Court> {
    return apiClient.put<Court>(`/owner/courts/${id}/deactivate`);
  }

  static async getCourtStats(): Promise<CourtStats> {
    return apiClient.get<CourtStats>(`/owner/courts/stats`);
  }
}

export const courtApi = CourtApi;
