import { describe, it, expect, beforeEach, vi } from 'vitest';
import { entityService } from '../entityService';
import { dataStorageService } from '../dataStorageService';
import { LocalEntity } from '@/types/entities';

// Mock the dependencies
vi.mock('../dataStorageService');
vi.mock('../campaignService', () => ({
  campaignService: {
    getCurrentCampaignId: () => 'test-campaign-id',
    getCurrentUserId: () => 'test-user-id'
  }
}));

describe('entityService - ID-Based Helper Methods', () => {
  const mockEntities: LocalEntity[] = [
    {
      localId: 'entity-1',
      id: 'server-id-1',
      name: 'Gandalf',
      type: 'npc',
      campaign_id: 'test-campaign',
      created_by: 'test-user',
      syncStatus: 'synced',
      creationSource: 'manual'
    },
    {
      localId: 'entity-2',
      name: 'Rivendell',
      type: 'location',
      campaign_id: 'test-campaign',
      created_by: 'test-user',
      syncStatus: 'pending',
      creationSource: 'auto'
    },
    {
      localId: 'entity-3',
      id: 'server-id-3',
      name: 'The One Ring',
      type: 'item',
      campaign_id: 'test-campaign',
      created_by: 'test-user',
      syncStatus: 'synced',
      creationSource: 'manual'
    }
  ];

  beforeEach(() => {
    vi.mocked(dataStorageService.getData).mockReturnValue({
      currentCampaignId: 'test-campaign',
      currentUserId: 'test-user',
      campaigns: [],
      entities: mockEntities,
      thoughts: [],
      defaultEntityAttributes: [],
      pendingChanges: {
        entities: { added: [], modified: [], deleted: [] },
        thoughts: { added: [], modified: [], deleted: [] },
        campaigns: { added: [], modified: [], deleted: [] }
      },
      lastSyncTime: null,
      lastRefreshTime: null
    });
  });

  describe('getEntityById', () => {
    it('should retrieve entity by localId', () => {
      const entity = entityService.getEntityById('entity-1');
      expect(entity).toBeDefined();
      expect(entity?.name).toBe('Gandalf');
      expect(entity?.localId).toBe('entity-1');
    });

    it('should retrieve entity by server id', () => {
      const entity = entityService.getEntityById('server-id-1');
      expect(entity).toBeDefined();
      expect(entity?.name).toBe('Gandalf');
      expect(entity?.id).toBe('server-id-1');
    });

    it('should return undefined for non-existent ID', () => {
      const entity = entityService.getEntityById('non-existent-id');
      expect(entity).toBeUndefined();
    });

    it('should handle entity with only localId (not synced)', () => {
      const entity = entityService.getEntityById('entity-2');
      expect(entity).toBeDefined();
      expect(entity?.name).toBe('Rivendell');
      expect(entity?.id).toBeUndefined();
    });
  });

  describe('getEntityIdByName', () => {
    it('should retrieve entity ID by name (case-insensitive)', () => {
      const id = entityService.getEntityIdByName('gandalf');
      expect(id).toBe('entity-1');
    });

    it('should retrieve entity ID with exact case match', () => {
      const id = entityService.getEntityIdByName('Gandalf');
      expect(id).toBe('entity-1');
    });

    it('should prefer localId over server id', () => {
      const id = entityService.getEntityIdByName('The One Ring');
      expect(id).toBe('entity-3'); // localId, not server-id-3
    });

    it('should return undefined for non-existent entity', () => {
      const id = entityService.getEntityIdByName('Non-existent Entity');
      expect(id).toBeUndefined();
    });
  });

  describe('getEntityNameById', () => {
    it('should retrieve entity name by localId', () => {
      const name = entityService.getEntityNameById('entity-2');
      expect(name).toBe('Rivendell');
    });

    it('should retrieve entity name by server id', () => {
      const name = entityService.getEntityNameById('server-id-3');
      expect(name).toBe('The One Ring');
    });

    it('should return undefined for non-existent ID', () => {
      const name = entityService.getEntityNameById('non-existent-id');
      expect(name).toBeUndefined();
    });
  });

  describe('getEntitiesByIds', () => {
    it('should retrieve multiple entities by their IDs', () => {
      const entities = entityService.getEntitiesByIds(['entity-1', 'entity-3']);
      expect(entities).toHaveLength(2);
      expect(entities[0].name).toBe('Gandalf');
      expect(entities[1].name).toBe('The One Ring');
    });

    it('should skip non-existent IDs', () => {
      const entities = entityService.getEntitiesByIds([
        'entity-1',
        'non-existent-id',
        'entity-2'
      ]);
      expect(entities).toHaveLength(2);
      expect(entities[0].name).toBe('Gandalf');
      expect(entities[1].name).toBe('Rivendell');
    });

    it('should return empty array for all non-existent IDs', () => {
      const entities = entityService.getEntitiesByIds([
        'non-existent-1',
        'non-existent-2'
      ]);
      expect(entities).toHaveLength(0);
    });

    it('should handle empty array', () => {
      const entities = entityService.getEntitiesByIds([]);
      expect(entities).toHaveLength(0);
    });

    it('should work with server IDs', () => {
      const entities = entityService.getEntitiesByIds(['server-id-1', 'server-id-3']);
      expect(entities).toHaveLength(2);
      expect(entities[0].name).toBe('Gandalf');
      expect(entities[1].name).toBe('The One Ring');
    });
  });

  describe('convertNamesToIds', () => {
    it('should convert entity names to IDs', () => {
      const ids = entityService.convertNamesToIds(['Gandalf', 'Rivendell']);
      expect(ids).toHaveLength(2);
      expect(ids).toContain('entity-1');
      expect(ids).toContain('entity-2');
    });

    it('should be case-insensitive', () => {
      const ids = entityService.convertNamesToIds(['gandalf', 'RIVENDELL']);
      expect(ids).toHaveLength(2);
      expect(ids).toContain('entity-1');
      expect(ids).toContain('entity-2');
    });

    it('should skip non-existent entity names', () => {
      const ids = entityService.convertNamesToIds([
        'Gandalf',
        'Non-existent Entity',
        'Rivendell'
      ]);
      expect(ids).toHaveLength(2);
      expect(ids).toContain('entity-1');
      expect(ids).toContain('entity-2');
    });

    it('should return empty array for all non-existent names', () => {
      const ids = entityService.convertNamesToIds(['Non-existent 1', 'Non-existent 2']);
      expect(ids).toHaveLength(0);
    });

    it('should handle empty array', () => {
      const ids = entityService.convertNamesToIds([]);
      expect(ids).toHaveLength(0);
    });
  });

  describe('convertIdsToNames', () => {
    it('should convert entity IDs to names', () => {
      const names = entityService.convertIdsToNames(['entity-1', 'entity-2']);
      expect(names).toHaveLength(2);
      expect(names).toContain('Gandalf');
      expect(names).toContain('Rivendell');
    });

    it('should work with server IDs', () => {
      const names = entityService.convertIdsToNames(['server-id-1', 'server-id-3']);
      expect(names).toHaveLength(2);
      expect(names).toContain('Gandalf');
      expect(names).toContain('The One Ring');
    });

    it('should skip non-existent IDs', () => {
      const names = entityService.convertIdsToNames([
        'entity-1',
        'non-existent-id',
        'entity-3'
      ]);
      expect(names).toHaveLength(2);
      expect(names).toContain('Gandalf');
      expect(names).toContain('The One Ring');
    });

    it('should return empty array for all non-existent IDs', () => {
      const names = entityService.convertIdsToNames(['non-existent-1', 'non-existent-2']);
      expect(names).toHaveLength(0);
    });

    it('should handle empty array', () => {
      const names = entityService.convertIdsToNames([]);
      expect(names).toHaveLength(0);
    });
  });

  describe('Round-trip conversion', () => {
    it('should convert names → IDs → names correctly', () => {
      const originalNames = ['Gandalf', 'Rivendell', 'The One Ring'];
      const ids = entityService.convertNamesToIds(originalNames);
      const convertedNames = entityService.convertIdsToNames(ids);
      
      expect(convertedNames).toHaveLength(3);
      expect(convertedNames).toContain('Gandalf');
      expect(convertedNames).toContain('Rivendell');
      expect(convertedNames).toContain('The One Ring');
    });

    it('should convert IDs → names → IDs correctly', () => {
      const originalIds = ['entity-1', 'entity-2', 'entity-3'];
      const names = entityService.convertIdsToNames(originalIds);
      const convertedIds = entityService.convertNamesToIds(names);
      
      expect(convertedIds).toHaveLength(3);
      expect(convertedIds).toEqual(originalIds);
    });
  });
});
