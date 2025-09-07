'use client';

import * as React from 'react';
import { bookingApi } from '@/lib/api/bookings';
import type { BookingFilters, BookingsResponse } from '@/types/booking';

export function useBookings(filters: BookingFilters) {
  const [bookings, setBookings] = React.useState<BookingsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchBookings = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingApi.getBookings(filters);
      setBookings(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
  };
}
