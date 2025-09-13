'use client';

import * as React from 'react';
import { bookingApi } from '@/lib/api/bookings';
import type { BookingFilters, BookingsResponse } from '@/types/booking';

export function useBookings(filters: BookingFilters = {}) {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchBookings = React.useCallback(async (newFilters?: BookingFilters) => {
    try {
      setLoading(true);
      setError(null);
      const filtersToUse = newFilters || filters;
      const result = await bookingApi.getBookings(filtersToUse);
      setBookings(result.bookings || []);
    } catch (err) {
      setError(err as Error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getBooking = React.useCallback((bookingId: string) => {
    return bookings.find(b => b.id === bookingId);
  }, [bookings]);

  const cancelBooking = React.useCallback(
    async (bookingId: string, reason: string) => {
      const result = await bookingApi.cancelBooking(bookingId, reason);
      // Refresh bookings after cancellation
      await fetchBookings();
      return result;
    },
    [fetchBookings]
  );

  const refetch = React.useCallback(() => {
    return fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    getBooking,
    cancelBooking,
    fetchBookings,
    refetch,
  };
}
