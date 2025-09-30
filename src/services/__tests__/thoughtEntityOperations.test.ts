import { describe, it, expect, beforeEach, vi } from 'vitest';
import { thoughtService } from '../thoughtService';
import { entityService } from '../entityService';
import { dataStorageService } from '../dataStorageService';
import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';

// Mock the dependencies
vi.mock('../dataStorageService');
vi.mock('../campaignService', () => ({
  campaignService: {
    getCurrentCampaignId: () => 'test-campaign-id',
    getCurrentUserId: () => 'test-user-id'
  }
}));

describe('Thought & Entity Operations - ID-Based References', () => {
  let mockData: any;

  beforeEach(() => {
    mockData = {
      currentCampaignId: 'test-campaign',
      currentUserId: 'test-user',
      campaigns: [],
      entities: [
        {
          localId: 'entity-1',
          id: 'server-id-1',
          name: 'Gandalf',
          type: 'npc',
          campaign_id: 'test-campaign',
          created_by: 'test-user',
          syncStatus: 'synced',
          creationSource: 'manual',
          parentEntityIds: [],
          linkedEntityIds: [],
          parentEntities: [],
          linkedEntities: []
        },
        {
          localId: 'entity-2',
          name: 'Rivendell',
          type: 'location',
          campaign_id: 'test-campaign',
          created_by: 'test-user',
          syncStatus: 'pending',
          creationSource: 'auto',
          parentEntityIds: [],
          linkedEntityIds: [],
          parentEntities: [],
          linkedEntities: []
        }
      ] as LocalEntity[],
      thoughts: [] as LocalThought[],
      defaultEntityAttributes: [],
      pendingChanges: {
        entities: { added: [], modified: [], deleted: [] },
        thoughts: { added: [], modified: [], deleted: [] },
        campaigns: { added: [], modified: [], deleted: [] }
      },
      lastSyncTime: null,
      lastRefreshTime: null
    };

    vi.mocked(dataStorageService.getData).mockReturnValue(mockData);
    vi.mocked(dataStorageService.saveData).mockImplementation((data) => {
      mockData = data;
    });
    vi.mocked(dataStorageService.addThought).mockImplementation((thoughtData: any) => {
      const newThought: LocalThought = {
        localId: `thought-${Date.now()}`,
        ...thoughtData,
        syncStatus: 'pending' as const
      };
      mockData.thoughts.push(newThought);
      return newThought;
    });
  });

  describe('thoughtService.createThought - ID-Based References', () => {
    it('should create thought with entity IDs', () => {
      const thought = thoughtService.createThought(
        'Met Gandalf in Rivendell',
        ['Gandalf', 'Rivendell'],
        '1st day of Spring'
      );

      expect(thought).toBeDefined();
      expect(thought.content).toBe('Met Gandalf in Rivendell');
      
      // Check ID-based references (primary system)
      expect(thought.relatedEntityIds).toBeDefined();
      expect(thought.relatedEntityIds).toHaveLength(2);
      expect(thought.relatedEntityIds).toContain('entity-1'); // Gandalf's ID
      expect(thought.relatedEntityIds).toContain('entity-2'); // Rivendell's ID
      
      // Check legacy name-based references (backward compatibility)
      expect(thought.relatedEntities).toContain('Gandalf');
      expect(thought.relatedEntities).toContain('Rivendell');
    });

    it('should auto-create missing entities and use their IDs', () => {
      // Mock the ensureEntityExists to create a new entity
      const newEntityId = 'entity-new';
      vi.spyOn(entityService, 'ensureEntityExists').mockImplementation((name: string) => {
        if (name === 'Frodo') {
          const newEntity: LocalEntity = {
            localId: newEntityId,
            name: 'Frodo',
            type: 'npc',
            campaign_id: 'test-campaign',
            created_by: 'test-user',
            syncStatus: 'pending',
            creationSource: 'auto',
            parentEntityIds: [],
            linkedEntityIds: [],
            parentEntities: [],
            linkedEntities: []
          };
          mockData.entities.push(newEntity);
          return newEntity;
        }
        return mockData.entities.find((e: LocalEntity) => e.name === name)!;
      });

      const thought = thoughtService.createThought(
        'Frodo joined the party',
        ['Frodo', 'Gandalf'],
        '2nd day of Spring'
      );

      expect(thought.relatedEntityIds).toContain(newEntityId); // New entity ID
      expect(thought.relatedEntityIds).toContain('entity-1'); // Gandalf's ID
      expect(thought.relatedEntities).toContain('Frodo');
      expect(thought.relatedEntities).toContain('Gandalf');
    });

    it('should handle empty entity array', () => {
      const thought = thoughtService.createThought(
        'A thought without entities',
        [],
        undefined
      );

      expect(thought.relatedEntityIds).toBeDefined();
      expect(thought.relatedEntityIds).toHaveLength(0);
      expect(thought.relatedEntities).toHaveLength(0);
    });

    it('should trim entity names', () => {
      const thought = thoughtService.createThought(
        'Test thought',
        ['  Gandalf  ', ' Rivendell '],
        undefined
      );

      expect(thought.relatedEntities).toContain('Gandalf');
      expect(thought.relatedEntities).toContain('Rivendell');
      expect(thought.relatedEntityIds).toHaveLength(2);
    });
  });

  describe('thoughtService.updateThought - ID-Based References', () => {
    it('should update thought with new entity IDs', () => {
      // Create initial thought
      const initialThought: LocalThought = {
        localId: 'thought-1',
        content: 'Original content',
        relatedEntities: ['Gandalf'],
        relatedEntityIds: ['entity-1'],
        timestamp: new Date(),
        campaign_id: 'test-campaign',
        created_by: 'test-user',
        syncStatus: 'synced'
      };
      mockData.thoughts.push(initialThought);

      // Update thought
      const updated = thoughtService.updateThought(
        'thought-1',
        'Updated content',
        ['Gandalf', 'Rivendell'],
        '3rd day of Spring'
      );

      expect(updated).toBeDefined();
      expect(updated?.content).toBe('Updated content');
      
      // Check ID-based references updated
      expect(updated?.relatedEntityIds).toHaveLength(2);
      expect(updated?.relatedEntityIds).toContain('entity-1'); // Gandalf
      expect(updated?.relatedEntityIds).toContain('entity-2'); // Rivendell
      
      // Check legacy references updated
      expect(updated?.relatedEntities).toContain('Gandalf');
      expect(updated?.relatedEntities).toContain('Rivendell');
      
      // Check sync status
      expect(updated?.syncStatus).toBe('pending');
    });

    it('should return null for non-existent thought', () => {
      const result = thoughtService.updateThought(
        'non-existent-id',
        'Content',
        ['Gandalf'],
        undefined
      );

      expect(result).toBeNull();
    });
  });

  describe('thoughtService.getThoughtsByEntity - ID-Based Queries', () => {
    beforeEach(() => {
      // Add thoughts with ID-based references
      mockData.thoughts = [
        {
          localId: 'thought-1',
          content: 'Thought about Gandalf',
          relatedEntities: ['Gandalf'],
          relatedEntityIds: ['entity-1'],
          timestamp: new Date(),
          campaign_id: 'test-campaign',
          created_by: 'test-user',
          syncStatus: 'synced'
        },
        {
          localId: 'thought-2',
          content: 'Thought about Rivendell',
          relatedEntities: ['Rivendell'],
          relatedEntityIds: ['entity-2'],
          timestamp: new Date(),
          campaign_id: 'test-campaign',
          created_by: 'test-user',
          syncStatus: 'synced'
        },
        {
          localId: 'thought-3',
          content: 'Both Gandalf and Rivendell',
          relatedEntities: ['Gandalf', 'Rivendell'],
          relatedEntityIds: ['entity-1', 'entity-2'],
          timestamp: new Date(),
          campaign_id: 'test-campaign',
          created_by: 'test-user',
          syncStatus: 'synced'
        }
      ] as LocalThought[];
    });

    it('should find thoughts by entity name', () => {
      const thoughts = thoughtService.getThoughtsByEntity('Gandalf');
      
      expect(thoughts).toHaveLength(2);
      expect(thoughts.some(t => t.localId === 'thought-1')).toBe(true);
      expect(thoughts.some(t => t.localId === 'thought-3')).toBe(true);
    });

    it('should find thoughts by entity ID', () => {
      const thoughts = thoughtService.getThoughtsByEntity('entity-1');
      
      expect(thoughts).toHaveLength(2);
      expect(thoughts.some(t => t.localId === 'thought-1')).toBe(true);
      expect(thoughts.some(t => t.localId === 'thought-3')).toBe(true);
    });

    it('should be case-insensitive for names', () => {
      const thoughts = thoughtService.getThoughtsByEntity('gandalf');
      expect(thoughts).toHaveLength(2);
    });

    it('should return empty array for non-existent entity', () => {
      const thoughts = thoughtService.getThoughtsByEntity('Non-existent');
      expect(thoughts).toHaveLength(0);
    });
  });

  describe('Entity Relationship Operations - ID-Based', () => {
    describe('addParentEntity', () => {
      it('should add parent using ID internally', () => {
        const entity = entityService.addParentEntity('entity-2', 'Gandalf');
        
        // Check ID-based reference
        expect(entity.parentEntityIds).toBeDefined();
        expect(entity.parentEntityIds).toContain('entity-1'); // Gandalf's ID
        
        // Check legacy name-based reference
        expect(entity.parentEntities).toContain('Gandalf');
        
        // Check sync status
        expect(entity.syncStatus).toBe('pending');
      });

      it('should not add duplicate parent IDs', () => {
        entityService.addParentEntity('entity-2', 'Gandalf');
        const entity = entityService.addParentEntity('entity-2', 'Gandalf');
        
        expect(entity.parentEntityIds).toHaveLength(1);
        expect(entity.parentEntityIds).toContain('entity-1');
      });
    });

    describe('removeParentEntity', () => {
      it('should remove parent using ID internally', () => {
        // First add a parent
        entityService.addParentEntity('entity-2', 'Gandalf');
        
        // Then remove it
        const entity = entityService.removeParentEntity('entity-2', 'Gandalf');
        
        expect(entity.parentEntityIds).toBeDefined();
        expect(entity.parentEntityIds).not.toContain('entity-1');
        expect(entity.parentEntities).not.toContain('Gandalf');
      });
    });

    describe('addLinkedEntity', () => {
      it('should add linked entity using ID internally', () => {
        const entity = entityService.addLinkedEntity('entity-1', 'Rivendell');
        
        // Check ID-based reference
        expect(entity.linkedEntityIds).toBeDefined();
        expect(entity.linkedEntityIds).toContain('entity-2'); // Rivendell's ID
        
        // Check legacy name-based reference
        expect(entity.linkedEntities).toContain('Rivendell');
        
        expect(entity.syncStatus).toBe('pending');
      });

      it('should not add duplicate linked IDs', () => {
        entityService.addLinkedEntity('entity-1', 'Rivendell');
        const entity = entityService.addLinkedEntity('entity-1', 'Rivendell');
        
        expect(entity.linkedEntityIds).toHaveLength(1);
        expect(entity.linkedEntityIds).toContain('entity-2');
      });
    });

    describe('removeLinkedEntity', () => {
      it('should remove linked entity using ID internally', () => {
        // First add a link
        entityService.addLinkedEntity('entity-1', 'Rivendell');
        
        // Then remove it
        const entity = entityService.removeLinkedEntity('entity-1', 'Rivendell');
        
        expect(entity.linkedEntityIds).toBeDefined();
        expect(entity.linkedEntityIds).not.toContain('entity-2');
        expect(entity.linkedEntities).not.toContain('Rivendell');
      });
    });
  });

  describe('Entity Relationship Queries - ID-Based', () => {
    beforeEach(() => {
      // Set up parent-child relationships
      mockData.entities[1].parentEntityIds = ['entity-1']; // Rivendell's parent is Gandalf
      mockData.entities[1].parentEntities = ['Gandalf'];
    });

    describe('getChildEntities', () => {
      it('should find children using ID-based references', () => {
        const children = entityService.getChildEntities('Gandalf');
        
        expect(children).toHaveLength(1);
        expect(children[0].name).toBe('Rivendell');
      });

      it('should work with entity ID', () => {
        const children = entityService.getChildEntities('Gandalf');
        expect(children).toHaveLength(1);
      });
    });

    describe('getLinkedEntities', () => {
      beforeEach(() => {
        // Set up bidirectional links
        mockData.entities[0].linkedEntityIds = ['entity-2']; // Gandalf links to Rivendell
        mockData.entities[0].linkedEntities = ['Rivendell'];
      });

      it('should find linked entities bidirectionally', () => {
        const linked = entityService.getLinkedEntities('Gandalf');
        
        expect(linked).toHaveLength(1);
        expect(linked[0].name).toBe('Rivendell');
      });

      it('should find reverse links', () => {
        const linked = entityService.getLinkedEntities('Rivendell');
        
        expect(linked).toHaveLength(1);
        expect(linked[0].name).toBe('Gandalf');
      });
    });
  });
});
