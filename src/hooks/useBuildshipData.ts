import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { searchThoughts, searchEntities, BuildshipThought, BuildshipEntity } from '@/services/buildshipApi';

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
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
};

// Debounced search hook for entities
export const useEntitiesSearch = (searchTerm: string) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return useQuery({
    queryKey: ['entities', debouncedSearchTerm],
    queryFn: () => searchEntities(debouncedSearchTerm),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
};