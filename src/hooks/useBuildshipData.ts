import { useQuery, useQueries } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { searchThoughts, searchEntities, getEntityMetrics, BuildshipThought, BuildshipEntity } from '@/services/buildshipApi';

// Manual refresh only - no automatic search
export const useThoughtsSearch = (searchTerm: string) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return useQuery({
    queryKey: ['thoughts', debouncedSearchTerm],
    queryFn: () => searchThoughts(debouncedSearchTerm),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: Infinity, // Never garbage collect
    enabled: false, // Manual refresh only
  });
};

// Manual refresh only - no automatic search  
export const useEntitiesSearch = (searchTerm: string) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Longer debounce for entities

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get both entities and all thoughts for metrics calculation
  const queries = useQueries({
    queries: [
      {
        queryKey: ['entities', debouncedSearchTerm],
        queryFn: () => searchEntities(debouncedSearchTerm),
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        gcTime: Infinity, // Never garbage collect
        enabled: false, // Manual refresh only
      },
      {
        queryKey: ['thoughts', ''], // Get all thoughts for entity metrics
        queryFn: () => searchThoughts(''),
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        gcTime: Infinity, // Never garbage collect
        enabled: false, // Manual refresh only
      }
    ]
  });

  const [entitiesQuery, thoughtsQuery] = queries;

  // Calculate final entities with metrics
  const entitiesWithMetrics = useQuery({
    queryKey: ['entities-with-metrics', debouncedSearchTerm, entitiesQuery.data, thoughtsQuery.data],
    queryFn: async () => {
      if (!entitiesQuery.data || !thoughtsQuery.data) return [];
      return getEntityMetrics(entitiesQuery.data, thoughtsQuery.data);
    },
    enabled: !!entitiesQuery.data && !!thoughtsQuery.data,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  return {
    data: entitiesWithMetrics.data,
    isLoading: entitiesQuery.isLoading || thoughtsQuery.isLoading || entitiesWithMetrics.isLoading,
    error: entitiesQuery.error || thoughtsQuery.error || entitiesWithMetrics.error,
    isSuccess: entitiesWithMetrics.isSuccess,
    refetch: () => {
      entitiesQuery.refetch();
      thoughtsQuery.refetch();
    }
  };
};