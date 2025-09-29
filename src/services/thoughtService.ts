import { LocalThought } from '@/types/thoughts';
import { dataStorageService } from './dataStorageService';
import { entityService } from './entityService';
import { generateLocalId } from '@/utils/entityUtils';

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
    
    // Ensure all related entities exist (auto-create if needed)
    const validatedEntities = relatedEntities.map(entityName => {
      const entity = entityService.ensureEntityExists(entityName.trim());
      return entity.name; // Use the canonical name from the entity
    });
    
    const thought: LocalThought = {
      localId: generateLocalId(),
      content: content.trim(),
      relatedEntities: validatedEntities,
      timestamp: new Date(),
      gameDate,
      syncStatus: 'pending',
      modifiedLocally: new Date()
    };
    
    data.thoughts.unshift(thought);
    data.pendingChanges.thoughts.added.push(thought.localId!);
    dataStorageService.saveData(data);
    
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
      }
      
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