import { useMemo } from 'react';
import { EntitySuggestion } from '@/types/entities';
import { businessLogicService } from '@/services/businessLogicService';

/**
 * Custom hook to generate entity suggestions from entities and thoughts
 */
export const useEntitySuggestions = (
  entities: Array<{ name: string; type: string }>,
  thoughts: Array<{ relatedEntities: string[] }>
): EntitySuggestion[] => {
  return useMemo(() => {
    return businessLogicService.createEntitySuggestions(entities, thoughts);
  }, [entities, thoughts]);
};