import { LocalThought } from '@/types/thoughts';
import { LocalEntity } from '@/types/entities';
import { entityService } from '@/services/entityService';

export interface PlotThreadGroup {
  entity: LocalEntity;
  thoughts: LocalThought[];
  metrics: {
    thoughtCount: number;
    firstMention?: Date;
    lastMention?: Date;
    isActive: boolean;
  };
}

/**
 * Groups thoughts by their associated plot thread entities
 */
export const groupThoughtsByPlotThread = (
  plotThreadEntities: LocalEntity[],
  allThoughts: LocalThought[]
): PlotThreadGroup[] => {
  return plotThreadEntities.map(entity => {
    // Find thoughts that reference this plot thread entity (by ID or legacy name)
    const relatedThoughts = allThoughts.filter(thought => {
      const hasIdReference = thought.relatedEntityIds?.includes(entity.id || '') || 
                            thought.relatedEntityIds?.includes(entity.localId || '');
      const hasNameReference = thought.relatedEntities?.includes(entity.name);
      return hasIdReference || hasNameReference;
    });

    // Sort by timestamp (newest first)
    const sortedThoughts = relatedThoughts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const metrics = calculateThreadMetrics(sortedThoughts);

    return {
      entity,
      thoughts: sortedThoughts,
      metrics
    };
  });
};

/**
 * Checks if a plot thread entity is marked as active
 * Checks the 'Active' attribute on the entity
 * Falls back to time-based logic if no Active attribute exists (backward compatibility)
 */
export const isPlotThreadActive = (entity: LocalEntity): boolean => {
  // Check for Active attribute (case-insensitive)
  const activeAttr = entity.attributes?.find(
    attr => attr.key.toLowerCase() === 'active'
  );
  
  if (activeAttr) {
    const value = activeAttr.value.toLowerCase();
    return value === 'yes' || value === 'true';
  }
  
  // Fallback for backward compatibility: assume active if no attribute
  return true;
};

/**
 * Calculates metrics for a plot thread
 */
export const calculateThreadMetrics = (thoughts: LocalThought[]) => {
  if (thoughts.length === 0) {
    return {
      thoughtCount: 0,
      isActive: false
    };
  }

  const timestamps = thoughts.map(t => new Date(t.timestamp).getTime());
  const firstMention = new Date(Math.min(...timestamps));
  const lastMention = new Date(Math.max(...timestamps));

  // Consider active if mentioned in last 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const isActive = lastMention.getTime() > thirtyDaysAgo;

  return {
    thoughtCount: thoughts.length,
    firstMention,
    lastMention,
    isActive
  };
};

/**
 * Filters plot thread groups to only active ones
 * Uses the entity's 'Active' attribute if present, otherwise falls back to time-based logic
 */
export const filterActiveThreads = (groups: PlotThreadGroup[]): PlotThreadGroup[] => {
  return groups.filter(group => isPlotThreadActive(group.entity));
};

/**
 * Searches plot threads by entity name or thought content
 */
export const searchPlotThreads = (
  groups: PlotThreadGroup[],
  searchTerm: string
): PlotThreadGroup[] => {
  if (!searchTerm.trim()) return groups;

  const lowerSearch = searchTerm.toLowerCase();

  return groups
    .map(group => {
      // Check if entity name matches
      const entityMatches = group.entity.name.toLowerCase().includes(lowerSearch);

      // Filter thoughts that match search
      const matchingThoughts = group.thoughts.filter(thought =>
        thought.content.toLowerCase().includes(lowerSearch)
      );

      // Include group if entity matches or has matching thoughts
      if (entityMatches) {
        return group;
      } else if (matchingThoughts.length > 0) {
        return {
          ...group,
          thoughts: matchingThoughts,
          metrics: {
            ...group.metrics,
            thoughtCount: matchingThoughts.length
          }
        };
      }

      return null;
    })
    .filter((group): group is PlotThreadGroup => group !== null);
};
