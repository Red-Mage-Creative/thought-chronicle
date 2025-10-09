import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { Campaign } from '@/types/campaigns';
import { getEntityTypeConfig } from '@/config/entityTypeConfig';

export interface GraphNode {
  id: string;
  label: string;
  data: {
    type: 'campaign' | 'entity' | 'thought';
    entityType?: string;
    thoughtCount?: number;
    originalData: Campaign | LocalEntity | LocalThought;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data: {
    type: 'campaign-entity' | 'parent' | 'linked' | 'thought';
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Helper to create namespaced IDs to avoid collisions
const makeId = (type: 'campaign' | 'entity' | 'thought', id: string): string => {
  return `${type}:${id}`;
};

/**
 * Transforms campaign, entities, and thoughts into graph data structure
 * Campaign is at the center, connected to all entities
 * Entities connect to each other (parent/linked relationships)
 * Entities connect to thoughts that mention them
 */
export const transformToGraphData = (
  campaign: Campaign | null,
  entities: LocalEntity[],
  thoughts: LocalThought[]
): GraphData => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const visitedEdges = new Set<string>();
  const validNodeIds = new Set<string>();
  let skippedEntities = 0;
  let skippedThoughts = 0;

  // Filter out entities/thoughts with invalid IDs
  const validEntities = entities.filter(entity => {
    const id = entity.id || entity.localId || '';
    if (!id) {
      console.warn('Skipping entity with missing ID:', entity.name);
      skippedEntities++;
      return false;
    }
    return true;
  });

  const validThoughts = thoughts.filter(thought => {
    const id = thought.id || thought.localId || '';
    if (!id) {
      console.warn('Skipping thought with missing ID:', thought.content.substring(0, 30));
      skippedThoughts++;
      return false;
    }
    return true;
  });

  // Add campaign as center node
  if (campaign && campaign.id) {
    const campaignId = makeId('campaign', campaign.id);
    nodes.push({
      id: campaignId,
      label: campaign.name,
      data: {
        type: 'campaign',
        originalData: campaign
      }
    });
    validNodeIds.add(campaignId);
  }

  // Add all valid entities as nodes
  validEntities.forEach(entity => {
    const entityId = entity.id || entity.localId || '';
    const namespacedId = makeId('entity', entityId);
    nodes.push({
      id: namespacedId,
      label: entity.name,
      data: {
        type: 'entity',
        entityType: entity.type,
        thoughtCount: 0, // Will be calculated from thoughts
        originalData: entity
      }
    });
    validNodeIds.add(namespacedId);
  });

  // Add all valid thoughts as nodes
  validThoughts.forEach(thought => {
    const thoughtId = thought.id || thought.localId || '';
    const namespacedId = makeId('thought', thoughtId);
    nodes.push({
      id: namespacedId,
      label: thought.content.substring(0, 30) + '...',
      data: {
        type: 'thought',
        originalData: thought
      }
    });
    validNodeIds.add(namespacedId);
  });

  // Now add edges with validation
  // Campaign to Entity edges
  if (campaign && campaign.id) {
    const campaignId = makeId('campaign', campaign.id);
    if (validNodeIds.has(campaignId)) {
      validEntities.forEach(entity => {
        const entityId = entity.id || entity.localId || '';
        const namespacedEntityId = makeId('entity', entityId);
        if (validNodeIds.has(namespacedEntityId)) {
          const edgeId = `${campaignId}-to-${namespacedEntityId}`;
          if (!visitedEdges.has(edgeId)) {
            edges.push({
              id: edgeId,
              source: campaignId,
              target: namespacedEntityId,
              data: { type: 'campaign-entity' }
            });
            visitedEdges.add(edgeId);
          }
        }
      });
    }
  }

  // Entity relationship edges
  validEntities.forEach(entity => {
    const entityId = entity.id || entity.localId || '';
    const namespacedEntityId = makeId('entity', entityId);

    // Add parent entity relationships
    if (entity.parentEntityIds && entity.parentEntityIds.length > 0) {
      entity.parentEntityIds.forEach(parentId => {
        const namespacedParentId = makeId('entity', parentId);
        // Only create edge if both nodes exist
        if (validNodeIds.has(namespacedEntityId) && validNodeIds.has(namespacedParentId)) {
          const edgeId = `${namespacedParentId}-parent-${namespacedEntityId}`;
          if (!visitedEdges.has(edgeId)) {
            edges.push({
              id: edgeId,
              source: namespacedParentId,
              target: namespacedEntityId,
              label: 'parent',
              data: { type: 'parent' }
            });
            visitedEdges.add(edgeId);
          }
        }
      });
    }

    // Add linked entity relationships
    if (entity.linkedEntityIds && entity.linkedEntityIds.length > 0) {
      entity.linkedEntityIds.forEach(linkedId => {
        const namespacedLinkedId = makeId('entity', linkedId);
        // Only create edge if both nodes exist
        if (validNodeIds.has(namespacedEntityId) && validNodeIds.has(namespacedLinkedId)) {
          const edgeId = `${namespacedEntityId}-linked-${namespacedLinkedId}`;
          const reverseEdgeId = `${namespacedLinkedId}-linked-${namespacedEntityId}`;
          
          // Avoid duplicate bidirectional edges
          if (!visitedEdges.has(edgeId) && !visitedEdges.has(reverseEdgeId)) {
            edges.push({
              id: edgeId,
              source: namespacedEntityId,
              target: namespacedLinkedId,
              label: 'linked',
              data: { type: 'linked' }
            });
            visitedEdges.add(edgeId);
          }
        }
      });
    }
  });

  // Thought to Entity edges
  validThoughts.forEach(thought => {
    const thoughtId = thought.id || thought.localId || '';
    const namespacedThoughtId = makeId('thought', thoughtId);

    // Connect thought to all related entities (ID-based)
    if (thought.relatedEntityIds && thought.relatedEntityIds.length > 0) {
      thought.relatedEntityIds.forEach(entityId => {
        const namespacedEntityId = makeId('entity', entityId);
        // Only create edge if both nodes exist
        if (validNodeIds.has(namespacedThoughtId) && validNodeIds.has(namespacedEntityId)) {
          const edgeId = `${namespacedThoughtId}-about-${namespacedEntityId}`;
          if (!visitedEdges.has(edgeId)) {
            edges.push({
              id: edgeId,
              source: namespacedEntityId,
              target: namespacedThoughtId,
              data: { type: 'thought' }
            });
            visitedEdges.add(edgeId);

            // Increment thought count for entity
            const entityNode = nodes.find(n => n.id === namespacedEntityId);
            if (entityNode && entityNode.data.type === 'entity') {
              entityNode.data.thoughtCount = (entityNode.data.thoughtCount || 0) + 1;
            }
          }
        }
      });
    }

    // Legacy: Connect thought to entities by name
    if (thought.relatedEntities && thought.relatedEntities.length > 0) {
      thought.relatedEntities.forEach(entityName => {
        const entity = validEntities.find(e => e.name === entityName);
        if (entity) {
          const entityId = entity.id || entity.localId || '';
          const namespacedEntityId = makeId('entity', entityId);
          // Only create edge if both nodes exist
          if (validNodeIds.has(namespacedThoughtId) && validNodeIds.has(namespacedEntityId)) {
            const edgeId = `${namespacedThoughtId}-about-${namespacedEntityId}`;
            if (!visitedEdges.has(edgeId)) {
              edges.push({
                id: edgeId,
                source: namespacedEntityId,
                target: namespacedThoughtId,
                data: { type: 'thought' }
              });
              visitedEdges.add(edgeId);

              // Increment thought count for entity
              const entityNode = nodes.find(n => n.id === namespacedEntityId);
              if (entityNode && entityNode.data.type === 'entity') {
                entityNode.data.thoughtCount = (entityNode.data.thoughtCount || 0) + 1;
              }
            }
          }
        }
      });
    }
  });

  // Log summary for debugging
  console.log('Graph data summary:', {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    skippedEntities,
    skippedThoughts,
    uniqueNodeIds: validNodeIds.size
  });

  return { nodes, edges };
};

/**
 * Gets color for a node based on its type
 * Uses concrete hex colors instead of CSS variables for reagraph WebGL compatibility
 */
export const getNodeColor = (node: GraphNode): string => {
  if (node.data.type === 'campaign') {
    return '#fbbf24'; // Gold/amber for campaign center
  }
  
  if (node.data.type === 'thought') {
    return '#9ca3af'; // Gray for thoughts
  }

  // Entity - use concrete hex colors per entity type
  if (node.data.type === 'entity' && node.data.entityType) {
    const colorMap: Record<string, string> = {
      'pc': '#3b82f6',        // Blue
      'npc': '#a855f7',       // Purple
      'race': '#f97316',      // Orange
      'religion': '#ec4899',  // Pink
      'quest': '#10b981',     // Green
      'enemy': '#ef4444',     // Red
      'location': '#06b6d4',  // Cyan
      'organization': '#6366f1', // Indigo
      'item': '#eab308',      // Yellow
      'plot-thread': '#d946ef' // Fuchsia
    };
    return colorMap[node.data.entityType] || '#8b5cf6'; // Default purple
  }

  return '#71717a'; // Neutral gray fallback
};

/**
 * Gets size for a node based on its type and metrics
 */
export const getNodeSize = (node: GraphNode): number => {
  if (node.data.type === 'campaign') {
    return 30; // Largest
  }

  if (node.data.type === 'entity') {
    // Size based on thought count (10-25 range)
    const thoughtCount = node.data.thoughtCount || 0;
    return Math.min(10 + thoughtCount * 2, 25);
  }

  if (node.data.type === 'thought') {
    return 5; // Smallest
  }

  return 10;
};
