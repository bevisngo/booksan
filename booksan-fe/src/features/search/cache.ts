import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { searchRepo } from './repo'
import { SearchFacilitiesParams } from './types'

// Query keys
export const searchKeys = {
  all: ['search'] as const,
  facilities: () => [...searchKeys.all, 'facilities'] as const,
  facilityList: (params: SearchFacilitiesParams) => [...searchKeys.facilities(), params] as const,
  facility: (id: string) => [...searchKeys.all, 'facility', id] as const,
  popular: (limit?: number) => [...searchKeys.facilities(), 'popular', limit] as const,
  nearby: (lat: number, lon: number, maxDistance?: string, limit?: number) => 
    [...searchKeys.facilities(), 'nearby', { lat, lon, maxDistance, limit }] as const,
}

// Hooks
export function useSearchFacilities(params: SearchFacilitiesParams) {
  return useQuery({
    queryKey: searchKeys.facilityList(params),
    queryFn: () => searchRepo.searchFacilities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  })
}

export function useFacility(id: string) {
  return useQuery({
    queryKey: searchKeys.facility(id),
    queryFn: () => searchRepo.getFacility(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id,
  })
}

export function usePopularFacilities(limit: number = 10) {
  return useQuery({
    queryKey: searchKeys.popular(limit),
    queryFn: () => searchRepo.getPopularFacilities(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export function useNearbyFacilities(
  lat: number, 
  lon: number, 
  maxDistance: string = '10km', 
  limit: number = 20
) {
  return useQuery({
    queryKey: searchKeys.nearby(lat, lon, maxDistance, limit),
    queryFn: () => searchRepo.getNearbyFacilities(lat, lon, maxDistance, limit),
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
export function prefetchFacility(queryClient: any, id: string) {
  return queryClient.prefetchQuery({
    queryKey: searchKeys.facility(id),
    queryFn: () => searchRepo.getFacility(id),
    staleTime: 10 * 60 * 1000,
  })
}

export function prefetchPopularFacilities(queryClient: any, limit: number = 10) {
  return queryClient.prefetchQuery({
    queryKey: searchKeys.popular(limit),
    queryFn: () => searchRepo.getPopularFacilities(limit),
    staleTime: 30 * 60 * 1000,
  })
}
