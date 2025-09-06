import { revalidateTag } from 'next/cache'

export const BookingsCacheTags = {
  ALL: 'bookings:all',
  DETAIL: (id: string) => `bookings:detail:${id}`,
  USER_BOOKINGS: (userId: string) => `bookings:user:${userId}`,
  VENUE_BOOKINGS: (venueId: string) => `bookings:venue:${venueId}`,
} as const

export function invalidateBookingsCache() {
  revalidateTag(BookingsCacheTags.ALL)
}

export function invalidateUserBookingsCache(userId: string) {
  revalidateTag(BookingsCacheTags.USER_BOOKINGS(userId))
}

export function invalidateVenueBookingsCache(venueId: string) {
  revalidateTag(BookingsCacheTags.VENUE_BOOKINGS(venueId))
}

export const bookingsKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingsKeys.all, 'list'] as const,
  list: (filters: unknown) => [...bookingsKeys.lists(), filters] as const,
  details: () => [...bookingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingsKeys.details(), id] as const,
}
