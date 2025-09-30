import { LocalDataStore } from './dataStorageService';
import { ENTITY_TYPES } from '@/utils/constants';
import { inferEntityType } from '@/utils/entityUtils';

export interface Migration {
  version: string;        // Target version
  name: string;          // Unique identifier
  description: string;   // Human-readable description
  up: (data: LocalDataStore) => LocalDataStore;  // Forward migration
  down?: (data: LocalDataStore) => LocalDataStore;  // Rollback (optional)
}

export const migrationRegistry: Migration[] = [
  {
    version: '0.3.0',
    name: 'add-entity-creation-source',
    description: 'Add creationSource field to entities',
    up: (data) => {
      data.entities.forEach(entity => {
        if (!entity.creationSource) {
          entity.creationSource = entity.description?.includes('Created from message tagging') 
            ? 'auto' 
            : 'manual';
        }
      });
      return data;
    }
  },
  {
    version: '0.4.0',
    name: 'add-entity-timestamps',
    description: 'Add createdLocally field to entities',
    up: (data) => {
      data.entities.forEach(entity => {
        if (!entity.createdLocally) {
          entity.createdLocally = entity.modifiedLocally || new Date();
        }
      });
      return data;
    }
  },
  {
    version: '0.6.0',
    name: 'migrate-character-to-npc',
    description: 'Rename entity type "character" to "npc"',
    up: (data) => {
      data.entities.forEach(entity => {
        // @ts-ignore - Allow checking for legacy 'character' type
        if (entity.type === 'character') {
          entity.type = ENTITY_TYPES.NPC;
          entity.modifiedLocally = new Date();
        }
        
        // Re-infer type for auto-created entities that might be uncategorized
        if (entity.creationSource === 'auto' && entity.type === ENTITY_TYPES.NPC) {
          const inferredType = inferEntityType(entity.name);
          if (inferredType !== ENTITY_TYPES.NPC) {
            entity.type = inferredType;
            entity.modifiedLocally = new Date();
          }
        }
      });
      return data;
    }
  },
  {
    version: '0.6.0',
    name: 'add-entity-relationships',
    description: 'Add parentEntities and linkedEntities arrays',
    up: (data) => {
      data.entities.forEach(entity => {
        if (!entity.parentEntities) entity.parentEntities = [];
        if (!entity.linkedEntities) entity.linkedEntities = [];
      });
      return data;
    }
  },
  {
    version: '0.7.0',
    name: 'ensure-markdown-ready',
    description: 'Ensure all entity descriptions are ready for markdown rendering',
    up: (data) => {
      // No transformation needed - markdown is backward compatible with plain text
      // This migration is just a version bump marker
      return data;
    }
  }
];
