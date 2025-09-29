import { entityService } from './entityService';
import { thoughtService } from './thoughtService';
import { createEntitiesFromTags, generateLocalId } from '@/utils/entityUtils';
import { VALIDATION, MESSAGES } from '@/utils/constants';
import { EntitySuggestion } from '@/types/entities';
import { StandardThought } from '@/types/standard';

export interface ThoughtCreationResult {
  thought: StandardThought;
  newEntitiesCreated: number;
  entityNames: string[];
}

export const businessLogicService = {
  /**
   * Create entity suggestions from existing entities and thought mentions
   */
  createEntitySuggestions(
    entities: Array<{ name: string; type: string }>,
    thoughts: Array<{ relatedEntities: string[] }>
  ): EntitySuggestion[] {
    const entityMap = new Map<string, { name: string; type: string }>();
    
    // Add all formal entities
    entities.forEach(entity => {
      entityMap.set(entity.name.toLowerCase(), {
        name: entity.name,
        type: entity.type
      });
    });
    
    // Add mentioned-only entities from thoughts
    thoughts.forEach(thought => {
      const thoughtEntities = thought.relatedEntities || [];
      thoughtEntities.forEach(entityName => {
        const key = entityName.toLowerCase();
        if (!entityMap.has(key)) {
          entityMap.set(key, {
            name: entityName,
            type: 'character' // Default type for mentioned-only entities
          });
        }
      });
    });
    
    return Array.from(entityMap.values()).map(entity => ({
      name: entity.name,
      type: entity.type as any // Cast for type compatibility
    }));
  },

  /**
   * Process thought creation with entity auto-creation
   */
  async processThoughtCreation(
    content: string,
    manualTags: string[],
    defaultTags: string[],
    gameDate?: string
  ): Promise<ThoughtCreationResult> {
    console.log('🔍 [DEBUG] processThoughtCreation started', {
      content: content.substring(0, 50) + '...',
      manualTags,
      defaultTags,
      gameDate
    });

    if (content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }
    
    if (content.length > VALIDATION.MAX_CONTENT_DISPLAY_LENGTH) {
      throw new Error(`Content exceeds maximum length of ${VALIDATION.MAX_CONTENT_DISPLAY_LENGTH} characters`);
    }

    // Combine manual tags with default tags (remove duplicates)
    const allTags = [...new Set([...defaultTags, ...manualTags])];
    console.log('🔍 [DEBUG] Combined tags:', allTags);
    
    // Get existing entity names for duplicate checking
    const existingEntities = entityService.getAllEntities();
    const existingEntityNames = existingEntities.map(e => e.name.toLowerCase());
    console.log('🔍 [DEBUG] Existing entity names:', existingEntityNames);
    
    // Create new entities for tags that don't exist
    const newEntityData = createEntitiesFromTags(allTags, existingEntityNames);
    console.log('🔍 [DEBUG] New entities to create:', newEntityData);
    
    const createdEntities = [];
    for (const data of newEntityData) {
      try {
        console.log('🔍 [DEBUG] Attempting to create entity:', data);
        const entity = entityService.createEntity(data.name, data.type, data.description);
        console.log('🔍 [DEBUG] Successfully created entity:', entity);
        createdEntities.push(entity);
      } catch (error) {
        console.warn('🔍 [DEBUG] Failed to create entity:', data.name, error);
      }
    }
    
    console.log('🔍 [DEBUG] Entity creation summary:', {
      newEntitiesCreated: createdEntities.length,
      entityNames: createdEntities.map(e => e.name)
    });
    
    // Create the thought with proper ID generation
    const thoughtData = {
      id: generateLocalId(),
      content: content.trim(),
      relatedEntities: allTags,
      timestamp: new Date(),
      gameDate: gameDate || undefined
    };

    console.log('🔍 [DEBUG] Creating thought with data:', thoughtData);
    const thought = thoughtService.createThought(
      thoughtData.content,
      thoughtData.relatedEntities,
      thoughtData.gameDate
    );
    console.log('🔍 [DEBUG] Created thought:', thought);
    
    const result = {
      thought,
      newEntitiesCreated: createdEntities.length,
      entityNames: createdEntities.map(e => e.name)
    };
    
    console.log('🔍 [DEBUG] processThoughtCreation completed:', result);
    return result;
  },

  /**
   * Validate content length
   */
  validateContentLength(content: string): { isValid: boolean; isOverLimit: boolean; characterCount: number } {
    const characterCount = content.length;
    const isOverLimit = characterCount > VALIDATION.MAX_CONTENT_LENGTH;
    const isValid = content.trim().length > 0 && !isOverLimit;
    
    return { isValid, isOverLimit, characterCount };
  },

  /**
   * Format entity creation message
   */
  formatEntityCreationMessage(count: number, entityNames: string[]): string {
    if (count === 0) return '';
    if (count === 1) return `${MESSAGES.ENTITY_CREATED_SINGLE}: ${entityNames[0]}`;
    return `${MESSAGES.ENTITY_CREATED_MULTIPLE(count)}: ${entityNames.join(', ')}`;
  }
};