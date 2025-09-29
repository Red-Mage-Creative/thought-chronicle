import { BuildshipThought, BuildshipEntity } from './buildshipApi';

export interface LocalThought extends BuildshipThought {
  localId?: string;
  modifiedLocally?: Date;
  syncStatus: 'pending' | 'synced' | 'conflict';
}

export interface LocalEntity extends BuildshipEntity {
  localId?: string;
  modifiedLocally?: Date;
  syncStatus: 'pending' | 'synced' | 'conflict';
  id?: string;
}

export interface PendingChanges {
  thoughts: {
    added: LocalThought[];
    modified: LocalThought[];
    deleted: string[];
  };
  entities: {
    added: LocalEntity[];
    modified: LocalEntity[];
    deleted: string[];
  };
}

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

export const localStorageService = {
  // Get all data from localStorage
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

  // Save all data to localStorage
  saveData(data: LocalDataStore): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      // Error saving to localStorage
    }
  },

  // Add a new thought locally
  addThought(thought: Omit<LocalThought, 'localId' | 'syncStatus'>): LocalThought {
    const data = this.getData();
    const localThought: LocalThought = {
      ...thought,
      localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      syncStatus: 'pending',
      modifiedLocally: new Date()
    };
    
    data.thoughts.unshift(localThought);
    data.pendingChanges.thoughts.added.push(localThought);
    this.saveData(data);
    this.optimizePendingChanges();
    return localThought;
  },

  // Add a new entity locally
  addEntity(entity: Omit<LocalEntity, 'localId' | 'syncStatus'>): LocalEntity {
    const data = this.getData();
    const localEntity: LocalEntity = {
      ...entity,
      localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      syncStatus: 'pending',
      modifiedLocally: new Date()
    };
    
    data.entities.push(localEntity);
    data.pendingChanges.entities.added.push(localEntity);
    this.saveData(data);
    this.optimizePendingChanges();
    return localEntity;
  },

  // Update server data (from API refresh)
  updateServerData(thoughts: BuildshipThought[], entities: BuildshipEntity[]): void {
    const data = this.getData();
    
    // Convert to local format, preserving existing local changes
    const serverThoughts: LocalThought[] = thoughts.map(thought => ({
      ...thought,
      syncStatus: 'synced' as const
    }));
    
    const serverEntities: LocalEntity[] = entities.map(entity => ({
      ...entity,
      syncStatus: 'synced' as const
    }));
    
    // Merge with local pending changes
    const allThoughts = [
      ...data.pendingChanges.thoughts.added,
      ...serverThoughts.filter(st => !data.pendingChanges.thoughts.deleted.includes(st.id))
    ];
    
    data.thoughts = allThoughts;
    data.entities = serverEntities;
    data.lastRefreshTime = new Date();
    this.saveData(data);
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
  optimizeEntityChanges<T extends { id?: string; localId?: string }>(
    added: T[],
    modified: T[],
    deleted: string[]
  ): { added: T[]; modified: T[]; deleted: string[] } {
    const finalAdded: T[] = [];
    const finalModified: T[] = [];
    const finalDeleted: string[] = [];

    // Track which items we've processed
    const processedIds = new Set<string>();

    // Process added items
    for (const item of added) {
      const itemId = item.id || item.localId;
      if (!itemId) continue;

      // Check if this added item was later deleted
      const wasDeleted = deleted.includes(itemId);
      if (wasDeleted) {
        // Add then delete = net zero, skip both
        processedIds.add(itemId);
        continue;
      }

      // Check if this added item was later modified
      const modifiedIndex = modified.findIndex(m => (m.id || m.localId) === itemId);
      if (modifiedIndex >= 0) {
        // Add then modify = keep only the final added state with modifications
        const modifiedItem = modified[modifiedIndex];
        finalAdded.push(modifiedItem);
        processedIds.add(itemId);
        continue;
      }

      // No changes after add, keep the add
      finalAdded.push(item);
      processedIds.add(itemId);
    }

    // Process modified items (that weren't already handled above)
    for (const item of modified) {
      const itemId = item.id || item.localId;
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
      finalModified.push(item);
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

  // Get total pending changes count (optimized)
  getPendingChangesCount(): number {
    this.optimizePendingChanges();
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
  }
};