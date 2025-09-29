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

  // Get total pending changes count
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
  }
};