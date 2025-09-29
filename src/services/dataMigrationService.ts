import { dataStorageService } from './dataStorageService';
import { ENTITY_TYPES } from '@/utils/constants';
import { inferEntityType } from '@/utils/entityUtils';

export const dataMigrationService = {
  /**
   * Migrate existing entities to use uncategorized type for uncertain categorizations
   */
  migrateToUncategorizedEntities(): void {
    const data = dataStorageService.getData();
    let hasChanges = false;
    
    // Look for entities that were auto-categorized as 'character' but might be uncertain
    data.entities.forEach(entity => {
      // Check if this entity was likely auto-categorized incorrectly
      // If the entity name doesn't match any strong patterns and is currently 'character', 
      // it should probably be 'uncategorized'
      if (entity.type === 'character' && entity.description?.includes('Auto-created from tag:')) {
        const inferredType = inferEntityType(entity.name);
        
        // If inference now returns uncategorized (due to updated logic), update the entity
        if (inferredType === ENTITY_TYPES.UNCATEGORIZED) {
          entity.type = ENTITY_TYPES.UNCATEGORIZED;
          entity.modifiedLocally = new Date();
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      dataStorageService.saveData(data);
      console.log('Migrated entities to use uncategorized type where appropriate');
    }
  },

  /**
   * Run all migrations
   */
  runMigrations(): void {
    try {
      this.migrateToUncategorizedEntities();
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }
};