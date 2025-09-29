import { LocalEntity, EntityType, EntityWithMetrics } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { dataStorageService } from './dataStorageService';
import { inferEntityType, generateLocalId } from '@/utils/entityUtils';

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
    const data = dataStorageService.getData();
    
    // Check for duplicates (case-insensitive)
    const existing = data.entities.find(e => e.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      throw new Error(`Entity "${name}" already exists`);
    }
    
    const entity: LocalEntity = {
      localId: generateLocalId(),
      name,
      type: type || inferEntityType(name),
      description,
      syncStatus: 'pending',
      modifiedLocally: new Date()
    };
    
    data.entities.push(entity);
    data.pendingChanges.entities.added.push(entity.localId!);
    dataStorageService.saveData(data);
    
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

  deleteEntity(entityId: string): void {
    const data = dataStorageService.getData();
    data.entities = data.entities.filter(e => e.localId !== entityId && e.id !== entityId);
    dataStorageService.saveData(data);
  }
};