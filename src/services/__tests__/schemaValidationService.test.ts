import { describe, it, expect } from 'vitest';
import { schemaValidationService } from '../schemaValidationService';
import { EntityType } from '@/types/entities';

describe('schemaValidationService', () => {
  describe('validateEntity', () => {
    it('should fill missing optional fields with defaults', () => {
      const entity = {
        name: 'Test Entity',
        type: 'npc' as EntityType,
        campaign_id: 'campaign-1',
        created_by: 'user-1',
        syncStatus: 'pending' as const
      };
      
      const { entity: validated, errors } = schemaValidationService.validateEntity(entity);
      
      expect(validated.parentEntities).toEqual([]);
      expect(validated.linkedEntities).toEqual([]);
      expect(validated.creationSource).toBe('manual');
      expect(validated.createdLocally).toBeInstanceOf(Date);
      expect(validated.modifiedLocally).toBeInstanceOf(Date);
      expect(errors.length).toBe(0);
    });
    
    it('should report missing required fields', () => {
      const entity = {
        name: 'Test Entity',
        // Missing type, campaign_id, created_by, syncStatus
      };
      
      const { errors } = schemaValidationService.validateEntity(entity);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'type')).toBe(true);
      expect(errors.some(e => e.field === 'campaign_id')).toBe(true);
    });
    
    it('should convert date strings to Date objects', () => {
      const entity = {
        name: 'Test Entity',
        type: 'npc' as EntityType,
        campaign_id: 'campaign-1',
        created_by: 'user-1',
        syncStatus: 'pending' as const,
        createdLocally: '2024-01-01T00:00:00.000Z',
        modifiedLocally: '2024-01-02T00:00:00.000Z'
      };
      
      const { entity: validated } = schemaValidationService.validateEntity(entity);
      
      expect(validated.createdLocally).toBeInstanceOf(Date);
      expect(validated.modifiedLocally).toBeInstanceOf(Date);
    });
    
    it('should ensure arrays are actually arrays', () => {
      const entity = {
        name: 'Test Entity',
        type: 'npc' as EntityType,
        campaign_id: 'campaign-1',
        created_by: 'user-1',
        syncStatus: 'pending' as const,
        parentEntities: null as any,
        linkedEntities: undefined as any
      };
      
      const { entity: validated } = schemaValidationService.validateEntity(entity);
      
      expect(Array.isArray(validated.parentEntities)).toBe(true);
      expect(Array.isArray(validated.linkedEntities)).toBe(true);
    });
  });
  
  describe('validateThought', () => {
    it('should fill missing optional fields with defaults', () => {
      const thought = {
        content: 'Test thought',
        relatedEntities: ['Entity1'],
        timestamp: new Date(),
        campaign_id: 'campaign-1',
        created_by: 'user-1',
        syncStatus: 'pending' as const
      };
      
      const { thought: validated, errors } = schemaValidationService.validateThought(thought);
      
      expect(validated.modifiedLocally).toBeInstanceOf(Date);
      expect(errors.length).toBe(0);
    });
    
    it('should convert date strings to Date objects', () => {
      const thought = {
        content: 'Test thought',
        relatedEntities: ['Entity1'],
        timestamp: '2024-01-01T00:00:00.000Z',
        campaign_id: 'campaign-1',
        created_by: 'user-1',
        syncStatus: 'pending' as const
      };
      
      const { thought: validated } = schemaValidationService.validateThought(thought);
      
      expect(validated.timestamp).toBeInstanceOf(Date);
    });
  });
  
  describe('validateCampaign', () => {
    it('should fill missing optional fields with defaults', () => {
      const campaign = {
        name: 'Test Campaign',
        created_by: 'user-1',
        members: [],
        created_at: new Date(),
        updated_at: new Date(),
        syncStatus: 'pending' as const
      };
      
      const { campaign: validated, errors } = schemaValidationService.validateCampaign(campaign);
      
      expect(validated.modifiedLocally).toBeInstanceOf(Date);
      expect(errors.length).toBe(0);
    });
  });

  describe('date validation edge cases', () => {
    it('should handle invalid date strings', () => {
      const entity = {
        name: 'Test Entity',
        type: 'npc' as EntityType,
        campaign_id: 'campaign-1',
        created_by: 'user-1',
        syncStatus: 'pending' as const,
        createdLocally: 'not-a-date',
        modifiedLocally: 'also-not-a-date'
      };
      
      const { entity: validated } = schemaValidationService.validateEntity(entity);
      
      // Should fall back to current date for invalid strings
      expect(validated.createdLocally).toBeInstanceOf(Date);
      expect(validated.modifiedLocally).toBeInstanceOf(Date);
      expect(validated.createdLocally.toString()).not.toBe('Invalid Date');
      expect(validated.modifiedLocally.toString()).not.toBe('Invalid Date');
    });

    it('should handle null dates', () => {
      const entity = {
        name: 'Test Entity',
        type: 'npc' as EntityType,
        campaign_id: 'campaign-1',
        created_by: 'user-1',
        syncStatus: 'pending' as const,
        createdLocally: null as any,
        modifiedLocally: null as any
      };
      
      const { entity: validated } = schemaValidationService.validateEntity(entity);
      
      expect(validated.createdLocally).toBeInstanceOf(Date);
      expect(validated.modifiedLocally).toBeInstanceOf(Date);
    });

    it('should handle malformed date objects', () => {
      const entity = {
        name: 'Test Entity',
        type: 'npc' as EntityType,
        campaign_id: 'campaign-1',
        created_by: 'user-1',
        syncStatus: 'pending' as const,
        createdLocally: new Date('invalid'),
        modifiedLocally: new Date('bad-date')
      };
      
      const { entity: validated } = schemaValidationService.validateEntity(entity);
      
      // Should replace invalid Date objects
      expect(validated.createdLocally).toBeInstanceOf(Date);
      expect(validated.modifiedLocally).toBeInstanceOf(Date);
      expect(validated.createdLocally.toString()).not.toBe('Invalid Date');
      expect(validated.modifiedLocally.toString()).not.toBe('Invalid Date');
    });
  });

  describe('validateAllEntities', () => {
    it('should separate valid and invalid entities', () => {
      const entities = [
        {
          name: 'Valid Entity',
          type: 'npc' as EntityType,
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending' as const
        },
        {
          name: 'Invalid Entity',
          // Missing required fields
        }
      ];
      
      const result = schemaValidationService.validateAllEntities(entities);
      
      expect(result.valid.length).toBe(1);
      expect(result.invalid.length).toBe(1);
      expect(result.valid[0].name).toBe('Valid Entity');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide validation summary', () => {
      const entities = [
        {
          name: 'Entity 1',
          type: 'npc' as EntityType,
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending' as const
        },
        {
          name: 'Entity 2',
          type: 'location' as EntityType,
          campaign_id: 'campaign-1',
          created_by: 'user-1',
          syncStatus: 'pending' as const,
          parentEntities: null as any // Will be fixed
        }
      ];
      
      const result = schemaValidationService.validateAllEntities(entities);
      
      expect(result.valid.length).toBe(2);
      expect(result.valid[1].parentEntities).toEqual([]);
    });
  });
});
