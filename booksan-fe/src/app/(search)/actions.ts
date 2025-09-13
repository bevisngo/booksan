'use server'

import { revalidatePath } from 'next/cache'
import { internalApi } from '@/lib/http/internalFetch'
import { parseSearchParams, toApiParams, type SearchParams } from '@/lib/search/params'
import { SearchFacilitiesResponse, ServerActionResult, FacilitySearchResult } from '@/features/search/types'

/**
 * Server Action to fetch facilities from NestJS backend
 * This runs on the server and never exposes the backend URL to the browser
 */
export async function fetchFacilitiesPage(
  searchParams: SearchParams
): Promise<ServerActionResult<FacilitySearchResult>> {
  try {
    // Parse and validate search parameters
    const parsedParams = await parseSearchParams(searchParams as any)
    
    // Convert to API parameters for NestJS
    const apiParams = toApiParams(parsedParams)
    
    // Build query string for API request
    const queryString = new URLSearchParams(apiParams).toString()
    const endpoint = `/facilities/search${queryString ? `?${queryString}` : ''}`
    
    // Make server-to-server request to NestJS
    const response = await internalApi.get<SearchFacilitiesResponse>(endpoint)
    
    // Transform response to match our expected format
    const result: FacilitySearchResult = {
      facilities: response.data.map(item => item.facility),
      total: response.total,
      hasMore: response.meta.hasMore,
      // Generate next cursor based on current offset + limit
      ...(response.meta.hasMore && {
        nextCursor: (response.meta.offset + response.meta.limit).toString()
      }),
    }
    
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Failed to fetch facilities:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch facilities',
    }
  }
}

/**
 * Server Action to fetch initial page for SSR
 * This ensures the first page is server-rendered for SEO
 */
export async function fetchInitialFacilities(
  sport?: string,
  city?: string,
  district?: string,
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>
): Promise<ServerActionResult<FacilitySearchResult>> {
  try {
    // Await searchParams if it's a Promise
    const resolvedSearchParams = searchParams ? await searchParams : {}
    
    // Build search parameters from route params and query params
    const params: SearchParams = {
      page: 1, // Always fetch page 1 for SSR
      ...(sport && { sport: sport as any }),
      ...(city && { city }),
      ...(district && { district }),
    }

    // Add query parameters individually to avoid spreading issues
    if (resolvedSearchParams.q) params.q = resolvedSearchParams.q as string
    if (resolvedSearchParams.lat) params.lat = Number(resolvedSearchParams.lat)
    if (resolvedSearchParams.lng) params.lng = Number(resolvedSearchParams.lng)
    if (resolvedSearchParams.radius_km) params.radius_km = Number(resolvedSearchParams.radius_km)
    if (resolvedSearchParams.open_now) params.open_now = resolvedSearchParams.open_now === 'true'
    if (resolvedSearchParams.price_min) params.price_min = Number(resolvedSearchParams.price_min)
    if (resolvedSearchParams.price_max) params.price_max = Number(resolvedSearchParams.price_max)
    if (resolvedSearchParams.sort) params.sort = resolvedSearchParams.sort as any
    
    return await fetchFacilitiesPage(params)
  } catch (error) {
    console.error('Failed to fetch initial facilities:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch facilities',
    }
  }
}

/**
 * Server Action to fetch next page for infinite scroll
 * This is called from client components via useTransition
 */
export async function fetchNextFacilitiesPage(
  searchParams: SearchParams,
  cursor: string
): Promise<ServerActionResult<FacilitySearchResult>> {
  try {
    // Add cursor to search params for pagination
    const params: SearchParams = {
      ...searchParams,
      ...(cursor && { cursor }),
    }
    
    const result = await fetchFacilitiesPage(params)
    
    // Optionally revalidate the path to ensure fresh data
    // revalidatePath('/facilities')
    
    return result
  } catch (error) {
    console.error('Failed to fetch next facilities page:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch more facilities',
    }
  }
}

/**
 * Server Action to search facilities with new filters
 * This triggers a new SSR render when filters change
 */
export async function searchFacilitiesWithFilters(
  filters: SearchParams
): Promise<ServerActionResult<FacilitySearchResult>> {
  try {
    // Reset to page 1 when filters change
    const params: SearchParams = {
      ...filters,
      page: 1,
      // Don't include cursor property at all for new search
    }
    
    const result = await fetchFacilitiesPage(params)
    
    // Revalidate the current path to refresh SSR data
    revalidatePath('/facilities')
    
    return result
  } catch (error) {
    console.error('Failed to search facilities with filters:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search facilities',
    }
  }
}

/**
 * Helper function to get facility count for a location (for metadata)
 */
export async function getFacilityCount(
  sport?: string,
  city?: string,
  district?: string
): Promise<number> {
  try {
    const params: SearchParams = {
      page: 1,
      ...(sport && { sport: sport as any }),
      ...(city && { city }),
      ...(district && { district }),
    }
    
    const result = await fetchFacilitiesPage(params)
    
    if (result.success && result.data) {
      return result.data.total
    }
    
    return 0
  } catch (error) {
    console.error('Failed to get facility count:', error)
    return 0
  }
}
