import { describe, it, expect, beforeEach, vi } from 'vitest';
import { schemaValidationService } from '../schemaValidationService';
import { entityService } from '../entityService';
import { dataStorageService } from '../dataStorageService';
import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';

// Mock dependencies
vi.mock('../dataStorageService');
vi.mock('../campaignService', () => ({
  campaignService: {
    getCurrentCampaignId: () => 'test-campaign',
    getCurrentUserId: () => 'test-user'
  }
}));

describe('ID-Based Validation & Cascade Deletion', () => {
  let mockData: any;

  beforeEach(() => {
    mockData = {
      currentCampaignId: 'test-campaign',
      currentUserId: 'test-user',
      campaigns: [],
      entities: [
        {
          localId: 'entity-1',
          name: 'Gandalf',
          type: 'npc',
          campaign_id: 'test-campaign',
          created_by: 'test-user',
          syncStatus: 'synced',
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
          syncStatus: 'synced',
          parentEntityIds: [],
          linkedEntityIds: ['entity-1'], // Links to Gandalf
          parentEntities: [],
          linkedEntities: ['Gandalf']
        },
        {
          localId: 'entity-3',
          name: 'Frodo',
          type: 'npc',
          campaign_id: 'test-campaign',
          created_by: 'test-user',
          syncStatus: 'synced',
          parentEntityIds: ['entity-1'], // Gandalf is parent
          linkedEntityIds: [],
          parentEntities: ['Gandalf'],
          linkedEntities: []
        }
      ] as LocalEntity[],
      thoughts: [
        {
          localId: 'thought-1',
          content: 'Met Gandalf in Rivendell',
          relatedEntities: ['Gandalf', 'Rivendell'],
          relatedEntityIds: ['entity-1', 'entity-2'],
          timestamp: new Date(),
          campaign_id: 'test-campaign',
          created_by: 'test-user',
          syncStatus: 'synced'
        },
        {
          localId: 'thought-2',
          content: 'Frodo started his journey',
          relatedEntities: ['Frodo'],
          relatedEntityIds: ['entity-3'],
          timestamp: new Date(),
          campaign_id: 'test-campaign',
          created_by: 'test-user',
          syncStatus: 'synced'
        }
      ] as LocalThought[],
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
    vi.mocked(dataStorageService.optimizeEntityChanges).mockImplementation((added, modified, deleted) => ({
      added,
      modified,
      deleted
    }));
  });

  describe('validateEntityIdReferences', () => {
    it('should detect no invalid references in valid data', () => {
      const result = schemaValidationService.validateEntityIdReferences(
        mockData.thoughts,
        mockData.entities
      );

      expect(result.totalInvalidReferences).toBe(0);
      expect(result.invalidThoughtReferences).toHaveLength(0);
      expect(result.invalidParentReferences).toHaveLength(0);
      expect(result.invalidLinkedReferences).toHaveLength(0);
      expect(result.recommendation).toBe('All entity ID references are valid.');
    });

    it('should detect invalid thought entity references', () => {
      // Add thought with invalid entity ID
      mockData.thoughts.push({
        localId: 'thought-3',
        content: 'Invalid reference',
        relatedEntities: ['Unknown'],
        relatedEntityIds: ['invalid-id-999'],
        timestamp: new Date(),
        campaign_id: 'test-campaign',
        created_by: 'test-user',
        syncStatus: 'pending'
      });

      const result = schemaValidationService.validateEntityIdReferences(
        mockData.thoughts,
        mockData.entities
      );

      expect(result.totalInvalidReferences).toBe(1);
      expect(result.invalidThoughtReferences).toHaveLength(1);
      expect(result.invalidThoughtReferences[0].invalidEntityIds).toContain('invalid-id-999');
      expect(result.recommendation).toContain('Found 1 invalid entity ID reference');
    });

    it('should detect invalid parent entity references', () => {
      // Add entity with invalid parent ID
      mockData.entities.push({
        localId: 'entity-4',
        name: 'Orphaned Child',
        type: 'npc',
        campaign_id: 'test-campaign',
        created_by: 'test-user',
        syncStatus: 'pending',
        parentEntityIds: ['invalid-parent-id'],
        linkedEntityIds: [],
        parentEntities: [],
        linkedEntities: []
      });

      const result = schemaValidationService.validateEntityIdReferences(
        mockData.thoughts,
        mockData.entities
      );

      expect(result.totalInvalidReferences).toBe(1);
      expect(result.invalidParentReferences).toHaveLength(1);
      expect(result.invalidParentReferences[0].invalidParentIds).toContain('invalid-parent-id');
    });

    it('should detect invalid linked entity references', () => {
      // Add entity with invalid linked ID
      mockData.entities.push({
        localId: 'entity-5',
        name: 'Orphaned Link',
        type: 'location',
        campaign_id: 'test-campaign',
        created_by: 'test-user',
        syncStatus: 'pending',
        parentEntityIds: [],
        linkedEntityIds: ['invalid-link-id'],
        parentEntities: [],
        linkedEntities: []
      });

      const result = schemaValidationService.validateEntityIdReferences(
        mockData.thoughts,
        mockData.entities
      );

      expect(result.totalInvalidReferences).toBe(1);
      expect(result.invalidLinkedReferences).toHaveLength(1);
      expect(result.invalidLinkedReferences[0].invalidLinkedIds).toContain('invalid-link-id');
    });

    it('should detect multiple invalid references', () => {
      // Add multiple invalid references
      mockData.thoughts.push({
        localId: 'thought-4',
        content: 'Multiple invalid',
        relatedEntities: [],
        relatedEntityIds: ['bad-1', 'bad-2'],
        timestamp: new Date(),
        campaign_id: 'test-campaign',
        created_by: 'test-user',
        syncStatus: 'pending'
      });

      const result = schemaValidationService.validateEntityIdReferences(
        mockData.thoughts,
        mockData.entities
      );

      expect(result.totalInvalidReferences).toBe(2);
      expect(result.invalidThoughtReferences[0].invalidEntityIds).toHaveLength(2);
    });
  });

  describe('deleteEntity - Cascade Modes', () => {
    describe('orphan mode (default)', () => {
      it('should delete entity and leave references orphaned', () => {
        const result = entityService.deleteEntity('entity-1', 'orphan');

        expect(result.success).toBe(true);
        expect(mockData.entities.some((e: LocalEntity) => e.localId === 'entity-1')).toBe(false);
        
        // Check that thoughts still reference Gandalf (orphaned)
        const thought = mockData.thoughts.find((t: LocalThought) => t.localId === 'thought-1');
        expect(thought?.relatedEntities).toContain('Gandalf');
        expect(thought?.relatedEntityIds).toContain('entity-1');
      });
    });

    describe('block mode', () => {
      it('should block deletion when entity is referenced by thoughts', () => {
        const result = entityService.deleteEntity('entity-1', 'block');

        expect(result.success).toBe(false);
        expect(result.blockReason).toContain('Referenced by 1 thought(s)');
        expect(result.affectedThoughts).toBe(1);
        expect(result.affectedEntities).toBe(2); // Rivendell and Frodo reference Gandalf
        
        // Entity should still exist
        expect(mockData.entities.some((e: LocalEntity) => e.localId === 'entity-1')).toBe(true);
      });

      it('should allow deletion when entity has no references', () => {
        // Frodo has no references
        const result = entityService.deleteEntity('entity-3', 'block');

        expect(result.success).toBe(true);
        expect(mockData.entities.some((e: LocalEntity) => e.localId === 'entity-3')).toBe(false);
      });
    });

    describe('remove mode', () => {
      it('should delete entity and remove all references', () => {
        const result = entityService.deleteEntity('entity-1', 'remove');

        expect(result.success).toBe(true);
        expect(result.affectedThoughts).toBe(1);
        expect(result.affectedEntities).toBe(2);
        
        // Entity should be deleted
        expect(mockData.entities.some((e: LocalEntity) => e.localId === 'entity-1')).toBe(false);
        
        // Thought should no longer reference Gandalf
        const thought = mockData.thoughts.find((t: LocalThought) => t.localId === 'thought-1');
        expect(thought?.relatedEntities).not.toContain('Gandalf');
        expect(thought?.relatedEntityIds).not.toContain('entity-1');
        
        // Rivendell should no longer link to Gandalf
        const rivendell = mockData.entities.find((e: LocalEntity) => e.name === 'Rivendell');
        expect(rivendell?.linkedEntities).not.toContain('Gandalf');
        expect(rivendell?.linkedEntityIds).not.toContain('entity-1');
        
        // Frodo should no longer have Gandalf as parent
        const frodo = mockData.entities.find((e: LocalEntity) => e.name === 'Frodo');
        expect(frodo?.parentEntities).not.toContain('Gandalf');
        expect(frodo?.parentEntityIds).not.toContain('entity-1');
      });

      it('should mark affected items as pending sync', () => {
        entityService.deleteEntity('entity-1', 'remove');

        const thought = mockData.thoughts.find((t: LocalThought) => t.localId === 'thought-1');
        expect(thought?.syncStatus).toBe('pending');
        expect(thought?.modifiedLocally).toBeInstanceOf(Date);
        
        const rivendell = mockData.entities.find((e: LocalEntity) => e.name === 'Rivendell');
        expect(rivendell?.syncStatus).toBe('pending');
        expect(rivendell?.modifiedLocally).toBeInstanceOf(Date);
      });

      it('should handle both ID-based and name-based references', () => {
        // Add entity with only legacy name-based refs
        mockData.entities.push({
          localId: 'entity-4',
          name: 'Legacy Entity',
          type: 'npc',
          campaign_id: 'test-campaign',
          created_by: 'test-user',
          syncStatus: 'synced',
          parentEntityIds: [], // No ID-based refs
          linkedEntityIds: [],
          parentEntities: ['Gandalf'], // Only name-based
          linkedEntities: []
        });

        const result = entityService.deleteEntity('entity-1', 'remove');

        expect(result.success).toBe(true);
        expect(result.affectedEntities).toBe(3); // Rivendell, Frodo, and Legacy Entity
        
        const legacy = mockData.entities.find((e: LocalEntity) => e.name === 'Legacy Entity');
        expect(legacy?.parentEntities).not.toContain('Gandalf');
      });
    });

    describe('edge cases', () => {
      it('should throw error for non-existent entity', () => {
        expect(() => {
          entityService.deleteEntity('non-existent-id', 'orphan');
        }).toThrow('Entity not found');
      });

      it('should handle entity with server ID', () => {
        mockData.entities[0].id = 'server-id-1';
        
        entityService.deleteEntity('entity-1', 'orphan');

        expect(mockData.pendingChanges.entities.deleted).toContain('server-id-1');
      });
    });
  });

  describe('Display Component Validation', () => {
    it('should handle orphaned entity references in display', () => {
      /**
       * This documents expected behavior when displaying thoughts
       * with orphaned entity references (entities that have been deleted)
       */
      
      // Delete Gandalf
      entityService.deleteEntity('entity-1', 'orphan');
      
      // Thought still references Gandalf
      const thought = mockData.thoughts.find((t: LocalThought) => t.localId === 'thought-1');
      expect(thought?.relatedEntities).toContain('Gandalf');
      
      // Display components should:
      // 1. Check if entity exists in entities array
      // 2. Show "Unknown Entity" or badge with warning icon if not found
      // 3. Use 'uncategorized' type as fallback
      
      const gandalfExists = mockData.entities.some((e: LocalEntity) => 
        e.name.toLowerCase() === 'gandalf'
      );
      expect(gandalfExists).toBe(false);
      
      // ThoughtList component will show "Gandalf" with HelpCircle icon
      // and outlined badge to indicate orphaned reference
    });
  });
});
