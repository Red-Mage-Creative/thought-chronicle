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
    if (content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }
    
    if (content.length > VALIDATION.MAX_CONTENT_DISPLAY_LENGTH) {
      throw new Error(`Content exceeds maximum length of ${VALIDATION.MAX_CONTENT_DISPLAY_LENGTH} characters`);
    }

    // Combine manual tags with default tags (remove duplicates)
    const allTags = [...new Set([...defaultTags, ...manualTags])];
    
    // Get existing entity names for duplicate checking
    const existingEntities = entityService.getAllEntities();
    const existingEntityNames = existingEntities.map(e => e.name.toLowerCase());
    
    // Create new entities for tags that don't exist
    const newEntityData = createEntitiesFromTags(allTags, existingEntityNames);
    const createdEntities = newEntityData.map(data => 
      entityService.createEntity(data.name, data.type, data.description)
    );
    
    // Create the thought with proper ID generation
    const thoughtData = {
      id: generateLocalId(),
      content: content.trim(),
      relatedEntities: allTags,
      timestamp: new Date(),
      gameDate: gameDate || undefined
    };

    const thought = thoughtService.createThought(
      thoughtData.content,
      thoughtData.relatedEntities,
      thoughtData.gameDate
    );
    
    return {
      thought,
      newEntitiesCreated: createdEntities.length,
      entityNames: createdEntities.map(e => e.name)
    };
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