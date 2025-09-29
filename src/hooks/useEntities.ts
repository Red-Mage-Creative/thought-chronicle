import { useState, useEffect } from 'react';
import { LocalEntity, EntityWithMetrics, EntitySuggestion } from '@/types/entities';
import { entityService } from '@/services/entityService';
import { thoughtService } from '@/services/thoughtService';

export const useEntities = () => {
  const [entities, setEntities] = useState<LocalEntity[]>([]);
  const [entitiesWithMetrics, setEntitiesWithMetrics] = useState<EntityWithMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshEntities = () => {
    setIsLoading(true);
    try {
      const allEntities = entityService.getAllEntities();
      const allThoughts = thoughtService.getAllThoughts();
      const withMetrics = entityService.getEntitiesWithMetrics(allThoughts);
      
      setEntities(allEntities);
      setEntitiesWithMetrics(withMetrics);
    } catch (error) {
      // Error handling - could add toast here in the future
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshEntities();
  }, []);

  const createEntity = async (name: string, type?: string, description?: string) => {
    try {
      const entity = entityService.createEntity(
        name, 
        type as any, 
        description,
        'manual'
      );
      refreshEntities();
      return entity;
    } catch (error) {
      // Error handling - let component handle the error
      throw error;
    }
  };

  const getSuggestions = (): EntitySuggestion[] => {
    return entities.map(entity => ({
      name: entity.name,
      type: entity.type
    }));
  };

  return {
    entities,
    entitiesWithMetrics,
    isLoading,
    createEntity,
    refreshEntities,
    getSuggestions
  };
};