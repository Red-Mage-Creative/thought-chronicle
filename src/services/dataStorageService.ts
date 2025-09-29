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
      console.error('Error loading from localStorage:', error);
      return getDefaultStore();
    }
  },

  saveData(data: LocalDataStore): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};