import { Sport } from '@/features/search/types'

export interface SearchParams {
  // Text search (maps to keyword in backend)
  q?: string
  
  // Location filters
  sport?: Sport
  city?: string
  district?: string
  lat?: number
  lng?: number
  radius_km?: number
  
  // Business filters
  open_now?: boolean
  price_min?: number
  price_max?: number
  
  // Sorting
  sort?: 'default' | 'distance' | 'price_asc' | 'price_desc' | 'rating_desc'
  
  // Pagination
  page?: number
  cursor?: string
}

export interface ParsedSearchParams extends Required<Omit<SearchParams, 'q' | 'sport' | 'city' | 'district' | 'lat' | 'lng' | 'cursor'>> {
  q: string | undefined
  sport: Sport | undefined
  city: string | undefined
  district: string | undefined
  lat: number | undefined
  lng: number | undefined
  cursor: string | undefined
}

/**
 * Parse and validate search parameters from URL searchParams or request
 */
export async function parseSearchParams(searchParams: URLSearchParams | Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>): Promise<ParsedSearchParams> {
  // Await if searchParams is a Promise
  const resolvedParams = await searchParams
  
  const get = (key: string): string | undefined => {
    if (resolvedParams instanceof URLSearchParams) {
      return resolvedParams.get(key) || undefined
    }
    // Handle Record<string, string | string[] | undefined>
    const value = (resolvedParams as Record<string, string | string[] | undefined>)[key]
    return Array.isArray(value) ? value[0] : value
  }

  const getNumber = (key: string, defaultValue: number, min?: number, max?: number): number => {
    const value = get(key)
    if (!value) return defaultValue
    
    const num = Number(value)
    if (isNaN(num)) return defaultValue
    
    if (min !== undefined && num < min) return min
    if (max !== undefined && num > max) return max
    
    return num
  }

  const getBoolean = (key: string, defaultValue: boolean): boolean => {
    const value = get(key)
    if (!value) return defaultValue
    return value === 'true' || value === '1'
  }

  const getSport = (key: string): Sport | undefined => {
    const value = get(key)
    if (!value) return undefined
    
    // Validate that the sport value is a valid Sport enum
    if (Object.values(Sport).includes(value as Sport)) {
      return value as Sport
    }
    
    return undefined
  }

  const getSort = (key: string): 'default' | 'distance' | 'price_asc' | 'price_desc' | 'rating_desc' => {
    const value = get(key)
    const validSorts = ['default', 'distance', 'price_asc', 'price_desc', 'rating_desc'] as const
    
    if (value && validSorts.includes(value as any)) {
      return value as any
    }
    
    return 'default'
  }

  return {
    // Text search
    q: get('q'),
    
    // Location filters
    sport: getSport('sport'),
    city: get('city'),
    district: get('district'),
    lat: get('lat') ? getNumber('lat', 0, -90, 90) : undefined,
    lng: get('lng') ? getNumber('lng', 0, -180, 180) : undefined,
    radius_km: getNumber('radius_km', 10, 1, 50), // Default 10km, max 50km
    
    // Business filters
    open_now: getBoolean('open_now', false),
    price_min: getNumber('price_min', 0, 0),
    price_max: getNumber('price_max', 1000, 0),
    
    // Sorting
    sort: getSort('sort'),
    
    // Pagination
    page: getNumber('page', 1, 1),
    cursor: get('cursor'),
  }
}

/**
 * Convert search params to API query parameters for NestJS backend
 */
export function toApiParams(params: ParsedSearchParams): Record<string, string> {
  const apiParams: Record<string, string> = {}

  // Text search (map q to keyword for backend)
  if (params.q) {
    apiParams.keyword = params.q
  }

  // Location filters
  if (params.lat !== undefined && params.lng !== undefined) {
    apiParams.lat = params.lat.toString()
    apiParams.lon = params.lng.toString() // Backend expects 'lon' not 'lng'
    apiParams.maxDistance = `${params.radius_km}km` // Backend expects format like "10km"
  }

  // Sport filter
  if (params.sport) {
    apiParams.sport = params.sport
  }

  // Published filter (always true for public search)
  apiParams.isPublished = 'true'

  // Sorting
  if (params.sort && params.sort !== 'default') {
    // Map frontend sort values to backend enum values
    switch (params.sort) {
      case 'distance':
        apiParams.sortBy = 'distance'
        break
      case 'price_asc':
        apiParams.sortBy = 'price'
        apiParams.sortOrder = 'asc'
        break
      case 'price_desc':
        apiParams.sortBy = 'price'
        apiParams.sortOrder = 'desc'
        break
      case 'rating_desc':
        apiParams.sortBy = 'rating'
        apiParams.sortOrder = 'desc'
        break
      default:
        apiParams.sortBy = 'relevance'
    }
  } else {
    // Default sorting
    apiParams.sortBy = 'relevance'
    apiParams.sortOrder = 'desc'
  }

  // Pagination (backend uses limit/offset, not page/cursor)
  apiParams.limit = '20' // Default limit
  
  // Handle cursor-based pagination for infinite scroll
  if (params.cursor) {
    // For cursor-based pagination, we need to decode the cursor to get the offset
    // The cursor should contain the offset value
    try {
      const cursorOffset = parseInt(params.cursor, 10)
      if (!isNaN(cursorOffset)) {
        apiParams.offset = cursorOffset.toString()
      } else {
        apiParams.offset = '0'
      }
    } catch {
      apiParams.offset = '0'
    }
  } else if (params.page && params.page > 1) {
    // Fallback to page-based pagination
    apiParams.offset = ((params.page - 1) * 20).toString()
  } else {
    apiParams.offset = '0'
  }

  // Note: city, district, open_now, price_min, price_max are frontend-only filters
  // Backend doesn't support these yet, so we don't send them

  return apiParams
}

/**
 * Build canonical URL for SEO (excludes lat/lng and other sensitive params)
 */
export function buildCanonicalUrl(
  searchParams?: ParsedSearchParams
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // Always use /facilities/search as the base path
  const path = 'facilities/search'
  
  // Add clean query params (no lat/lng, no cursor, no sensitive data)
  const cleanParams = new URLSearchParams()
  
  if (searchParams?.q) {
    cleanParams.set('q', searchParams.q)
  }
  if (searchParams?.sport) {
    cleanParams.set('sport', searchParams.sport)
  }
  if (searchParams?.city) {
    cleanParams.set('city', searchParams.city)
  }
  if (searchParams?.district) {
    cleanParams.set('district', searchParams.district)
  }
  if (searchParams?.open_now) {
    cleanParams.set('open_now', 'true')
  }
  if (searchParams?.price_min && searchParams.price_min > 0) {
    cleanParams.set('price_min', searchParams.price_min.toString())
  }
  if (searchParams?.price_max && searchParams.price_max < 1000) {
    cleanParams.set('price_max', searchParams.price_max.toString())
  }
  if (searchParams?.sort && searchParams.sort !== 'default') {
    cleanParams.set('sort', searchParams.sort)
  }
  if (searchParams?.page && searchParams.page > 1) {
    cleanParams.set('page', searchParams.page.toString())
  }
  
  const queryString = cleanParams.toString()
  return `${baseUrl}/${path}${queryString ? `?${queryString}` : ''}`
}

/**
 * Check if search should be noindex (contains sensitive location data)
 */
export function shouldNoIndex(params: ParsedSearchParams): boolean {
  // Noindex if lat/lng are present (location-specific results)
  return params.lat !== undefined && params.lng !== undefined
}

/**
 * Generate page title for SEO
 */
export function generatePageTitle(
  sport?: string,
  city?: string,
  district?: string,
  searchParams?: ParsedSearchParams
): string {
  const parts: string[] = []
  
  if (searchParams?.q) {
    parts.push(`"${searchParams.q}"`)
  }
  
  if (sport) {
    parts.push(`${sport.charAt(0).toUpperCase() + sport.slice(1)} Facilities`)
  } else {
    parts.push('Sports Facilities')
  }
  
  if (district && city) {
    parts.push(`in ${district}, ${city}`)
  } else if (city) {
    parts.push(`in ${city}`)
  }
  
  parts.push('- Booksan')
  
  return parts.join(' ')
}

/**
 * Generate page description for SEO
 */
export function generatePageDescription(
  sport?: string,
  city?: string,
  district?: string,
  searchParams?: ParsedSearchParams
): string {
  let description = 'Find and book amazing sports facilities'
  
  if (sport) {
    description = `Find and book ${sport} facilities`
  }
  
  if (district && city) {
    description += ` in ${district}, ${city}`
  } else if (city) {
    description += ` in ${city}`
  }
  
  description += '. Instant booking, verified reviews, and competitive prices.'
  
  if (searchParams?.open_now) {
    description += ' Currently open facilities available.'
  }
  
  return description
}
