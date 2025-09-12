'use client';

import * as React from 'react';
import { facilityApi } from '@/lib/api/facilities';
import type { FacilityFilters, FacilitiesResponse, Facility } from '@/types/facility';

export function useFacilities(filters: FacilityFilters = {}) {
  const [facilities, setFacilities] = React.useState<FacilitiesResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchFacilities = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await facilityApi.getFacilities(filters);
      setFacilities(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  return {
    facilities,
    loading,
    error,
    refetch: fetchFacilities,
  };
}

export function useFacility(id: string) {
  const [facility, setFacility] = React.useState<Facility | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchFacility = React.useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await facilityApi.getFacility(id);
      setFacility(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchFacility();
  }, [fetchFacility]);

  return {
    facility,
    loading,
    error,
    refetch: fetchFacility,
  };
}
