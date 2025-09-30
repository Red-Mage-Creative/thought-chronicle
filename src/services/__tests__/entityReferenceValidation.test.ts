import { describe, it, expect } from 'vitest';
import { schemaValidationService } from '../schemaValidationService';
import { LocalEntity, EntityType } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';

describe('Entity Reference Validation', () => {
  describe('validateAndRepairEntityReferences', () => {
    it('should detect orphaned entity references in thoughts', () => {
      const entities: LocalEntity[] = [
        { 
          name: 'Aragorn', 
          type: 'npc' as EntityType,
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending',
          parentEntities: [],
          linkedEntities: [],
          createdLocally: new Date(),
          modifiedLocally: new Date()
        }
      ];
      
      const thoughts: LocalThought[] = [
        { 
          content: 'Met with Gandalf',
          relatedEntities: ['Aragorn', 'Gandalf'], // Gandalf doesn't exist
          timestamp: new Date(),
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending'
        }
      ];
      
      const result = schemaValidationService.validateAndRepairEntityReferences(
        thoughts, 
        entities, 
        'campaign-1', 
        'user-1'
      );
      
      expect(result.orphanedReferences.length).toBe(1);
      expect(result.orphanedReferences[0].missingEntities).toContain('Gandalf');
      expect(result.totalOrphaned).toBe(1);
    });
    
    it('should auto-create missing entities', () => {
      const entities: LocalEntity[] = [];
      const thoughts: LocalThought[] = [
        { 
          content: 'Found treasure',
          relatedEntities: ['Magic Sword'],
          timestamp: new Date(),
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending'
        }
      ];
      
      const result = schemaValidationService.validateAndRepairEntityReferences(
        thoughts, 
        entities, 
        'campaign-1', 
        'user-1'
      );
      
      expect(result.entitiesCreated).toContain('Magic Sword');
      expect(entities.length).toBe(1);
      expect(entities[0].name).toBe('Magic Sword');
      expect(entities[0].type).toBe('uncategorized');
      expect(entities[0].description).toBe('Auto-created to resolve orphaned reference');
      expect(entities[0].creationSource).toBe('auto');
    });
    
    it('should detect orphaned parent entity references', () => {
      const entities: LocalEntity[] = [
        { 
          name: 'Rivendell', 
          type: 'location' as EntityType,
          parentEntities: ['Middle Earth'], // Middle Earth doesn't exist
          linkedEntities: [],
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending',
          createdLocally: new Date(),
          modifiedLocally: new Date()
        }
      ];
      
      const result = schemaValidationService.validateAndRepairEntityReferences(
        [], 
        entities, 
        'campaign-1', 
        'user-1'
      );
      
      expect(result.orphanedParentReferences.length).toBe(1);
      expect(result.orphanedParentReferences[0].entityName).toBe('Rivendell');
      expect(result.orphanedParentReferences[0].missingParents).toContain('Middle Earth');
      expect(result.entitiesCreated).toContain('Middle Earth');
    });

    it('should detect orphaned linked entity references', () => {
      const entities: LocalEntity[] = [
        { 
          name: 'Frodo', 
          type: 'npc' as EntityType,
          parentEntities: [],
          linkedEntities: ['The Ring'], // The Ring doesn't exist
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending',
          createdLocally: new Date(),
          modifiedLocally: new Date()
        }
      ];
      
      const result = schemaValidationService.validateAndRepairEntityReferences(
        [], 
        entities, 
        'campaign-1', 
        'user-1'
      );
      
      expect(result.orphanedLinkedReferences.length).toBe(1);
      expect(result.orphanedLinkedReferences[0].entityName).toBe('Frodo');
      expect(result.orphanedLinkedReferences[0].missingLinked).toContain('The Ring');
      expect(result.entitiesCreated).toContain('The Ring');
    });
    
    it('should handle case-insensitive matching', () => {
      const entities: LocalEntity[] = [
        { 
          name: 'ARAGORN', 
          type: 'npc' as EntityType,
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending',
          parentEntities: [],
          linkedEntities: [],
          createdLocally: new Date(),
          modifiedLocally: new Date()
        }
      ];
      
      const thoughts: LocalThought[] = [
        { 
          content: 'Met aragorn',
          relatedEntities: ['aragorn'], // Should match ARAGORN
          timestamp: new Date(),
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending'
        }
      ];
      
      const result = schemaValidationService.validateAndRepairEntityReferences(
        thoughts, 
        entities, 
        'campaign-1', 
        'user-1'
      );
      
      expect(result.orphanedReferences.length).toBe(0);
      expect(result.entitiesCreated.length).toBe(0);
    });

    it('should handle multiple orphaned references across thoughts and entities', () => {
      const entities: LocalEntity[] = [
        { 
          name: 'Rivendell', 
          type: 'location' as EntityType,
          parentEntities: ['Middle Earth'],
          linkedEntities: ['Elrond'],
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending',
          createdLocally: new Date(),
          modifiedLocally: new Date()
        }
      ];
      
      const thoughts: LocalThought[] = [
        { 
          content: 'Council of Elrond',
          relatedEntities: ['Gandalf', 'Frodo'],
          timestamp: new Date(),
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending'
        }
      ];
      
      const result = schemaValidationService.validateAndRepairEntityReferences(
        thoughts, 
        entities, 
        'campaign-1', 
        'user-1'
      );
      
      // Should detect 4 orphaned: Middle Earth, Elrond, Gandalf, Frodo
      expect(result.totalOrphaned).toBe(4);
      expect(result.entitiesCreated).toContain('Middle Earth');
      expect(result.entitiesCreated).toContain('Elrond');
      expect(result.entitiesCreated).toContain('Gandalf');
      expect(result.entitiesCreated).toContain('Frodo');
      expect(result.entitiesCreated.length).toBe(4);
    });

    it('should not duplicate entities when referenced multiple times', () => {
      const entities: LocalEntity[] = [];
      const thoughts: LocalThought[] = [
        { 
          content: 'Gandalf arrived',
          relatedEntities: ['Gandalf'],
          timestamp: new Date(),
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending'
        },
        { 
          content: 'Gandalf spoke',
          relatedEntities: ['Gandalf'],
          timestamp: new Date(),
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending'
        }
      ];
      
      const result = schemaValidationService.validateAndRepairEntityReferences(
        thoughts, 
        entities, 
        'campaign-1', 
        'user-1'
      );
      
      expect(result.orphanedReferences.length).toBe(2); // Both thoughts report orphaned
      expect(result.totalOrphaned).toBe(2); // Total count
      expect(result.entitiesCreated.length).toBe(1); // Only one entity created
      expect(result.entitiesCreated[0]).toBe('Gandalf');
      expect(entities.length).toBe(1); // Only one entity in array
    });

    it('should return empty result when no orphaned references exist', () => {
      const entities: LocalEntity[] = [
        { 
          name: 'Gandalf', 
          type: 'npc' as EntityType,
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending',
          parentEntities: [],
          linkedEntities: [],
          createdLocally: new Date(),
          modifiedLocally: new Date()
        }
      ];
      
      const thoughts: LocalThought[] = [
        { 
          content: 'Met with Gandalf',
          relatedEntities: ['Gandalf'],
          timestamp: new Date(),
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending'
        }
      ];
      
      const result = schemaValidationService.validateAndRepairEntityReferences(
        thoughts, 
        entities, 
        'campaign-1', 
        'user-1'
      );
      
      expect(result.orphanedReferences.length).toBe(0);
      expect(result.orphanedParentReferences.length).toBe(0);
      expect(result.orphanedLinkedReferences.length).toBe(0);
      expect(result.totalOrphaned).toBe(0);
      expect(result.entitiesCreated.length).toBe(0);
    });
  });
});
