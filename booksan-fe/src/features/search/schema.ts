import { z } from 'zod'
import { Sport, SortBy, SortOrder } from './types'

export const searchVenuesSchema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  maxDistance: z.string().default('50km'),
  sport: z.nativeEnum(Sport).optional(),
  isPublished: z.boolean().default(true),
  sortBy: z.nativeEnum(SortBy).default(SortBy.RELEVANCE),
  sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
})

export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().optional(),
    timestamp: z.number().optional(),
  }).optional(),
  maxDistance: z.string().default('50km'),
  sport: z.nativeEnum(Sport).optional(),
  isPublished: z.boolean().default(true),
  sortBy: z.nativeEnum(SortBy).default(SortBy.RELEVANCE),
  sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
})

export type SearchVenuesFormData = z.infer<typeof searchVenuesSchema>
export type SearchFiltersFormData = z.infer<typeof searchFiltersSchema>
