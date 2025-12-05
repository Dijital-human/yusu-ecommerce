/**
 * useAsyncState Hook / useAsyncState Hook-u
 * Hook for managing async operations with loading and error states
 * Yükləmə və xəta vəziyyətləri ilə async əməliyyatları idarə etmək üçün hook
 */

import { useState, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

interface UseAsyncStateOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseAsyncStateResult {
  loading: boolean;
  error: string | null;
  execute: <T>(asyncFunction: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export function useAsyncState(
  options?: UseAsyncStateOptions
): UseAsyncStateResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async <T,>(asyncFunction: () => Promise<T>): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await asyncFunction();
        options?.onSuccess?.();
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        logger.error('Async operation failed', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, execute, reset };
}

