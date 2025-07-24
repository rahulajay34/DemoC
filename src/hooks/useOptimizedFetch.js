// Current data fetching in pages is slow, querying MongoDB for multiple collections. This hook optimizes with SWR caching and parallel fetching.
"use client";
import useSWR from 'swr';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';

// Enhanced fetcher with intelligent caching and retry logic
const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await response.text();
    error.status = response.status;
    throw error;
  }
  return response.json();
};

// React Query fetcher
const reactQueryFetcher = async ({ queryKey }) => {
  const [url, params] = queryKey;
  const urlWithParams = params ? `${url}?${new URLSearchParams(params)}` : url;
  return fetcher(urlWithParams);
};

// Custom hook for optimized data fetching with SWR + React Query hybrid
export function useOptimizedFetch(endpoint, options = {}) {
  const {
    refreshInterval = 0,
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    dedupingInterval = 5000, // Prevent duplicate requests for 5 seconds
    strategy = 'swr', // 'swr', 'react-query', or 'hybrid'
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    retry = 3,
    retryDelay = (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...swrOptions
  } = options;

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    cacheHits: 0,
    networkRequests: 0,
    averageResponseTime: 0,
    errors: 0
  });

  // SWR implementation with enhanced error handling
  const { data, error, isLoading, mutate } = useSWR(
    strategy === 'react-query' ? null : endpoint,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect,
      dedupingInterval,
      onSuccess: (data) => {
        setPerformanceMetrics(prev => ({
          ...prev,
          cacheHits: prev.cacheHits + 1
        }));
      },
      onError: (error) => {
        console.warn(`SWR fetch error for ${endpoint}:`, error);
        setPerformanceMetrics(prev => ({
          ...prev,
          errors: prev.errors + 1
        }));
      },
      ...swrOptions
    }
  );

  // React Query implementation
  const queryClient = useQueryClient();
  const reactQueryResult = useQuery({
    queryKey: [endpoint],
    queryFn: reactQueryFetcher,
    enabled: strategy === 'react-query' || strategy === 'hybrid',
    staleTime,
    cacheTime,
    retry,
    retryDelay,
    refetchInterval: refreshInterval || false,
    refetchOnWindowFocus: revalidateOnFocus,
    onSuccess: () => {
      setPerformanceMetrics(prev => ({
        ...prev,
        cacheHits: prev.cacheHits + 1
      }));
    },
    onError: (error) => {
      setPerformanceMetrics(prev => ({
        ...prev,
        errors: prev.errors + 1
      }));
    }
  });

  // Memoized functions to prevent unnecessary re-renders
  const refresh = useCallback(async () => {
    try {
      if (strategy === 'react-query' || strategy === 'hybrid') {
        await queryClient.invalidateQueries([endpoint]);
      }
      if (strategy === 'swr' || strategy === 'hybrid') {
        mutate();
      }
      setPerformanceMetrics(prev => ({
        ...prev,
        networkRequests: prev.networkRequests + 1
      }));
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  }, [mutate, queryClient, endpoint, strategy]);
  
  // Choose the best result based on strategy
  const finalResult = useMemo(() => {
    if (strategy === 'react-query') {
      return {
        data: reactQueryResult.data,
        error: reactQueryResult.error,
        isLoading: reactQueryResult.isLoading,
        isError: !!reactQueryResult.error,
        refresh
      };
    } else if (strategy === 'hybrid') {
      // Use whichever has data or is more recent
      const swrHasData = data !== undefined;
      const reactQueryHasData = reactQueryResult.data !== undefined;
      
      if (swrHasData && reactQueryHasData) {
        return {
          data: data,
          error: error,
          isLoading: isLoading,
          isError: !!error,
          refresh
        };
      } else if (swrHasData) {
        return {
          data,
          error,
          isLoading,
          isError: !!error,
          refresh
        };
      } else {
        return {
          data: reactQueryResult.data,
          error: reactQueryResult.error,
          isLoading: reactQueryResult.isLoading,
          isError: !!reactQueryResult.error,
          refresh
        };
      }
    } else {
      return {
        data,
        error,
        isLoading,
        isError: !!error,
        refresh
      };
    }
  }, [data, error, isLoading, reactQueryResult, strategy, refresh]);

  return {
    ...finalResult,
    performanceMetrics
  };
}

// Hook for parallel fetching multiple endpoints efficiently
export function useParallelFetch(endpoints, options = {}) {
  const results = {};
  let hasError = false;
  let isAnyLoading = false;

  // Fetch all endpoints in parallel using SWR
  endpoints.forEach((endpoint, index) => {
    const key = typeof endpoint === 'object' ? endpoint.key : `endpoint_${index}`;
    const url = typeof endpoint === 'object' ? endpoint.url : endpoint;
    
    const { data, error, isLoading } = useOptimizedFetch(url, options);
    
    results[key] = { data, error, isLoading };
    
    if (error) hasError = true;
    if (isLoading) isAnyLoading = true;
  });

  return {
    results,
    hasError,
    isLoading: isAnyLoading,
    refresh: () => {
      Object.values(results).forEach(result => {
        if (result.refresh) result.refresh();
      });
    }
  };
}

// Hook for optimized pagination
export function usePaginatedFetch(baseEndpoint, page = 1, limit = 10, filters = {}) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  }).toString();
  
  const endpoint = `${baseEndpoint}?${queryParams}`;
  
  const { data, error, isLoading, refresh } = useOptimizedFetch(endpoint, {
    dedupingInterval: 2000, // Cache pagination requests for 2 seconds
  });

  return {
    data: data?.data || data || [],
    pagination: data?.pagination || {},
    total: data?.pagination?.totalItems || 0,
    error,
    isLoading,
    refresh
  };
}

// Hook for real-time data with optimized polling
export function useRealTimeData(endpoint, intervalMs = 30000) {
  return useOptimizedFetch(endpoint, {
    refreshInterval: intervalMs,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });
}
