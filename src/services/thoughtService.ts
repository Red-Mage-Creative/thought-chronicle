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

  deleteThought(thoughtId: string): void {
    const data = dataStorageService.getData();
    data.thoughts = data.thoughts.filter(t => t.localId !== thoughtId && t.id !== thoughtId);
    dataStorageService.saveData(data);
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