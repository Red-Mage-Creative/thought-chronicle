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
    entityId?: string;  // For navigation (added in transformToForceGraphData)
    thoughtId?: string; // For navigation (added in transformToForceGraphData)
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
    relationshipType?: 'parent' | 'linked' | 'mention';
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ForceGraphLink {
  source: string;
  target: string;
  label?: string;
  data: {
    type: 'campaign-entity' | 'parent' | 'linked' | 'thought';
    relationshipType?: 'parent' | 'linked' | 'mention';
  };
}

export interface ForceGraphData {
  nodes: GraphNode[];
  links: ForceGraphLink[];
}

export interface GraphValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
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
              data: { type: 'parent', relationshipType: 'parent' }
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
              data: { type: 'linked', relationshipType: 'linked' }
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
              data: { type: 'thought', relationshipType: 'mention' }
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
                data: { type: 'thought', relationshipType: 'mention' }
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
 * Transforms campaign, entities, and thoughts into force-graph data structure
 * Same as transformToGraphData but edges are called 'links' for react-force-graph
 */
export const transformToForceGraphData = (
  campaign: Campaign | null,
  entities: LocalEntity[],
  thoughts: LocalThought[]
): ForceGraphData => {
  const graphData = transformToGraphData(campaign, entities, thoughts);
  
  // Convert edges to links and add entity/thought IDs to node data for navigation
  const nodes = graphData.nodes.map(node => {
    const originalData = node.data.originalData;
    let entityId: string | undefined;
    let thoughtId: string | undefined;
    
    if (node.data.type === 'entity' && 'id' in originalData) {
      entityId = originalData.id || (originalData as LocalEntity).localId;
    } else if (node.data.type === 'thought' && 'id' in originalData) {
      thoughtId = originalData.id || (originalData as LocalThought).localId;
    }
    
    return {
      ...node,
      data: {
        ...node.data,
        entityId,
        thoughtId
      }
    };
  });
  
  const links: ForceGraphLink[] = graphData.edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    label: edge.label,
    data: edge.data
  }));
  
  return { nodes, links };
};

/**
 * Gets color for a node based on its type
 * Uses design system colors matching entity badges in index.css
 */
export const getNodeColor = (node: GraphNode): string => {
  if (node.data.type === 'campaign') {
    return '#fbbf24'; // Gold/amber for campaign center
  }
  
  if (node.data.type === 'thought') {
    return '#9ca3af'; // Gray for thoughts
  }

  // Entity - use design system colors from index.css
  if (node.data.type === 'entity' && node.data.entityType) {
    const colorMap: Record<string, string> = {
      'pc': '#059669',        // Green - matches .entity-pc
      'npc': '#3b82f6',       // Blue - matches .entity-npc
      'race': '#0d9488',      // Teal - matches .entity-race
      'religion': '#d97706',  // Amber - matches .entity-religion
      'quest': '#4f46e5',     // Indigo - matches .entity-quest
      'enemy': '#dc2626',     // Red - matches .entity-enemy
      'location': '#7c3aed',  // Purple - matches .entity-location
      'organization': '#e11d48', // Rose - matches .entity-organization
      'item': '#eab308',      // Yellow - matches .entity-item
      'plot-thread': '#8b5cf6', // Violet - matches .entity-plot-thread
      'uncategorized': '#ea580c' // Orange - matches .entity-uncategorized
    };
    return colorMap[node.data.entityType] || colorMap['uncategorized'];
  }

  return '#71717a'; // Neutral gray fallback
};

/**
 * Gets icon glyph for a node based on its type
 * Uses emoji for broad compatibility
 */
export const getIconGlyph = (node: GraphNode): string => {
  if (node.data.type === 'campaign') return '⭐';
  if (node.data.type === 'thought') return '💭';
  
  if (node.data.type === 'entity' && node.data.entityType) {
    const glyphMap: Record<string, string> = {
      'pc': '🧙',
      'npc': '👤',
      'race': '🏛️',
      'religion': '⛪',
      'quest': '📜',
      'enemy': '💀',
      'location': '📍',
      'organization': '🏰',
      'item': '📦',
      'plot-thread': '🔗'
    };
    return glyphMap[node.data.entityType] || '❓';
  }
  
  return '⚪';
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

/**
 * Validates graph data before passing to reagraph
 * Checks for required fields and data integrity
 */
export const validateGraphData = (graphData: GraphData): GraphValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate nodes
  if (!Array.isArray(graphData.nodes)) {
    errors.push('nodes must be an array');
    return { isValid: false, errors, warnings };
  }

  const nodeIds = new Set<string>();
  graphData.nodes.forEach((node, index) => {
    if (!node.id || typeof node.id !== 'string') {
      errors.push(`Node at index ${index} missing or invalid id`);
    } else {
      if (nodeIds.has(node.id)) {
        warnings.push(`Duplicate node id: ${node.id}`);
      }
      nodeIds.add(node.id);
    }

    if (!node.label || typeof node.label !== 'string') {
      warnings.push(`Node ${node.id || index} missing or invalid label`);
    }

    if (!node.data || typeof node.data !== 'object') {
      errors.push(`Node ${node.id || index} missing or invalid data object`);
    }
  });

  // Validate edges
  if (!Array.isArray(graphData.edges)) {
    errors.push('edges must be an array');
    return { isValid: false, errors, warnings };
  }

  graphData.edges.forEach((edge, index) => {
    if (!edge.id || typeof edge.id !== 'string') {
      errors.push(`Edge at index ${index} missing or invalid id`);
    }

    if (!edge.source || typeof edge.source !== 'string') {
      errors.push(`Edge ${edge.id || index} missing or invalid source`);
    } else if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id || index} references non-existent source node: ${edge.source}`);
    }

    if (!edge.target || typeof edge.target !== 'string') {
      errors.push(`Edge ${edge.id || index} missing or invalid target`);
    } else if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id || index} references non-existent target node: ${edge.target}`);
    }

    if (!edge.data || typeof edge.data !== 'object') {
      warnings.push(`Edge ${edge.id || index} missing or invalid data object`);
    }
  });

  console.log('[validateGraphData] Validation complete:', {
    isValid: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    nodeCount: graphData.nodes.length,
    edgeCount: graphData.edges.length
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Transforms data for entity-centered graph view
 * Shows only the specified entity and its immediate connections
 */
export const transformToEntityCenteredGraph = (
  centerEntityId: string,
  allEntities: LocalEntity[],
  allThoughts: LocalThought[]
): GraphData => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const validNodeIds = new Set<string>();
  
  // Find the center entity
  const centerEntity = allEntities.find(
    e => (e.localId || e.id) === centerEntityId
  );
  
  if (!centerEntity) {
    console.warn('[transformToEntityCenteredGraph] Center entity not found:', centerEntityId);
    return { nodes: [], edges: [] };
  }
  
  const centerNodeId = makeId('entity', centerEntityId);
  
  // Add center entity as primary node
  nodes.push({
    id: centerNodeId,
    label: centerEntity.name,
    data: {
      type: 'entity',
      entityType: centerEntity.type,
      thoughtCount: 0,
      originalData: centerEntity
    }
  });
  validNodeIds.add(centerNodeId);
  
  // Add parent entities (one level up)
  const parentIds = centerEntity.parentEntityIds || [];
  parentIds.forEach(parentId => {
    const parent = allEntities.find(e => (e.localId || e.id) === parentId);
    if (parent) {
      const nodeId = makeId('entity', parentId);
      nodes.push({
        id: nodeId,
        label: parent.name,
        data: {
          type: 'entity',
          entityType: parent.type,
          thoughtCount: 0,
          originalData: parent
        }
      });
      validNodeIds.add(nodeId);
      
      edges.push({
        id: `${nodeId}-parent-${centerNodeId}`,
        source: nodeId,
        target: centerNodeId,
        label: 'Parent',
        data: { type: 'parent', relationshipType: 'parent' }
      });
    }
  });
  
  // Add child entities (one level down)
  const children = allEntities.filter(e => 
    (e.parentEntityIds || []).includes(centerEntityId)
  );
  children.forEach(child => {
    const childId = child.localId || child.id!;
    const nodeId = makeId('entity', childId);
    nodes.push({
      id: nodeId,
      label: child.name,
      data: {
        type: 'entity',
        entityType: child.type,
        thoughtCount: 0,
        originalData: child
      }
    });
    validNodeIds.add(nodeId);
    
    edges.push({
      id: `${nodeId}-parent-${centerNodeId}`,
      source: centerNodeId,
      target: nodeId,
      label: 'Parent',
      data: { type: 'parent', relationshipType: 'parent' }
    });
  });
  
  // Add linked entities (peers)
  const linkedIds = centerEntity.linkedEntityIds || [];
  linkedIds.forEach(linkedId => {
    const linked = allEntities.find(e => (e.localId || e.id) === linkedId);
    if (linked) {
      const nodeId = makeId('entity', linkedId);
      nodes.push({
        id: nodeId,
        label: linked.name,
        data: {
          type: 'entity',
          entityType: linked.type,
          thoughtCount: 0,
          originalData: linked
        }
      });
      validNodeIds.add(nodeId);
      
      edges.push({
        id: `${centerNodeId}-linked-${nodeId}`,
        source: centerNodeId,
        target: nodeId,
        label: 'Linked',
        data: { type: 'linked', relationshipType: 'linked' }
      });
    }
  });
  
  // Add thoughts mentioning this entity (limit to 5 most recent)
  const relatedThoughts = allThoughts
    .filter(t => {
      // Check ID-based references
      if (t.relatedEntityIds && t.relatedEntityIds.includes(centerEntityId)) {
        return true;
      }
      // Fall back to name-based
      return t.relatedEntities.some(name => 
        name.toLowerCase() === centerEntity.name.toLowerCase()
      );
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);
  
  relatedThoughts.forEach(thought => {
    const thoughtId = thought.localId || thought.id!;
    const nodeId = makeId('thought', thoughtId);
    nodes.push({
      id: nodeId,
      label: thought.content.substring(0, 30) + '...',
      data: {
        type: 'thought',
        originalData: thought
      }
    });
    validNodeIds.add(nodeId);
    
    edges.push({
      id: `${nodeId}-${centerNodeId}`,
      source: centerNodeId,
      target: nodeId,
      label: 'Mentions',
      data: { type: 'thought', relationshipType: 'mention' }
    });
    
    // Increment thought count for center entity
    const centerNode = nodes.find(n => n.id === centerNodeId);
    if (centerNode && centerNode.data.type === 'entity') {
      centerNode.data.thoughtCount = (centerNode.data.thoughtCount || 0) + 1;
    }
  });
  
  console.log('[transformToEntityCenteredGraph] Created entity-centered graph:', {
    centerEntity: centerEntity.name,
    nodes: nodes.length,
    edges: edges.length
  });
  
  return { nodes, edges };
};
