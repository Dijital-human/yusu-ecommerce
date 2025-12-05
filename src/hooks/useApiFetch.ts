/**
 * useApiFetch Hook / useApiFetch Hook-u
 * Generic hook for API fetching with loading and error states
 * Yükləmə və xəta vəziyyətləri ilə API fetch üçün generic hook
 */

import { useState, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

interface UseApiFetchOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseApiFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetchData: (url: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

export function useApiFetch<T = any>(
  options?: UseApiFetchOptions
): UseApiFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (url: string, fetchOptions?: RequestInit): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions?.headers,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          const errorMessage = result.error || `Failed to fetch from ${url}`;
          setError(errorMessage);
          options?.onError?.(errorMessage);
          logger.error('API fetch failed', new Error(errorMessage), { url, status: response.status });
          return null;
        }

        setData(result.data);
        options?.onSuccess?.(result.data);
        return result.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        logger.error('API fetch error', err, { url });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, fetchData, reset };
}

