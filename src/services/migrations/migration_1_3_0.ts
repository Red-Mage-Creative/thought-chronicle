import { LocalDataStore } from '../dataStorageService';
import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';

/**
 * Migration v1.3.0: Convert name-based entity references to ID-based references
 * 
 * This migration transforms the system from using entity names as references
 * to using entity IDs (localId or id), which eliminates orphaned references
 * and improves data integrity.
 * 
 * Changes:
 * 1. Thoughts: relatedEntities (names) → relatedEntityIds (IDs)
 * 2. Entities: parentEntities (names) → parentEntityIds (IDs)
 * 3. Entities: linkedEntities (names) → linkedEntityIds (IDs)
 * 4. Auto-creates missing entities as 'uncategorized' if referenced but don't exist
 * 5. Keeps legacy name-based fields for backward compatibility
 */

interface EntityNameToIdMap {
  [name: string]: string; // Maps lowercase entity name to entity ID
}

/**
 * Build a map of entity names to their IDs for fast lookup
 */
function buildEntityNameToIdMap(entities: LocalEntity[]): EntityNameToIdMap {
  const map: EntityNameToIdMap = {};
  
  entities.forEach(entity => {
    const entityId = entity.localId || entity.id;
    if (entityId) {
      map[entity.name.toLowerCase()] = entityId;
    }
  });
  
  return map;
}

/**
 * Generate a unique local ID for new entities
 */
function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Resolve entity name to ID, creating the entity if it doesn't exist
 */
function resolveEntityNameToId(
  entityName: string,
  nameToIdMap: EntityNameToIdMap,
  entities: LocalEntity[],
  campaignId: string,
  userId: string,
  autoCreatedEntities: string[]
): string {
  const lowerName = entityName.trim().toLowerCase();
  
  // Check if entity exists
  if (nameToIdMap[lowerName]) {
    return nameToIdMap[lowerName];
  }
  
  // Entity doesn't exist - create it as 'uncategorized'
  const newEntityId = generateLocalId();
  const newEntity: LocalEntity = {
    localId: newEntityId,
    name: entityName.trim(),
    type: 'uncategorized',
    description: 'Auto-created during migration to ID-based references',
    campaign_id: campaignId,
    created_by: userId,
    syncStatus: 'pending',
    creationSource: 'auto',
    createdLocally: new Date(),
    parentEntityIds: [],
    linkedEntityIds: [],
    parentEntities: [], // Legacy field
    linkedEntities: [], // Legacy field
    attributes: []
  };
  
  entities.push(newEntity);
  nameToIdMap[lowerName] = newEntityId;
  autoCreatedEntities.push(entityName.trim());
  
  console.log(`[Migration 1.3.0] Auto-created missing entity: "${entityName.trim()}" with ID: ${newEntityId}`);
  
  return newEntityId;
}

/**
 * Main migration function
 */
export function migration_1_3_0_up(data: LocalDataStore): LocalDataStore {
  console.log('[Migration 1.3.0] Starting ID-based reference migration...');
  
  const autoCreatedEntities: string[] = [];
  
  // Get campaign and user context (use first campaign/user if multiple exist)
  const campaignId = data.campaigns?.[0]?.localId || data.campaigns?.[0]?.id || 'unknown';
  const userId = 'system'; // System migration user
  
  // Build entity name → ID map
  const nameToIdMap = buildEntityNameToIdMap(data.entities);
  console.log(`[Migration 1.3.0] Built map for ${data.entities.length} existing entities`);
  
  // ============================================================
  // 1. Migrate Thought References: relatedEntities → relatedEntityIds
  // ============================================================
  console.log(`[Migration 1.3.0] Migrating ${data.thoughts.length} thoughts...`);
  
  data.thoughts.forEach((thought: LocalThought) => {
    // Skip if already migrated (has relatedEntityIds)
    if (thought.relatedEntityIds && thought.relatedEntityIds.length > 0) {
      return;
    }
    
    // Convert entity names to IDs
    const relatedEntityIds: string[] = [];
    
    if (thought.relatedEntities && thought.relatedEntities.length > 0) {
      thought.relatedEntities.forEach(entityName => {
        const entityId = resolveEntityNameToId(
          entityName,
          nameToIdMap,
          data.entities,
          campaignId,
          userId,
          autoCreatedEntities
        );
        relatedEntityIds.push(entityId);
      });
    }
    
    // Set the new ID-based field
    thought.relatedEntityIds = relatedEntityIds;
    
    // Keep legacy field for backward compatibility (read-only)
    // thought.relatedEntities remains unchanged
  });
  
  console.log(`[Migration 1.3.0] Migrated ${data.thoughts.length} thoughts to ID-based references`);
  
  // ============================================================
  // 2. Migrate Entity Relationships: parentEntities → parentEntityIds
  // ============================================================
  console.log(`[Migration 1.3.0] Migrating entity parent relationships...`);
  
  data.entities.forEach((entity: LocalEntity) => {
    // Skip if already migrated
    if (entity.parentEntityIds && entity.parentEntityIds.length > 0) {
      return;
    }
    
    const parentEntityIds: string[] = [];
    
    if (entity.parentEntities && entity.parentEntities.length > 0) {
      entity.parentEntities.forEach(parentName => {
        const parentId = resolveEntityNameToId(
          parentName,
          nameToIdMap,
          data.entities,
          campaignId,
          userId,
          autoCreatedEntities
        );
        parentEntityIds.push(parentId);
      });
    }
    
    entity.parentEntityIds = parentEntityIds;
    // Keep legacy field for backward compatibility
  });
  
  // ============================================================
  // 3. Migrate Entity Relationships: linkedEntities → linkedEntityIds
  // ============================================================
  console.log(`[Migration 1.3.0] Migrating entity linked relationships...`);
  
  data.entities.forEach((entity: LocalEntity) => {
    // Skip if already migrated
    if (entity.linkedEntityIds && entity.linkedEntityIds.length > 0) {
      return;
    }
    
    const linkedEntityIds: string[] = [];
    
    if (entity.linkedEntities && entity.linkedEntities.length > 0) {
      entity.linkedEntities.forEach(linkedName => {
        const linkedId = resolveEntityNameToId(
          linkedName,
          nameToIdMap,
          data.entities,
          campaignId,
          userId,
          autoCreatedEntities
        );
        linkedEntityIds.push(linkedId);
      });
    }
    
    entity.linkedEntityIds = linkedEntityIds;
    // Keep legacy field for backward compatibility
  });
  
  console.log(`[Migration 1.3.0] Migration complete!`);
  console.log(`[Migration 1.3.0] Total entities: ${data.entities.length}`);
  console.log(`[Migration 1.3.0] Auto-created entities: ${autoCreatedEntities.length}`);
  
  if (autoCreatedEntities.length > 0) {
    console.log(`[Migration 1.3.0] Auto-created entities:`, autoCreatedEntities);
  }
  
  return data;
}

/**
 * Rollback migration (optional but recommended)
 */
export function migration_1_3_0_down(data: LocalDataStore): LocalDataStore {
  console.log('[Migration 1.3.0] Rolling back ID-based reference migration...');
  
  // Remove ID-based fields from thoughts
  data.thoughts.forEach((thought: LocalThought) => {
    delete thought.relatedEntityIds;
  });
  
  // Remove ID-based fields from entities
  data.entities.forEach((entity: LocalEntity) => {
    delete entity.parentEntityIds;
    delete entity.linkedEntityIds;
  });
  
  console.log('[Migration 1.3.0] Rollback complete - reverted to name-based references');
  
  return data;
}
