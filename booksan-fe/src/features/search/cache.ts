import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { searchRepo } from './repo'
import { SearchVenuesParams } from './types'

// Query keys
export const searchKeys = {
  all: ['search'] as const,
  venues: () => [...searchKeys.all, 'venues'] as const,
  venueList: (params: SearchVenuesParams) => [...searchKeys.venues(), params] as const,
  venue: (id: string) => [...searchKeys.all, 'venue', id] as const,
  popular: (limit?: number) => [...searchKeys.venues(), 'popular', limit] as const,
  nearby: (lat: number, lon: number, maxDistance?: string, limit?: number) => 
    [...searchKeys.venues(), 'nearby', { lat, lon, maxDistance, limit }] as const,
}

// Hooks
export function useSearchVenues(params: SearchVenuesParams) {
  return useQuery({
    queryKey: searchKeys.venueList(params),
    queryFn: () => searchRepo.searchVenues(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  })
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: searchKeys.venue(id),
    queryFn: () => searchRepo.getVenue(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id,
  })
}

export function usePopularVenues(limit: number = 10) {
  return useQuery({
    queryKey: searchKeys.popular(limit),
    queryFn: () => searchRepo.getPopularVenues(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export function useNearbyVenues(
  lat: number, 
  lon: number, 
  maxDistance: string = '10km', 
  limit: number = 20
) {
  return useQuery({
    queryKey: searchKeys.nearby(lat, lon, maxDistance, limit),
    queryFn: () => searchRepo.getNearbyVenues(lat, lon, maxDistance, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!(lat && lon),
  })
}

// Mutation hooks
export function useInvalidateSearch() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: searchKeys.all })
    },
  })
}

// Utility functions
export function prefetchVenue(queryClient: any, id: string) {
  return queryClient.prefetchQuery({
    queryKey: searchKeys.venue(id),
    queryFn: () => searchRepo.getVenue(id),
    staleTime: 10 * 60 * 1000,
  })
}

export function prefetchPopularVenues(queryClient: any, limit: number = 10) {
  return queryClient.prefetchQuery({
    queryKey: searchKeys.popular(limit),
    queryFn: () => searchRepo.getPopularVenues(limit),
    staleTime: 30 * 60 * 1000,
  })
}
