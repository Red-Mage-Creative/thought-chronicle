import { LocalThought } from '@/types/thoughts';
import { dataStorageService } from './dataStorageService';
import { campaignService } from './campaignService';
import { entityService } from './entityService';

export const thoughtService = {
  getAllThoughts(): LocalThought[] {
    const data = dataStorageService.getData();
    return data.thoughts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

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
    const validatedEntities = relatedEntities.map(entityName => {
      const entity = entityService.ensureEntityExists(entityName.trim());
      return entity.name; // Use the canonical name from the entity
    });
    
    const thought = dataStorageService.addThought({
      content: content.trim(),
      relatedEntities: validatedEntities,
      timestamp: new Date(),
      gameDate,
      campaign_id: campaignId,
      created_by: userId
    });
    
    return thought;
  },

  updateThought(
    thoughtId: string,
    content: string,
    relatedEntities: string[],
    gameDate?: string
  ): LocalThought | null {
    const data = dataStorageService.getData();
    const thoughtIndex = data.thoughts.findIndex(t => t.localId === thoughtId || t.id === thoughtId);
    
    if (thoughtIndex === -1) return null;
    
    // Ensure all related entities exist
    const validatedEntities = relatedEntities.map(entityName => {
      const entity = entityService.ensureEntityExists(entityName.trim());
      return entity.name;
    });
    
    const updatedThought: LocalThought = {
      ...data.thoughts[thoughtIndex],
      content: content.trim(),
      relatedEntities: validatedEntities,
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

  getThoughtsByEntity(entityName: string): LocalThought[] {
    const thoughts = this.getAllThoughts();
    return thoughts.filter(thought => 
      thought.relatedEntities.some(entity => 
        entity.toLowerCase() === entityName.toLowerCase()
      )
    );
  }
};