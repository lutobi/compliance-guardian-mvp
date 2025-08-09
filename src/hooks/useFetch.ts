'use client';

import { useState, useEffect, useCallback } from 'react';

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseFetchOptions<T> {
  /**
   * Initial data to use before fetch completes
   */
  initialData?: T;
  
  /**
   * Whether to fetch immediately on mount
   */
  fetchImmediately?: boolean;
  
  /**
   * Function to transform the response data
   */
  transform?: (data: any) => T;
  
  /**
   * Dependencies for the fetch to re-run when changed
   */
  dependencies?: any[];
  
  /**
   * Enable request caching
   */
  cache?: boolean;
}

interface UseFetchResult<T> {
  /**
   * Current fetch status
   */
  status: FetchStatus;
  
  /**
   * The fetched data (if successful)
   */
  data: T | null;
  
  /**
   * Any error that occurred during fetching
   */
  error: Error | null;
  
  /**
   * Function to manually trigger the fetch
   */
  fetch: () => Promise<T | null>;
  
  /**
   * Whether the fetch is currently loading
   */
  isLoading: boolean;
  
  /**
   * Whether the fetch was successful
   */
  isSuccess: boolean;
  
  /**
   * Whether the fetch encountered an error
   */
  isError: boolean;
}

/**
 * Hook for fetching data with built-in loading and error states
 */
export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const {
    initialData = null,
    fetchImmediately = true,
    transform,
    dependencies = [],
    cache = true
  } = options;

  const [status, setStatus] = useState<FetchStatus>('idle');
  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<Error | null>(null);

  // Static cache of responses to avoid refetching
  const responseCache = new Map();

  // Main fetch function
  const fetchData = useCallback(async (): Promise<T | null> => {
    if (!url) {
      setStatus('idle');
      return null;
    }
    
    try {
      setStatus('loading');
      setError(null);
      
      // Check cache first if enabled
      if (cache && responseCache.has(url)) {
        const cachedData = responseCache.get(url);
        setData(cachedData);
        setStatus('success');
        return cachedData;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const responseData = await response.json();
      const transformedData = transform ? transform(responseData) : responseData;
      
      // Cache the response if enabled
      if (cache) {
        responseCache.set(url, transformedData);
      }
      
      setData(transformedData);
      setStatus('success');
      return transformedData;
    } catch (error: any) {
      setError(error instanceof Error ? error : new Error(error?.message || 'An unknown error occurred'));
      setStatus('error');
      return null;
    }
  }, [url, transform, cache, ...dependencies]);

  // Initial fetch on mount if enabled
  useEffect(() => {
    if (fetchImmediately) {
      fetchData();
    }
  }, [fetchData, fetchImmediately]);

  return {
    status,
    data,
    error,
    fetch: fetchData,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
}

export default useFetch;
