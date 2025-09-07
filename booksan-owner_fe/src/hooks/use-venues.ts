'use client';

import * as React from 'react';
import { venueApi } from '@/lib/api/venues';
import type { CourtFilters, CourtsResponse } from '@/types/venue';

export function useVenues(filters: CourtFilters) {
  const [venues, setVenues] = React.useState<CourtsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchVenues = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await venueApi.getCourts(filters);
      setVenues(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  return {
    venues,
    loading,
    error,
    refetch: fetchVenues,
  };
}
