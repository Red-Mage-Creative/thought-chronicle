import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { PendingChanges } from '@/types/sync';

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
    } catch (error) {
      // Error saving to localStorage - could implement retry logic
    }
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

  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Error clearing localStorage
    }
  }
};