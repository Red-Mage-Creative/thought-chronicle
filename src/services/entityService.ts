import { LocalEntity, EntityType, EntityWithMetrics } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { dataStorageService } from './dataStorageService';
import { campaignService } from './campaignService';
import { inferEntityType } from '@/utils/entityUtils';

export const entityService = {
  getAllEntities(): LocalEntity[] {
    const data = dataStorageService.getData();
    return data.entities;
  },

  getEntityByName(name: string): LocalEntity | undefined {
    const entities = this.getAllEntities();
    return entities.find(entity => entity.name.toLowerCase() === name.toLowerCase());
  },

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

  addParentEntity(entityId: string, parentEntityName: string): LocalEntity {
    const data = dataStorageService.getData();
    const entityIndex = data.entities.findIndex(e => e.localId === entityId || e.id === entityId);
    
    if (entityIndex === -1) {
      throw new Error('Entity not found');
    }
    
    const entity = data.entities[entityIndex];
    const parentEntities = entity.parentEntities || [];
    
    if (!parentEntities.includes(parentEntityName)) {
      entity.parentEntities = [...parentEntities, parentEntityName];
      entity.modifiedLocally = new Date();
      entity.syncStatus = 'pending' as const;
      
      const syncId = entity.id || entity.localId!;
      if (!data.pendingChanges.entities.modified.includes(syncId)) {
        data.pendingChanges.entities.modified.push(syncId);
      }
      
      dataStorageService.saveData(data);
    }
    
    return entity;
  },

  removeParentEntity(entityId: string, parentEntityName: string): LocalEntity {
    const data = dataStorageService.getData();
    const entityIndex = data.entities.findIndex(e => e.localId === entityId || e.id === entityId);
    
    if (entityIndex === -1) {
      throw new Error('Entity not found');
    }
    
    const entity = data.entities[entityIndex];
    if (entity.parentEntities) {
      entity.parentEntities = entity.parentEntities.filter(p => p !== parentEntityName);
      entity.modifiedLocally = new Date();
      entity.syncStatus = 'pending' as const;
      
      const syncId = entity.id || entity.localId!;
      if (!data.pendingChanges.entities.modified.includes(syncId)) {
        data.pendingChanges.entities.modified.push(syncId);
      }
      
      dataStorageService.saveData(data);
    }
    
    return entity;
  },

  addLinkedEntity(entityId: string, linkedEntityName: string): LocalEntity {
    const data = dataStorageService.getData();
    const entityIndex = data.entities.findIndex(e => e.localId === entityId || e.id === entityId);
    
    if (entityIndex === -1) {
      throw new Error('Entity not found');
    }
    
    const entity = data.entities[entityIndex];
    const linkedEntities = entity.linkedEntities || [];
    
    if (!linkedEntities.includes(linkedEntityName)) {
      entity.linkedEntities = [...linkedEntities, linkedEntityName];
      entity.modifiedLocally = new Date();
      entity.syncStatus = 'pending' as const;
      
      const syncId = entity.id || entity.localId!;
      if (!data.pendingChanges.entities.modified.includes(syncId)) {
        data.pendingChanges.entities.modified.push(syncId);
      }
      
      dataStorageService.saveData(data);
    }
    
    return entity;
  },

  removeLinkedEntity(entityId: string, linkedEntityName: string): LocalEntity {
    const data = dataStorageService.getData();
    const entityIndex = data.entities.findIndex(e => e.localId === entityId || e.id === entityId);
    
    if (entityIndex === -1) {
      throw new Error('Entity not found');
    }
    
    const entity = data.entities[entityIndex];
    if (entity.linkedEntities) {
      entity.linkedEntities = entity.linkedEntities.filter(l => l !== linkedEntityName);
      entity.modifiedLocally = new Date();
      entity.syncStatus = 'pending' as const;
      
      const syncId = entity.id || entity.localId!;
      if (!data.pendingChanges.entities.modified.includes(syncId)) {
        data.pendingChanges.entities.modified.push(syncId);
      }
      
      dataStorageService.saveData(data);
    }
    
    return entity;
  },

  getChildEntities(entityName: string): LocalEntity[] {
    const data = dataStorageService.getData();
    return data.entities.filter(e => 
      e.parentEntities?.some(p => p.toLowerCase() === entityName.toLowerCase())
    );
  },

  getLinkedEntities(entityName: string): LocalEntity[] {
    const data = dataStorageService.getData();
    const currentEntity = data.entities.find(e => 
      e.name.toLowerCase() === entityName.toLowerCase()
    );
    
    if (!currentEntity) return [];
    
    // Find entities that link TO this entity
    const entitiesThatLinkToThis = data.entities.filter(e => 
      e.linkedEntities?.some(l => l.toLowerCase() === entityName.toLowerCase())
    );
    
    // Find entities that THIS entity links to
    const entitiesLinkedByThis = currentEntity.linkedEntities
      ? data.entities.filter(e => 
          currentEntity.linkedEntities!.some(l => l.toLowerCase() === e.name.toLowerCase())
        )
      : [];
    
    // Combine and deduplicate by localId or id
    const allLinked = [...entitiesThatLinkToThis, ...entitiesLinkedByThis];
    const uniqueLinked = Array.from(
      new Map(allLinked.map(e => [e.localId || e.id, e])).values()
    );
    
    return uniqueLinked;
  }
};