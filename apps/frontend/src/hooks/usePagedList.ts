import { useState, useEffect, useCallback } from 'react';
import type { ApiListResponse } from '../services/api';

interface FetchParams {
  page: number;
  size: number;
  [key: string]: any;
}

export function usePagedList<T>(
  fetchFn: (params: FetchParams) => Promise<ApiListResponse<T>>,
  initialSize = 20,
  extraParams: Record<string, any> = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(0); // 0-based indexing for backend
  const [size, setSize] = useState(initialSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Serialize extraParams to safely use in dependency array
  const serializedParams = JSON.stringify(extraParams);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const paramsToPass = { page, size, ...JSON.parse(serializedParams) };
      const response = await fetchFn(paramsToPass);
      setData(response.data || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error fetching data'));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, size, serializedParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    items: data,
    page,
    size,
    totalElements,
    totalPages,
    loading,
    error,
    setPage,
    setSize,
    reload: loadData,
  };
}
