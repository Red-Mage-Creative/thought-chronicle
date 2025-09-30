import { LocalThought } from '@/types/thoughts';
import { dataStorageService } from './dataStorageService';
import { campaignService } from './campaignService';
import { entityService } from './entityService';

export const thoughtService = {
  getAllThoughts(): LocalThought[] {
    const data = dataStorageService.getData();
    return data.thoughts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  /**
   * Create a new thought with ID-based entity references (v1.3.0+)
   * @param content - Thought content
   * @param relatedEntities - Array of entity names (will be converted to IDs)
   * @param gameDate - Optional in-game date
   */
  createThought(
    content: string,
    relatedEntities: string[],
    gameDate?: string
  ): LocalThought {
    const data = dataStorageService.getData();
    const campaignId = campaignService.getCurrentCampaignId();
    const userId = campaignService.getCurrentUserId();
    
    if (!campaignId || !userId) {
      throw new Error('No active campaign or user session found');
    }
    
    // Ensure all related entities exist (auto-create if needed)
    const validatedEntityNames: string[] = [];
    const relatedEntityIds: string[] = [];
    
    relatedEntities.forEach(entityName => {
      const entity = entityService.ensureEntityExists(entityName.trim());
      validatedEntityNames.push(entity.name); // Use canonical name
      
      // Get entity ID for ID-based reference
      const entityId = entity.localId || entity.id;
      if (entityId) {
        relatedEntityIds.push(entityId);
      }
    });
    
    const thought = dataStorageService.addThought({
      content: content.trim(),
      // ID-based references (v1.3.0+) - Primary system
      relatedEntityIds,
      // Legacy name-based references - Keep for backward compatibility
      relatedEntities: validatedEntityNames,
      timestamp: new Date(),
      gameDate,
      campaign_id: campaignId,
      created_by: userId
    });
    
    return thought;
  },

  /**
   * Update an existing thought with ID-based entity references (v1.3.0+)
   * @param thoughtId - Thought ID (localId or server id)
   * @param content - Updated content
   * @param relatedEntities - Array of entity names (will be converted to IDs)
   * @param gameDate - Optional in-game date
   */
  updateThought(
    thoughtId: string,
    content: string,
    relatedEntities: string[],
    gameDate?: string
  ): LocalThought | null {
    const data = dataStorageService.getData();
    const thoughtIndex = data.thoughts.findIndex(t => t.localId === thoughtId || t.id === thoughtId);
    
    if (thoughtIndex === -1) return null;
    
    // Ensure all related entities exist and get their IDs
    const validatedEntityNames: string[] = [];
    const relatedEntityIds: string[] = [];
    
    relatedEntities.forEach(entityName => {
      const entity = entityService.ensureEntityExists(entityName.trim());
      validatedEntityNames.push(entity.name);
      
      // Get entity ID for ID-based reference
      const entityId = entity.localId || entity.id;
      if (entityId) {
        relatedEntityIds.push(entityId);
      }
    });
    
    const updatedThought: LocalThought = {
      ...data.thoughts[thoughtIndex],
      content: content.trim(),
      // ID-based references (v1.3.0+) - Primary system
      relatedEntityIds,
      // Legacy name-based references - Keep for backward compatibility
      relatedEntities: validatedEntityNames,
      gameDate,
      modifiedLocally: new Date(),
      syncStatus: 'pending'
    };
    
    data.thoughts[thoughtIndex] = updatedThought;
    
    // Track as modified for sync
    const thoughtIdForSync = updatedThought.localId || updatedThought.id!;
    if (!data.pendingChanges.thoughts.modified.includes(thoughtIdForSync)) {
      data.pendingChanges.thoughts.modified.push(thoughtIdForSync);
    }
    
    // Optimize pending changes in memory before saving
    data.pendingChanges.thoughts = dataStorageService.optimizeEntityChanges(
      data.pendingChanges.thoughts.added,
      data.pendingChanges.thoughts.modified,
      data.pendingChanges.thoughts.deleted
    );
    
    dataStorageService.saveData(data);
    return updatedThought;
  },

  deleteThought(thoughtId: string): void {
    const data = dataStorageService.getData();
    const thoughtIndex = data.thoughts.findIndex(t => t.localId === thoughtId || t.id === thoughtId);
    
    if (thoughtIndex !== -1) {
      const thought = data.thoughts[thoughtIndex];
      data.thoughts.splice(thoughtIndex, 1);
      
      // Track for sync if it has server ID
      if (thought.id) {
        data.pendingChanges.thoughts.deleted.push(thought.id);
      } else if (thought.localId) {
        data.pendingChanges.thoughts.deleted.push(thought.localId);
      }
      
      // Optimize pending changes in memory before saving
      data.pendingChanges.thoughts = dataStorageService.optimizeEntityChanges(
        data.pendingChanges.thoughts.added,
        data.pendingChanges.thoughts.modified,
        data.pendingChanges.thoughts.deleted
      );
      
      dataStorageService.saveData(data);
    }
  },

  /**
   * Get all thoughts related to a specific entity (by name or ID)
   * @param entityNameOrId - Entity name or ID
   */
  getThoughtsByEntity(entityNameOrId: string): LocalThought[] {
    const thoughts = this.getAllThoughts();
    
    // Try to get entity ID if a name was provided
    const entityId = entityService.getEntityIdByName(entityNameOrId) || entityNameOrId;
    
    return thoughts.filter(thought => {
      // Check ID-based references first (v1.3.0+)
      if (thought.relatedEntityIds && thought.relatedEntityIds.length > 0) {
        return thought.relatedEntityIds.includes(entityId);
      }
      
      // Fall back to legacy name-based references
      return thought.relatedEntities.some(entity => 
        entity.toLowerCase() === entityNameOrId.toLowerCase()
      );
    });
  }
};