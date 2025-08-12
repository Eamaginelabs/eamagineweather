import { useState, useEffect, useCallback } from 'react';
import { regionsApi } from '../lib/regionsApi';
import type { Region, RegionsSearchParams } from '../lib/regionsApi';

export interface UseRegionsResult {
  regions: Region[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  setSearchParams: (params: RegionsSearchParams) => void;
}

export function useRegions(initialParams: RegionsSearchParams = {}): UseRegionsResult {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchParams, setSearchParamsState] = useState<RegionsSearchParams>(initialParams);

  const fetchRegions = useCallback(async (params: RegionsSearchParams, append = false) => {
    if (!append) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await regionsApi.getRegions(params);
      
      if (append) {
        setRegions(prev => [...prev, ...response.data]);
      } else {
        setRegions(response.data);
      }
      
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch regions');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (page < totalPages) {
      const nextPage = page + 1;
      fetchRegions({ ...searchParams, page: nextPage }, true);
    }
  }, [page, totalPages, searchParams, fetchRegions]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchRegions({ ...searchParams, page: 1 });
  }, [searchParams, fetchRegions]);

  const setSearchParams = useCallback((params: RegionsSearchParams) => {
    setSearchParamsState(params);
    setPage(1);
    fetchRegions({ ...params, page: 1 });
  }, [fetchRegions]);

  useEffect(() => {
    fetchRegions(searchParams);
  }, [fetchRegions, searchParams]); // Include dependencies

  const hasMore = page < totalPages;

  return {
    regions,
    loading,
    error,
    total,
    page,
    totalPages,
    hasMore,
    loadMore,
    refresh,
    setSearchParams,
  };
}

// Hook for provinces
export function useProvinces() {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await regionsApi.getProvinces();
        setProvinces(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provinces');
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  return { provinces, loading, error };
}

// Hook for regencies by province
export function useRegenciesByProvince(provinceCode: string | null) {
  const [regencies, setRegencies] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provinceCode) {
      setRegencies([]);
      return;
    }

    const fetchRegencies = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await regionsApi.getRegenciesByProvince(provinceCode);
        setRegencies(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch regencies');
      } finally {
        setLoading(false);
      }
    };

    fetchRegencies();
  }, [provinceCode]);

  return { regencies, loading, error };
}

// Hook for villages with weather data
export function useVillagesByRegency(regencyCode: string | null) {
  const [villages, setVillages] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchVillages = useCallback(async (regencyCode: string, page: number, append = false) => {
    if (!append) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await regionsApi.getVillagesByRegency(regencyCode, page);
      
      if (append) {
        setVillages(prev => [...prev, ...response.data]);
      } else {
        setVillages(response.data);
      }
      
      setPage(response.page);
      setTotalPages(response.totalPages);
      setHasMore(response.page < response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch villages');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (regencyCode && hasMore) {
      fetchVillages(regencyCode, page + 1, true);
    }
  }, [regencyCode, hasMore, page, fetchVillages]);

  useEffect(() => {
    if (!regencyCode) {
      setVillages([]);
      setPage(1);
      setHasMore(false);
      return;
    }

    fetchVillages(regencyCode, 1);
  }, [regencyCode, fetchVillages]);

  return {
    villages,
    loading,
    error,
    hasMore,
    loadMore,
  };
}

// Hook for search
export function useRegionSearch() {
  const [results, setResults] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, level?: number) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await regionsApi.searchRegions(query, level);
      setResults(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clear,
  };
}