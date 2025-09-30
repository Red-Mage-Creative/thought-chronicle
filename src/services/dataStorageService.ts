import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { LocalCampaign } from '@/types/campaigns';
import { PendingChanges } from '@/types/sync';
import { generateLocalId, isValidEntityType } from '@/utils/entityUtils';
import { encryptionService } from '@/utils/encryption';

export interface LocalDataStore {
  // Campaign context
  currentCampaignId: string | null;
  currentUserId: string | null;
  
  // Campaign data (cached locally)
  campaigns: LocalCampaign[];
  
  // Campaign-scoped data
  thoughts: LocalThought[];
  entities: LocalEntity[];
  defaultEntityAttributes: any[];  // DefaultEntityAttribute[]
  pendingChanges: PendingChanges;
  lastSyncTime: Date | null;
  lastRefreshTime: Date | null;
}

const STORAGE_KEY = 'dnd_chronicle_data';

const getDefaultStore = (): LocalDataStore => ({
  currentCampaignId: null,
  currentUserId: null,
  campaigns: [],
  thoughts: [],
  entities: [],
  defaultEntityAttributes: [],
  pendingChanges: {
    campaigns: { added: [], modified: [], deleted: [] },
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
      
      // For now, parse normally - will add encryption asynchronously later
      const parsed = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      if (parsed.lastSyncTime) parsed.lastSyncTime = new Date(parsed.lastSyncTime);
      if (parsed.lastRefreshTime) parsed.lastRefreshTime = new Date(parsed.lastRefreshTime);
      
      parsed.campaigns?.forEach((campaign: LocalCampaign) => {
        campaign.created_at = new Date(campaign.created_at);
        campaign.updated_at = new Date(campaign.updated_at);
        if (campaign.modifiedLocally) campaign.modifiedLocally = new Date(campaign.modifiedLocally);
        
        // Parse member dates
        campaign.members?.forEach(member => {
          member.joined_at = new Date(member.joined_at);
        });
      });

      parsed.thoughts?.forEach((thought: LocalThought) => {
        thought.timestamp = new Date(thought.timestamp);
        if (thought.modifiedLocally) thought.modifiedLocally = new Date(thought.modifiedLocally);
        
        // Data migration: ensure required fields exist
        if (!thought.relatedEntities) {
          thought.relatedEntities = [];
        }
        if (!thought.campaign_id && parsed.currentCampaignId) {
          thought.campaign_id = parsed.currentCampaignId;
        }
        if (!thought.created_by && parsed.currentUserId) {
          thought.created_by = parsed.currentUserId;
        }
      });
      
      parsed.entities?.forEach((entity: LocalEntity) => {
        if (entity.modifiedLocally) entity.modifiedLocally = new Date(entity.modifiedLocally);
        if (entity.createdLocally) entity.createdLocally = new Date(entity.createdLocally);
        
        // Data migration: normalize invalid entity types to uncategorized
        if (!isValidEntityType(entity.type)) {
          entity.type = 'uncategorized';
        }
        
        // Data migration: ensure required fields exist
        if (!entity.campaign_id && parsed.currentCampaignId) {
          entity.campaign_id = parsed.currentCampaignId;
        }
        if (!entity.created_by && parsed.currentUserId) {
          entity.created_by = parsed.currentUserId;
        }
      });
      
      // Properly merge pendingChanges to ensure all fields exist
      const defaultStore = getDefaultStore();
      const mergedPendingChanges = {
        campaigns: {
          added: parsed.pendingChanges?.campaigns?.added || [],
          modified: parsed.pendingChanges?.campaigns?.modified || [],
          deleted: parsed.pendingChanges?.campaigns?.deleted || []
        },
        thoughts: {
          added: parsed.pendingChanges?.thoughts?.added || [],
          modified: parsed.pendingChanges?.thoughts?.modified || [],
          deleted: parsed.pendingChanges?.thoughts?.deleted || []
        },
        entities: {
          added: parsed.pendingChanges?.entities?.added || [],
          modified: parsed.pendingChanges?.entities?.modified || [],
          deleted: parsed.pendingChanges?.entities?.deleted || []
        }
      };
      
      return {
        ...defaultStore,
        ...parsed,
        pendingChanges: mergedPendingChanges
      };
    } catch (error) {
      // Error loading from localStorage - return default store
      return getDefaultStore();
    }
  },

  saveData(data: LocalDataStore): void {
    try {
      // For now, save as JSON - will add encryption later
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Dispatch custom event for immediate UI refresh
      window.dispatchEvent(new CustomEvent('storageUpdated'));
    } catch (error) {
      // Error saving to localStorage - could implement retry logic
    }
  },

  // Set current campaign and user context
  setCurrentContext(campaignId: string | null, userId: string | null): void {
    const data = this.getData();
    data.currentCampaignId = campaignId;
    data.currentUserId = userId;
    this.saveData(data);
  },

  // Get current campaign context
  getCurrentContext(): { campaignId: string | null; userId: string | null } {
    const data = this.getData();
    return {
      campaignId: data.currentCampaignId,
      userId: data.currentUserId
    };
  },

  // Add a new campaign locally
  addCampaign(campaign: Omit<LocalCampaign, 'localId' | 'syncStatus'>): LocalCampaign {
    const data = this.getData();
    const localCampaign: LocalCampaign = {
      ...campaign,
      localId: generateLocalId(),
      syncStatus: 'pending',
      modifiedLocally: new Date()
    };
    
    data.campaigns.push(localCampaign);
    data.pendingChanges.campaigns.added.push(localCampaign.localId!);
    
    this.saveData(data);
    return localCampaign;
  },

  // Add a new thought locally (campaign-scoped)
  addThought(thought: Omit<LocalThought, 'localId' | 'syncStatus'>): LocalThought {
    const data = this.getData();
    
    // Ensure campaign and user context
    if (!thought.campaign_id || !thought.created_by) {
      throw new Error('Campaign ID and User ID are required for thoughts');
    }
    
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

  // Add a new entity locally (campaign-scoped)
  addEntity(entity: Omit<LocalEntity, 'localId' | 'syncStatus' | 'createdLocally'>): LocalEntity {
    const data = this.getData();

    // Ensure campaign and user context
    if (!entity.campaign_id || !entity.created_by) {
      throw new Error('Campaign ID and User ID are required for entities');
    }

    const localEntity: LocalEntity = {
      ...entity,
      localId: generateLocalId(),
      syncStatus: 'pending',
      modifiedLocally: new Date(),
      createdLocally: new Date()
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

  // Get campaign-scoped data
  getCampaignData(campaignId: string): { thoughts: LocalThought[]; entities: LocalEntity[] } {
    const data = this.getData();
    
    const campaignThoughts = data.thoughts.filter(t => t.campaign_id === campaignId);
    const campaignEntities = data.entities.filter(e => e.campaign_id === campaignId);
    
    return { thoughts: campaignThoughts, entities: campaignEntities };
  },

  // Optimize pending changes by eliminating redundant operations
  optimizePendingChanges(): void {
    const data = this.getData();
    
    // Optimize campaigns
    const optimizedCampaigns = this.optimizeEntityChanges(
      data.pendingChanges.campaigns.added,
      data.pendingChanges.campaigns.modified,
      data.pendingChanges.campaigns.deleted
    );
    
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
    
    data.pendingChanges.campaigns = optimizedCampaigns;
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
      campaigns: { added: [], modified: [], deleted: [] },
      thoughts: { added: [], modified: [], deleted: [] },
      entities: { added: [], modified: [], deleted: [] }
    };
    data.lastSyncTime = new Date();
    this.saveData(data);
  },

  // Get total pending changes count (read-only)
  getPendingChangesCount(): number {
    const data = this.getData();
    const { campaigns, thoughts, entities } = data.pendingChanges;
    return campaigns.added.length + campaigns.modified.length + campaigns.deleted.length +
           thoughts.added.length + thoughts.modified.length + thoughts.deleted.length +
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
  },

  // Get default entity attributes
  getDefaultEntityAttributes(): any[] {
    const data = this.getData();
    return data.defaultEntityAttributes || [];
  },

  // Save default entity attributes
  saveDefaultEntityAttributes(attributes: any[]): void {
    const data = this.getData();
    data.defaultEntityAttributes = attributes;
    this.saveData(data);
  },

  // Get default attributes for a specific entity type
  getDefaultAttributesForEntityType(entityType: string): any[] {
    const allDefaults = this.getDefaultEntityAttributes();
    return allDefaults.filter(attr => attr.entityTypes.includes(entityType));
  }
};