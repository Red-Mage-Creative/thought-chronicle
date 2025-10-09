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

  // Filter out entities/thoughts with invalid IDs
  const validEntities = entities.filter(entity => {
    const id = entity.id || entity.localId || '';
    if (!id) {
      console.warn('Skipping entity with missing ID:', entity.name);
      return false;
    }
    return true;
  });

  const validThoughts = thoughts.filter(thought => {
    const id = thought.id || thought.localId || '';
    if (!id) {
      console.warn('Skipping thought with missing ID:', thought.content.substring(0, 30));
      return false;
    }
    return true;
  });

  // Add campaign as center node
  if (campaign && campaign.id) {
    nodes.push({
      id: campaign.id,
      label: campaign.name,
      data: {
        type: 'campaign',
        originalData: campaign
      }
    });
    validNodeIds.add(campaign.id);
  }

  // Add all valid entities as nodes
  validEntities.forEach(entity => {
    const entityId = entity.id || entity.localId || '';
    nodes.push({
      id: entityId,
      label: entity.name,
      data: {
        type: 'entity',
        entityType: entity.type,
        thoughtCount: 0, // Will be calculated from thoughts
        originalData: entity
      }
    });
    validNodeIds.add(entityId);
  });

  // Add all valid thoughts as nodes
  validThoughts.forEach(thought => {
    const thoughtId = thought.id || thought.localId || '';
    nodes.push({
      id: thoughtId,
      label: thought.content.substring(0, 30) + '...',
      data: {
        type: 'thought',
        originalData: thought
      }
    });
    validNodeIds.add(thoughtId);
  });

  // Now add edges with validation
  // Campaign to Entity edges
  if (campaign && campaign.id && validNodeIds.has(campaign.id)) {
    validEntities.forEach(entity => {
      const entityId = entity.id || entity.localId || '';
      if (validNodeIds.has(entityId)) {
        const edgeId = `campaign-${campaign.id}-entity-${entityId}`;
        if (!visitedEdges.has(edgeId)) {
          edges.push({
            id: edgeId,
            source: campaign.id,
            target: entityId,
            data: { type: 'campaign-entity' }
          });
          visitedEdges.add(edgeId);
        }
      }
    });
  }

  // Entity relationship edges
  validEntities.forEach(entity => {
    const entityId = entity.id || entity.localId || '';

    // Add parent entity relationships
    if (entity.parentEntityIds && entity.parentEntityIds.length > 0) {
      entity.parentEntityIds.forEach(parentId => {
        // Only create edge if both nodes exist
        if (validNodeIds.has(entityId) && validNodeIds.has(parentId)) {
          const edgeId = `parent-${entityId}-${parentId}`;
          if (!visitedEdges.has(edgeId)) {
            edges.push({
              id: edgeId,
              source: entityId,
              target: parentId,
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
        // Only create edge if both nodes exist
        if (validNodeIds.has(entityId) && validNodeIds.has(linkedId)) {
          const edgeId = `linked-${entityId}-${linkedId}`;
          const reverseEdgeId = `linked-${linkedId}-${entityId}`;
          
          // Avoid duplicate bidirectional edges
          if (!visitedEdges.has(edgeId) && !visitedEdges.has(reverseEdgeId)) {
            edges.push({
              id: edgeId,
              source: entityId,
              target: linkedId,
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

    // Connect thought to all related entities (ID-based)
    if (thought.relatedEntityIds && thought.relatedEntityIds.length > 0) {
      thought.relatedEntityIds.forEach(entityId => {
        // Only create edge if both nodes exist
        if (validNodeIds.has(thoughtId) && validNodeIds.has(entityId)) {
          const edgeId = `thought-${thoughtId}-entity-${entityId}`;
          if (!visitedEdges.has(edgeId)) {
            edges.push({
              id: edgeId,
              source: entityId,
              target: thoughtId,
              data: { type: 'thought' }
            });
            visitedEdges.add(edgeId);

            // Increment thought count for entity
            const entityNode = nodes.find(n => n.id === entityId);
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
          // Only create edge if both nodes exist
          if (validNodeIds.has(thoughtId) && validNodeIds.has(entityId)) {
            const edgeId = `thought-${thoughtId}-entity-${entityId}`;
            if (!visitedEdges.has(edgeId)) {
              edges.push({
                id: edgeId,
                source: entityId,
                target: thoughtId,
                data: { type: 'thought' }
              });
              visitedEdges.add(edgeId);

              // Increment thought count for entity
              const entityNode = nodes.find(n => n.id === entityId);
              if (entityNode && entityNode.data.type === 'entity') {
                entityNode.data.thoughtCount = (entityNode.data.thoughtCount || 0) + 1;
              }
            }
          }
        }
      });
    }
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
