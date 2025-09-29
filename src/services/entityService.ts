import { LocalEntity, EntityType, EntityWithMetrics } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { dataStorageService } from './dataStorageService';
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
    description?: string
  ): LocalEntity {
    console.log('🔍 [DEBUG] entityService.createEntity called', {
      name,
      type,
      description
    });

    const data = dataStorageService.getData();
    console.log('🔍 [DEBUG] Current entities count:', data.entities.length);
    
    // Check for duplicates (case-insensitive)
    const existing = data.entities.find(e => e.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      console.log('🔍 [DEBUG] Entity already exists:', existing);
      throw new Error(`Entity "${name}" already exists`);
    }
    
    const inferredType = type || inferEntityType(name);
    console.log('🔍 [DEBUG] Entity type (inferred if needed):', inferredType);

    const entity = dataStorageService.addEntity({
      name,
      type: inferredType,
      description
    });
    
    console.log('🔍 [DEBUG] Entity created successfully:', entity);
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

  updateEntity(entityId: string, updates: Partial<Pick<LocalEntity, 'name' | 'type' | 'description'>>): LocalEntity {
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
  }
};