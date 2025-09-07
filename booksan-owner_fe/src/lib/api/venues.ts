import { apiClient } from '@/lib/api';
import type {
  Court,
  CreateCourtData,
  UpdateCourtData,
  CourtFilters,
  CourtsResponse,
} from '@/types/venue';

export class VenueApi {
  static async getCourts(filters: CourtFilters = {}): Promise<CourtsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/courts${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<CourtsResponse>(endpoint);
  }

  static async getCourt(id: string): Promise<Court> {
    return apiClient.get<Court>(`/courts/${id}`);
  }

  static async createCourt(data: CreateCourtData): Promise<Court> {
    return apiClient.post<Court>('/courts', data);
  }

  static async updateCourt(id: string, data: UpdateCourtData): Promise<Court> {
    return apiClient.put<Court>(`/courts/${id}`, data);
  }

  static async deleteCourt(id: string): Promise<void> {
    return apiClient.delete(`/courts/${id}`);
  }

  static async toggleCourtPublish(id: string, published: boolean): Promise<Court> {
    return apiClient.put<Court>(`/courts/${id}/publish`, { isPublished: published });
  }

  static async uploadCourtMedia(id: string, file: File): Promise<{ url: string; id: string }> {
    return apiClient.uploadFile(`/courts/${id}/media`, file);
  }

  static async deleteCourtMedia(courtId: string, mediaId: string): Promise<void> {
    return apiClient.delete(`/courts/${courtId}/media/${mediaId}`);
  }

  static async reorderCourtMedia(
    courtId: string,
    mediaOrder: { id: string; order: number }[]
  ): Promise<void> {
    return apiClient.put(`/courts/${courtId}/media/reorder`, { order: mediaOrder });
  }

  static async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
    return apiClient.post<{ latitude: number; longitude: number }>('/geocode', { address });
  }
}

export const venueApi = VenueApi;
