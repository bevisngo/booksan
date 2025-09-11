'use client';

import * as React from 'react';
import { courtApi } from '@/lib/api/courts';
import type {
  CourtFilters,
  Court,
  CourtWithFacility,
  CourtStats,
} from '@/types/court';

export function useCourts(filters: CourtFilters = {}) {
  const [courts, setCourts] = React.useState<Court[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchCourts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await courtApi.getCourts(filters);
      setCourts(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  return {
    courts,
    loading,
    error,
    refetch: fetchCourts,
  };
}

export function useCourt(id: string) {
  const [court, setCourt] = React.useState<CourtWithFacility | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchCourt = React.useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const result = await courtApi.getCourt(id);
      setCourt(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchCourt();
  }, [fetchCourt]);

  return {
    court,
    loading,
    error,
    refetch: fetchCourt,
  };
}

export function useCourtsByFacility(facilityId: string) {
  const [courts, setCourts] = React.useState<Court[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchCourts = React.useCallback(async () => {
    if (!facilityId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await courtApi.getCourtsByFacility(facilityId);
      setCourts(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  React.useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  return {
    courts,
    loading,
    error,
    refetch: fetchCourts,
  };
}

export function useCourtStats(facilityId?: string) {
  const [stats, setStats] = React.useState<CourtStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchStats = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await courtApi.getCourtStats(facilityId);
      setStats(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

export function useCourtMutations() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const createCourt = React.useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await courtApi.createCourt(data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCourt = React.useCallback(async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await courtApi.updateCourt(id, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCourt = React.useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await courtApi.deleteCourt(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateCourt = React.useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await courtApi.activateCourt(id);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateCourt = React.useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await courtApi.deactivateCourt(id);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createCourt,
    updateCourt,
    deleteCourt,
    activateCourt,
    deactivateCourt,
  };
}
