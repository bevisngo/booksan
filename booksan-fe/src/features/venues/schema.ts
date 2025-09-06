import { z } from 'zod'

export const venueHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  isOpen: z.boolean(),
})

export const bookingSettingsSchema = z.object({
  advanceBookingDays: z.number().min(1).max(365),
  cancellationPolicy: z.enum(['flexible', 'moderate', 'strict']),
  minimumBookingDuration: z.number().min(30), // 30 minutes minimum
  maximumBookingDuration: z.number().max(1440), // 24 hours maximum
  requiresApproval: z.boolean(),
  allowInstantBooking: z.boolean(),
})

export const createVenueSchema = z.object({
  name: z.string().min(2, 'Venue name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Please enter a valid email address'),
  website: z.string().url('Please enter a valid URL').optional(),
  images: z.array(z.string().url('Please enter valid image URLs')).min(1, 'At least one image is required'),
  amenities: z.array(z.string()).min(1, 'At least one amenity is required'),
  sports: z.array(z.string()).min(1, 'At least one sport is required'),
  priceRange: z.object({
    min: z.number().min(0, 'Minimum price cannot be negative'),
    max: z.number().min(0, 'Maximum price cannot be negative'),
  }).refine(data => data.max >= data.min, {
    message: 'Maximum price must be greater than or equal to minimum price',
    path: ['max'],
  }),
  hours: z.array(venueHoursSchema).length(7, 'All 7 days of the week must be specified'),
  bookingSettings: bookingSettingsSchema,
})

export const updateVenueSchema = createVenueSchema.partial().extend({
  status: z.enum(['active', 'inactive']).optional(),
})

export const venueSearchSchema = z.object({
  query: z.string().optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(1).max(100), // 1-100 km
  }).optional(),
  sports: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
  amenities: z.array(z.string()).optional(),
  availableDate: z.string().optional(),
  availableTime: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }).optional(),
  rating: z.number().min(1).max(5).optional(),
  sortBy: z.enum(['distance', 'price', 'rating', 'popularity']).default('distance'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const createReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment cannot exceed 1000 characters'),
  images: z.array(z.string().url('Please enter valid image URLs')).max(5, 'Maximum 5 images allowed').optional(),
})

export type CreateVenueFormData = z.infer<typeof createVenueSchema>
export type UpdateVenueFormData = z.infer<typeof updateVenueSchema>
export type VenueSearchFormData = z.infer<typeof venueSearchSchema>
export type CreateReviewFormData = z.infer<typeof createReviewSchema>
export type VenueHoursFormData = z.infer<typeof venueHoursSchema>
export type BookingSettingsFormData = z.infer<typeof bookingSettingsSchema>
