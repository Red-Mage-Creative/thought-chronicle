import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { PendingChanges } from '@/types/sync';
import { generateLocalId } from '@/utils/entityUtils';

export interface LocalDataStore {
  thoughts: LocalThought[];
  entities: LocalEntity[];
  pendingChanges: PendingChanges;
  lastSyncTime: Date | null;
  lastRefreshTime: Date | null;
}

const STORAGE_KEY = 'dnd_chronicle_data';

const getDefaultStore = (): LocalDataStore => ({
  thoughts: [],
  entities: [],
  pendingChanges: {
    thoughts: { added: [], modified: [], deleted: [] },
    entities: { added: [], modified: [], deleted: [] }
  },
  lastSyncTime: null,
  lastRefreshTime: null
});

export const dataStorageService = {
  getData(): LocalDataStore {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return getDefaultStore();
      
      const parsed = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      if (parsed.lastSyncTime) parsed.lastSyncTime = new Date(parsed.lastSyncTime);
      if (parsed.lastRefreshTime) parsed.lastRefreshTime = new Date(parsed.lastRefreshTime);
      
      parsed.thoughts?.forEach((thought: LocalThought) => {
        thought.timestamp = new Date(thought.timestamp);
        if (thought.modifiedLocally) thought.modifiedLocally = new Date(thought.modifiedLocally);
        
        // Data migration: ensure relatedEntities exists
        if (!thought.relatedEntities) {
          thought.relatedEntities = (thought as any).entities || [];
        }
      });
      
      return { ...getDefaultStore(), ...parsed };
    } catch (error) {
      // Error loading from localStorage - return default store
      return getDefaultStore();
    }
  },

  saveData(data: LocalDataStore): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Dispatch custom event for immediate UI refresh
      window.dispatchEvent(new CustomEvent('storageUpdated'));
    } catch (error) {
      // Error saving to localStorage - could implement retry logic
    }
  },

  // Add a new thought locally
  addThought(thought: Omit<LocalThought, 'localId' | 'syncStatus'>): LocalThought {
    const data = this.getData();
    const localThought: LocalThought = {
      ...thought,
      localId: generateLocalId(),
      syncStatus: 'pending',
      modifiedLocally: new Date()
    };
    
    data.thoughts.unshift(localThought);
    data.pendingChanges.thoughts.added.push(localThought.localId!);
    
    // Optimize pending changes in memory before saving
    data.pendingChanges.thoughts = this.optimizeEntityChanges(
      data.pendingChanges.thoughts.added,
      data.pendingChanges.thoughts.modified,
      data.pendingChanges.thoughts.deleted
    );
    
    this.saveData(data);
    return localThought;
  },

  // Add a new entity locally
  addEntity(entity: Omit<LocalEntity, 'localId' | 'syncStatus'>): LocalEntity {
    const data = this.getData();
    const localEntity: LocalEntity = {
      ...entity,
      localId: generateLocalId(),
      syncStatus: 'pending',
      modifiedLocally: new Date()
    };
    
    data.entities.push(localEntity);
    data.pendingChanges.entities.added.push(localEntity.localId!);
    
    // Optimize pending changes in memory before saving
    data.pendingChanges.entities = this.optimizeEntityChanges(
      data.pendingChanges.entities.added,
      data.pendingChanges.entities.modified,
      data.pendingChanges.entities.deleted
    );
    
    this.saveData(data);
    return localEntity;
  },

  // Optimize pending changes by eliminating redundant operations
  optimizePendingChanges(): void {
    const data = this.getData();
    
    // Optimize thoughts
    const optimizedThoughts = this.optimizeEntityChanges(
      data.pendingChanges.thoughts.added,
      data.pendingChanges.thoughts.modified,
      data.pendingChanges.thoughts.deleted
    );
    
    // Optimize entities
    const optimizedEntities = this.optimizeEntityChanges(
      data.pendingChanges.entities.added,
      data.pendingChanges.entities.modified,
      data.pendingChanges.entities.deleted
    );
    
    data.pendingChanges.thoughts = optimizedThoughts;
    data.pendingChanges.entities = optimizedEntities;
    this.saveData(data);
  },

  // Helper method to optimize changes for a specific entity type
  optimizeEntityChanges(
    added: string[],
    modified: string[],
    deleted: string[]
  ): { added: string[]; modified: string[]; deleted: string[] } {
    const finalAdded: string[] = [];
    const finalModified: string[] = [];
    const finalDeleted: string[] = [];

    // Track which items we've processed
    const processedIds = new Set<string>();

    // Process added items
    for (const itemId of added) {
      if (!itemId) continue;

      // Check if this added item was later deleted
      const wasDeleted = deleted.includes(itemId);
      if (wasDeleted) {
        // Add then delete = net zero, skip both
        processedIds.add(itemId);
        continue;
      }

      // Check if this added item was later modified
      const wasModified = modified.includes(itemId);
      if (wasModified) {
        // Add then modify = keep only the final added state
        finalAdded.push(itemId);
        processedIds.add(itemId);
        continue;
      }

      // No changes after add, keep the add
      finalAdded.push(itemId);
      processedIds.add(itemId);
    }

    // Process modified items (that weren't already handled above)
    for (const itemId of modified) {
      if (!itemId || processedIds.has(itemId)) continue;

      // Check if this modified item was later deleted
      const wasDeleted = deleted.includes(itemId);
      if (wasDeleted) {
        // Modify then delete = keep only delete
        finalDeleted.push(itemId);
        processedIds.add(itemId);
        continue;
      }

      // Keep the modification
      finalModified.push(itemId);
      processedIds.add(itemId);
    }

    // Process deleted items (that weren't already handled above)
    for (const itemId of deleted) {
      if (processedIds.has(itemId)) continue;
      finalDeleted.push(itemId);
    }

    return {
      added: finalAdded,
      modified: finalModified,
      deleted: finalDeleted
    };
  },

  // Clear pending changes after successful sync
  clearPendingChanges(): void {
    const data = this.getData();
    data.pendingChanges = {
      thoughts: { added: [], modified: [], deleted: [] },
      entities: { added: [], modified: [], deleted: [] }
    };
    data.lastSyncTime = new Date();
    this.saveData(data);
  },

  // Get total pending changes count (read-only)
  getPendingChangesCount(): number {
    const data = this.getData();
    const { thoughts, entities } = data.pendingChanges;
    return thoughts.added.length + thoughts.modified.length + thoughts.deleted.length +
           entities.added.length + entities.modified.length + entities.deleted.length;
  },

  // Check if data needs refresh (older than 24 hours)
  needsRefresh(): boolean {
    const data = this.getData();
    if (!data.lastRefreshTime) return true;
    
    const dayAgo = new Date();
    dayAgo.setHours(dayAgo.getHours() - 24);
    return data.lastRefreshTime < dayAgo;
  },

  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Error clearing localStorage
    }
  }
};