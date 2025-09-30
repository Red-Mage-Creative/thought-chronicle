import { dataStorageService } from './dataStorageService';
import { ENTITY_TYPES } from '@/utils/constants';
import { inferEntityType } from '@/utils/entityUtils';

export const dataMigrationService = {
  /**
   * Migrate legacy 'character' type to 'npc' and add new entity fields
   */
  migrateEntityTypes(): void {
    const data = dataStorageService.getData();
    let hasChanges = false;
    
    // Migrate legacy 'character' type to 'npc'
    data.entities.forEach(entity => {
      // @ts-ignore - Allow checking for legacy 'character' type
      if (entity.type === 'character') {
        entity.type = ENTITY_TYPES.NPC;
        entity.modifiedLocally = new Date();
        hasChanges = true;
      }
      
      // Re-infer type for auto-created entities that might be uncategorized
      if (entity.creationSource === 'auto' && entity.type === ENTITY_TYPES.NPC) {
        const inferredType = inferEntityType(entity.name);
        if (inferredType !== ENTITY_TYPES.NPC) {
          entity.type = inferredType;
          entity.modifiedLocally = new Date();
          hasChanges = true;
        }
      }
    });

    // Migrate entities to add new fields if missing
    data.entities.forEach(entity => {
      if (!entity.creationSource) {
        entity.creationSource = entity.description?.includes('Created from message tagging') ? 'auto' : 'manual';
        hasChanges = true;
      }
      if (!entity.createdLocally) {
        entity.createdLocally = entity.modifiedLocally || new Date();
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      dataStorageService.saveData(data);
    }
  },

  /**
   * Run all migrations
   */
  runMigrations(): void {
    try {
      this.migrateEntityTypes();
    } catch (error) {
      // Silently handle migration errors to avoid blocking app startup
    }
  }
};