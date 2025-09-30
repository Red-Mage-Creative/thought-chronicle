import { LocalEntity, EntityType, EntityWithMetrics } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { dataStorageService } from './dataStorageService';
import { campaignService } from './campaignService';
import { inferEntityType } from '@/utils/entityUtils';

export const entityService = {
  // ============================================================
  // Basic Entity Retrieval
  // ============================================================
  
  getAllEntities(): LocalEntity[] {
    const data = dataStorageService.getData();
    return data.entities;
  },

  getEntityByName(name: string): LocalEntity | undefined {
    const entities = this.getAllEntities();
    return entities.find(entity => entity.name.toLowerCase() === name.toLowerCase());
  },

  // ============================================================
  // ID-Based Helper Methods (v1.3.0+)
  // ============================================================

  /**
   * Get entity by ID (localId or id)
   * @param id - Entity ID (localId or server id)
   * @returns Entity or undefined if not found
   */
  getEntityById(id: string): LocalEntity | undefined {
    const entities = this.getAllEntities();
    return entities.find(entity => entity.localId === id || entity.id === id);
  },

  /**
   * Get entity ID by name (case-insensitive)
   * @param name - Entity name
   * @returns Entity ID (localId or id) or undefined if not found
   */
  getEntityIdByName(name: string): string | undefined {
    const entity = this.getEntityByName(name);
    return entity ? (entity.localId || entity.id) : undefined;
  },

  /**
   * Get entity name by ID
   * @param id - Entity ID (localId or server id)
   * @returns Entity name or undefined if not found
   */
  getEntityNameById(id: string): string | undefined {
    const entity = this.getEntityById(id);
    return entity?.name;
  },

  /**
   * Get multiple entities by their IDs
   * @param ids - Array of entity IDs
   * @returns Array of entities (skips IDs that don't exist)
   */
  getEntitiesByIds(ids: string[]): LocalEntity[] {
    const entities: LocalEntity[] = [];
    ids.forEach(id => {
      const entity = this.getEntityById(id);
      if (entity) {
        entities.push(entity);
      }
    });
    return entities;
  },

  /**
   * Convert entity names to IDs
   * @param names - Array of entity names
   * @returns Array of entity IDs (skips names that don't exist)
   */
  convertNamesToIds(names: string[]): string[] {
    const ids: string[] = [];
    names.forEach(name => {
      const id = this.getEntityIdByName(name);
      if (id) {
        ids.push(id);
      }
    });
    return ids;
  },

  /**
   * Convert entity IDs to names
   * @param ids - Array of entity IDs
   * @returns Array of entity names (skips IDs that don't exist)
   */
  convertIdsToNames(ids: string[]): string[] {
    const names: string[] = [];
    ids.forEach(id => {
      const name = this.getEntityNameById(id);
      if (name) {
        names.push(name);
      }
    });
    return names;
  },

  // ============================================================
  // Entity Creation
  // ============================================================


  createEntity(
    name: string, 
    type?: EntityType, 
    description?: string,
    creationSource: 'manual' | 'auto' = 'manual',
    attributes?: any[]
  ): LocalEntity {
    const data = dataStorageService.getData();
    const campaignId = campaignService.getCurrentCampaignId();
    const userId = campaignService.getCurrentUserId();
    
    if (!campaignId || !userId) {
      throw new Error('No active campaign or user session found');
    }
    
    // Check for duplicates (case-insensitive)
    const existing = data.entities.find(e => e.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      throw new Error(`Entity "${name}" already exists`);
    }
    
    const inferredType = type || inferEntityType(name);

    const entity = dataStorageService.addEntity({
      name,
      type: inferredType,
      description,
      creationSource,
      attributes: attributes || [],
      campaign_id: campaignId,
      created_by: userId
    });
    
    return entity;
  },

  ensureEntityExists(name: string): LocalEntity {
    const existing = this.getEntityByName(name);
    if (existing) {
      return existing;
    }
    
    return this.createEntity(name);
  },

  getEntitiesWithMetrics(thoughts: LocalThought[]): EntityWithMetrics[] {
    const entities = this.getAllEntities();
    const entityMetrics = new Map<string, { count: number; lastMentioned?: Date }>();
    
    // Initialize metrics for all formal entities
    entities.forEach(entity => {
      entityMetrics.set(entity.name.toLowerCase(), { count: 0 });
    });
    
    // Count mentions in thoughts
    thoughts.forEach(thought => {
      thought.relatedEntities.forEach(entityName => {
        const key = entityName.toLowerCase();
        const current = entityMetrics.get(key) || { count: 0 };
        entityMetrics.set(key, {
          count: current.count + 1,
          lastMentioned: current.lastMentioned && current.lastMentioned > thought.timestamp 
            ? current.lastMentioned 
            : thought.timestamp
        });
      });
    });
    
    return entities.map(entity => ({
      ...entity,
      metrics: entityMetrics.get(entity.name.toLowerCase()) || { count: 0 }
    }));
  },

  updateEntity(entityId: string, updates: Partial<Pick<LocalEntity, 'name' | 'type' | 'description' | 'attributes'>>): LocalEntity {
    const data = dataStorageService.getData();
    const entityIndex = data.entities.findIndex(e => e.localId === entityId || e.id === entityId);
    
    if (entityIndex === -1) {
      throw new Error('Entity not found');
    }
    
    const entity = data.entities[entityIndex];
    const updatedEntity = {
      ...entity,
      ...updates,
      modifiedLocally: new Date(),
      syncStatus: 'pending' as const
    };
    
    data.entities[entityIndex] = updatedEntity;
    
    // Track modification for sync
    const syncId = entity.id || entity.localId!;
    if (!data.pendingChanges.entities.modified.includes(syncId)) {
      data.pendingChanges.entities.modified.push(syncId);
    }
    
    // Optimize pending changes in memory before saving
    data.pendingChanges.entities = dataStorageService.optimizeEntityChanges(
      data.pendingChanges.entities.added,
      data.pendingChanges.entities.modified,
      data.pendingChanges.entities.deleted
    );
    
    dataStorageService.saveData(data);
    return updatedEntity;
  },

  deleteEntity(entityId: string): void {
    const data = dataStorageService.getData();
    const entity = data.entities.find(e => e.localId === entityId || e.id === entityId);
    
    data.entities = data.entities.filter(e => e.localId !== entityId && e.id !== entityId);
    
    // Track for sync if it has server ID
    if (entity?.id) {
      data.pendingChanges.entities.deleted.push(entity.id);
    } else if (entity?.localId) {
      data.pendingChanges.entities.deleted.push(entity.localId);
    }
    
    // Optimize pending changes in memory before saving
    data.pendingChanges.entities = dataStorageService.optimizeEntityChanges(
      data.pendingChanges.entities.added,
      data.pendingChanges.entities.modified,
      data.pendingChanges.entities.deleted
    );
    
    dataStorageService.saveData(data);
  },

  // ============================================================
  // Entity Relationship Management (ID-Based, v1.3.0+)
  // ============================================================

  /**
   * Add a parent entity relationship (by name, stored as ID)
   * @param entityId - Child entity ID
   * @param parentEntityName - Parent entity name (will be converted to ID)
   */
  addParentEntity(entityId: string, parentEntityName: string): LocalEntity {
    const data = dataStorageService.getData();
    const entityIndex = data.entities.findIndex(e => e.localId === entityId || e.id === entityId);
    
    if (entityIndex === -1) {
      throw new Error('Entity not found');
    }
    
    // Ensure parent entity exists
    const parentEntity = this.ensureEntityExists(parentEntityName);
    const parentId = parentEntity.localId || parentEntity.id;
    
    if (!parentId) {
      throw new Error('Parent entity has no valid ID');
    }
    
    const entity = data.entities[entityIndex];
    
    // ID-based references (v1.3.0+) - Primary system
    const parentEntityIds = entity.parentEntityIds || [];
    if (!parentEntityIds.includes(parentId)) {
      entity.parentEntityIds = [...parentEntityIds, parentId];
    }
    
    // Legacy name-based references - Keep for backward compatibility
    const parentEntities = entity.parentEntities || [];
    if (!parentEntities.includes(parentEntity.name)) {
      entity.parentEntities = [...parentEntities, parentEntity.name];
    }
    
    entity.modifiedLocally = new Date();
    entity.syncStatus = 'pending' as const;
    
    const syncId = entity.id || entity.localId!;
    if (!data.pendingChanges.entities.modified.includes(syncId)) {
      data.pendingChanges.entities.modified.push(syncId);
    }
    
    dataStorageService.saveData(data);
    return entity;
  },

  /**
   * Remove a parent entity relationship (by name, uses ID internally)
   * @param entityId - Child entity ID
   * @param parentEntityName - Parent entity name
   */
  removeParentEntity(entityId: string, parentEntityName: string): LocalEntity {
    const data = dataStorageService.getData();
    const entityIndex = data.entities.findIndex(e => e.localId === entityId || e.id === entityId);
    
    if (entityIndex === -1) {
      throw new Error('Entity not found');
    }
    
    const entity = data.entities[entityIndex];
    
    // Get parent entity ID
    const parentId = this.getEntityIdByName(parentEntityName);
    
    // Remove from ID-based references (v1.3.0+)
    if (entity.parentEntityIds && parentId) {
      entity.parentEntityIds = entity.parentEntityIds.filter(id => id !== parentId);
    }
    
    // Remove from legacy name-based references
    if (entity.parentEntities) {
      entity.parentEntities = entity.parentEntities.filter(p => p !== parentEntityName);
    }
    
    entity.modifiedLocally = new Date();
    entity.syncStatus = 'pending' as const;
    
    const syncId = entity.id || entity.localId!;
    if (!data.pendingChanges.entities.modified.includes(syncId)) {
      data.pendingChanges.entities.modified.push(syncId);
    }
    
    dataStorageService.saveData(data);
    return entity;
  },

  /**
   * Add a linked entity relationship (by name, stored as ID)
   * @param entityId - Entity ID
   * @param linkedEntityName - Linked entity name (will be converted to ID)
   */
  addLinkedEntity(entityId: string, linkedEntityName: string): LocalEntity {
    const data = dataStorageService.getData();
    const entityIndex = data.entities.findIndex(e => e.localId === entityId || e.id === entityId);
    
    if (entityIndex === -1) {
      throw new Error('Entity not found');
    }
    
    // Ensure linked entity exists
    const linkedEntity = this.ensureEntityExists(linkedEntityName);
    const linkedId = linkedEntity.localId || linkedEntity.id;
    
    if (!linkedId) {
      throw new Error('Linked entity has no valid ID');
    }
    
    const entity = data.entities[entityIndex];
    
    // ID-based references (v1.3.0+) - Primary system
    const linkedEntityIds = entity.linkedEntityIds || [];
    if (!linkedEntityIds.includes(linkedId)) {
      entity.linkedEntityIds = [...linkedEntityIds, linkedId];
    }
    
    // Legacy name-based references - Keep for backward compatibility
    const linkedEntities = entity.linkedEntities || [];
    if (!linkedEntities.includes(linkedEntity.name)) {
      entity.linkedEntities = [...linkedEntities, linkedEntity.name];
    }
    
    entity.modifiedLocally = new Date();
    entity.syncStatus = 'pending' as const;
    
    const syncId = entity.id || entity.localId!;
    if (!data.pendingChanges.entities.modified.includes(syncId)) {
      data.pendingChanges.entities.modified.push(syncId);
    }
    
    dataStorageService.saveData(data);
    return entity;
  },

  /**
   * Remove a linked entity relationship (by name, uses ID internally)
   * @param entityId - Entity ID
   * @param linkedEntityName - Linked entity name
   */
  removeLinkedEntity(entityId: string, linkedEntityName: string): LocalEntity {
    const data = dataStorageService.getData();
    const entityIndex = data.entities.findIndex(e => e.localId === entityId || e.id === entityId);
    
    if (entityIndex === -1) {
      throw new Error('Entity not found');
    }
    
    const entity = data.entities[entityIndex];
    
    // Get linked entity ID
    const linkedId = this.getEntityIdByName(linkedEntityName);
    
    // Remove from ID-based references (v1.3.0+)
    if (entity.linkedEntityIds && linkedId) {
      entity.linkedEntityIds = entity.linkedEntityIds.filter(id => id !== linkedId);
    }
    
    // Remove from legacy name-based references
    if (entity.linkedEntities) {
      entity.linkedEntities = entity.linkedEntities.filter(l => l !== linkedEntityName);
    }
    
    entity.modifiedLocally = new Date();
    entity.syncStatus = 'pending' as const;
    
    const syncId = entity.id || entity.localId!;
    if (!data.pendingChanges.entities.modified.includes(syncId)) {
      data.pendingChanges.entities.modified.push(syncId);
    }
    
    dataStorageService.saveData(data);
    return entity;
  },

  // ============================================================
  // Entity Relationship Queries
  // ============================================================

  /**
   * Get child entities (entities that have this entity as a parent)
   * @param entityName - Parent entity name
   */
  getChildEntities(entityName: string): LocalEntity[] {
    const data = dataStorageService.getData();
    const parentId = this.getEntityIdByName(entityName);
    
    return data.entities.filter(e => {
      // Check ID-based references first (v1.3.0+)
      if (e.parentEntityIds && e.parentEntityIds.length > 0 && parentId) {
        return e.parentEntityIds.includes(parentId);
      }
      
      // Fall back to legacy name-based references
      return e.parentEntities?.some(p => p.toLowerCase() === entityName.toLowerCase());
    });
  },

  /**
   * Get linked entities (bidirectional relationships)
   * @param entityName - Entity name
   */
  getLinkedEntities(entityName: string): LocalEntity[] {
    const data = dataStorageService.getData();
    const currentEntity = data.entities.find(e => 
      e.name.toLowerCase() === entityName.toLowerCase()
    );
    
    if (!currentEntity) return [];
    
    const currentEntityId = currentEntity.localId || currentEntity.id;
    
    // Find entities using ID-based references (v1.3.0+)
    const entitiesWithIdRefs = data.entities.filter(e => {
      // Skip self
      if (e.localId === currentEntityId || e.id === currentEntityId) return false;
      
      // Check if this entity links to current entity
      if (currentEntityId && e.linkedEntityIds?.includes(currentEntityId)) {
        return true;
      }
      
      // Check if current entity links to this entity
      const targetId = e.localId || e.id;
      if (targetId && currentEntity.linkedEntityIds?.includes(targetId)) {
        return true;
      }
      
      return false;
    });
    
    // Fall back to legacy name-based references for entities not migrated yet
    const entitiesWithNameRefs = data.entities.filter(e => {
      // Skip self
      if (e.name.toLowerCase() === entityName.toLowerCase()) return false;
      
      // Already found via ID refs
      const eId = e.localId || e.id;
      if (entitiesWithIdRefs.some(idEntity => (idEntity.localId || idEntity.id) === eId)) {
        return false;
      }
      
      // Check legacy references
      return e.linkedEntities?.some(l => l.toLowerCase() === entityName.toLowerCase()) ||
             currentEntity.linkedEntities?.some(l => l.toLowerCase() === e.name.toLowerCase());
    });
    
    // Combine and deduplicate by ID
    const allLinked = [...entitiesWithIdRefs, ...entitiesWithNameRefs];
    const uniqueLinked = Array.from(
      new Map(allLinked.map(e => [e.localId || e.id, e])).values()
    );
    
    return uniqueLinked;
  }
};