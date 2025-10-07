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

  // Add campaign as center node
  if (campaign) {
    nodes.push({
      id: campaign.id,
      label: campaign.name,
      data: {
        type: 'campaign',
        originalData: campaign
      }
    });
  }

  // Add all entities as nodes
  entities.forEach(entity => {
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

    // Connect campaign to entity
    if (campaign) {
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

    // Add parent entity relationships
    if (entity.parentEntityIds && entity.parentEntityIds.length > 0) {
      entity.parentEntityIds.forEach(parentId => {
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
      });
    }

    // Add linked entity relationships
    if (entity.linkedEntityIds && entity.linkedEntityIds.length > 0) {
      entity.linkedEntityIds.forEach(linkedId => {
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
      });
    }
  });

  // Add thoughts as nodes and connect to entities
  thoughts.forEach(thought => {
    const thoughtId = thought.id || thought.localId || '';
    nodes.push({
      id: thoughtId,
      label: thought.content.substring(0, 30) + '...',
      data: {
        type: 'thought',
        originalData: thought
      }
    });

    // Connect thought to all related entities (ID-based)
    if (thought.relatedEntityIds && thought.relatedEntityIds.length > 0) {
      thought.relatedEntityIds.forEach(entityId => {
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
      });
    }

    // Legacy: Connect thought to entities by name
    if (thought.relatedEntities && thought.relatedEntities.length > 0) {
      thought.relatedEntities.forEach(entityName => {
        const entity = entities.find(e => e.name === entityName);
        if (entity) {
          const entityId = entity.id || entity.localId || '';
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
  });

  return { nodes, edges };
};

/**
 * Gets color for a node based on its type
 */
export const getNodeColor = (node: GraphNode): string => {
  if (node.data.type === 'campaign') {
    return 'hsl(var(--primary))';
  }
  
  if (node.data.type === 'thought') {
    return 'hsl(var(--muted))';
  }

  // Entity - use entity type config colors
  if (node.data.type === 'entity' && node.data.entityType) {
    const config = getEntityTypeConfig(node.data.entityType as any);
    // Return different colors per entity type
    const colorMap: Record<string, string> = {
      'pc': 'hsl(210, 100%, 50%)',
      'npc': 'hsl(270, 100%, 50%)',
      'race': 'hsl(30, 100%, 50%)',
      'religion': 'hsl(330, 100%, 50%)',
      'quest': 'hsl(150, 100%, 40%)',
      'enemy': 'hsl(0, 100%, 50%)',
      'location': 'hsl(180, 100%, 40%)',
      'organization': 'hsl(240, 100%, 50%)',
      'item': 'hsl(45, 100%, 50%)',
      'plot-thread': 'hsl(300, 100%, 50%)'
    };
    return colorMap[node.data.entityType] || 'hsl(var(--accent))';
  }

  return 'hsl(var(--foreground))';
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
