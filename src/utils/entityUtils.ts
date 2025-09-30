import { LucideIcon } from 'lucide-react';
import { EntityType } from '@/types/entities';
import { 
  ENTITY_TYPES, 
  ENTITY_ICONS, 
  ENTITY_CLASSES, 
  TYPE_INFERENCE_PATTERNS 
} from './constants';

/**
 * Get the appropriate Lucide icon for an entity type
 */
export const getEntityIcon = (type: string): LucideIcon => {
  const normalizedType = type?.toLowerCase();
  return ENTITY_ICONS[normalizedType as keyof typeof ENTITY_ICONS] || ENTITY_ICONS[ENTITY_TYPES.NPC];
};

/**
 * Get the appropriate CSS class for an entity type
 */
export const getEntityClass = (type: string): string => {
  const normalizedType = type?.toLowerCase();
  return ENTITY_CLASSES[normalizedType as keyof typeof ENTITY_CLASSES] || ENTITY_CLASSES[ENTITY_TYPES.NPC];
};

/**
 * Infer entity type from name using pattern matching
 */
export const inferEntityType = (name: string): EntityType => {
  const lower = name.toLowerCase();
  
  // Check each type's patterns
  for (const [entityType, patterns] of Object.entries(TYPE_INFERENCE_PATTERNS)) {
    if (patterns.some(pattern => lower.includes(pattern))) {
      return entityType as EntityType;
    }
  }
  
  // Default to uncategorized when uncertain
  return ENTITY_TYPES.UNCATEGORIZED;
};

/**
 * Normalize entity type to standard format
 */
export const normalizeEntityType = (type: string): EntityType => {
  const lower = type?.toLowerCase();
  
  // Map legacy types to standard types
  const typeMapping: Record<string, EntityType> = {
    'character': ENTITY_TYPES.NPC,  // Legacy 'character' becomes 'npc'
    'player': ENTITY_TYPES.PC,
    'npc': ENTITY_TYPES.NPC,
    'place': ENTITY_TYPES.LOCATION,
    'city': ENTITY_TYPES.LOCATION,
    'weapon': ENTITY_TYPES.ITEM,
    'artifact': ENTITY_TYPES.ITEM,
    'guild': ENTITY_TYPES.ORGANIZATION,
    'faction': ENTITY_TYPES.ORGANIZATION,
  };
  
  return typeMapping[lower] || (lower as EntityType) || ENTITY_TYPES.UNCATEGORIZED;
};

/**
 * Validate if a string is a valid entity type
 */
export const isValidEntityType = (type: string): type is EntityType => {
  return Object.values(ENTITY_TYPES).includes(type as EntityType);
};

/**
 * Get all valid entity types
 */
export const getAllEntityTypes = (): EntityType[] => {
  return Object.values(ENTITY_TYPES);
};

/**
 * Generate a unique local ID for entities and thoughts
 */
export const generateLocalId = (): string => 
  `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Create entities from tag names with proper type inference
 */
export const createEntitiesFromTags = (
  tagNames: string[], 
  existingEntityNames: string[]
): Array<{ name: string; type: EntityType; description: string }> => {
  const newEntities: Array<{ name: string; type: EntityType; description: string }> = [];
  
  tagNames.forEach(tagName => {
    if (!existingEntityNames.includes(tagName.toLowerCase())) {
      const entityType = inferEntityType(tagName);
      newEntities.push({
        name: tagName,
        type: entityType,
        description: 'Created from message tagging.'
      });
    }
  });
  
  return newEntities;
};