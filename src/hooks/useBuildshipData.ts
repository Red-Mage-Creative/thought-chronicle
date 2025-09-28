import { useQuery, useQueries } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { searchThoughts, searchEntities, getEntityMetrics, BuildshipThought, BuildshipEntity } from '@/services/buildshipApi';

// Debounced search hook for thoughts
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
    staleTime: 1000 * 60 * 2, // 2 minutes for thoughts (more dynamic)
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });
};

// Enhanced entities hook with smart caching and metrics calculation
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
        staleTime: 1000 * 60 * 15, // 15 minutes for entities (more stable)
        gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
      },
      {
        queryKey: ['thoughts', ''], // Get all thoughts for entity metrics
        queryFn: () => searchThoughts(''),
        staleTime: 1000 * 60 * 5, // 5 minutes for thoughts data
        gcTime: 1000 * 60 * 15,
        enabled: !!debouncedSearchTerm || debouncedSearchTerm === '', // Always enabled for metrics
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
    staleTime: 1000 * 60 * 10, // 10 minutes for calculated metrics
  });

  return {
    data: entitiesWithMetrics.data,
    isLoading: entitiesQuery.isLoading || thoughtsQuery.isLoading || entitiesWithMetrics.isLoading,
    error: entitiesQuery.error || thoughtsQuery.error || entitiesWithMetrics.error,
    isSuccess: entitiesWithMetrics.isSuccess,
  };
};