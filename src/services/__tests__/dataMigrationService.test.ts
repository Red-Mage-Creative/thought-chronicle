import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dataMigrationService } from '../dataMigrationService';
import { dataStorageService } from '../dataStorageService';
import { schemaVersionService } from '../schemaVersionService';

describe('dataMigrationService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });
  
  afterEach(() => {
    localStorage.clear();
  });
  
  describe('runMigrations', () => {
    it('should set version on fresh install without running migrations', async () => {
      const logs = await dataMigrationService.runMigrations();
      
      expect(logs.length).toBe(0);
      expect(schemaVersionService.getStoredVersion()).toBe(schemaVersionService.CURRENT_VERSION);
    });
    
    it('should not run migrations if already at current version', async () => {
      schemaVersionService.setStoredVersion(schemaVersionService.CURRENT_VERSION);
      
      const logs = await dataMigrationService.runMigrations();
      
      expect(logs.length).toBe(0);
    });
    
    it('should run migrations in order from old version to current', async () => {
      // Set old version
      schemaVersionService.setStoredVersion('0.2.0');
      
      // Add some test data
      const data = dataStorageService.getData();
      data.entities = [{
        name: 'Test',
        type: 'npc' as any,
        campaign_id: 'test',
        created_by: 'user',
        syncStatus: 'pending' as const,
        parentEntities: [],
        linkedEntities: [],
        creationSource: 'manual' as const,
        createdLocally: new Date(),
        modifiedLocally: new Date()
      }];
      dataStorageService.saveData(data);
      
      const logs = await dataMigrationService.runMigrations();
      
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.every(log => log.success)).toBe(true);
      expect(schemaVersionService.getStoredVersion()).toBe(schemaVersionService.CURRENT_VERSION);
    });
  });
  
  describe('backup and restore', () => {
    it('should create and restore backups', () => {
      const data = dataStorageService.getData();
      data.entities = [{
        name: 'Test',
        type: 'npc' as any,
        campaign_id: 'test',
        created_by: 'user',
        syncStatus: 'pending' as const,
        parentEntities: [],
        linkedEntities: [],
        creationSource: 'manual' as const,
        createdLocally: new Date(),
        modifiedLocally: new Date()
      }];
      dataStorageService.saveData(data);
      
      dataMigrationService.createBackup();
      
      // Modify data
      const modifiedData = dataStorageService.getData();
      modifiedData.entities = [];
      dataStorageService.saveData(modifiedData);
      
      // Restore
      dataMigrationService.restoreBackup();
      
      const restoredData = dataStorageService.getData();
      expect(restoredData.entities.length).toBe(1);
      expect(restoredData.entities[0].name).toBe('Test');
    });
  });
  
  describe('migration logs', () => {
    it('should save and retrieve migration logs', () => {
      const testLog = {
        version: '0.8.0',
        migration: 'test-migration',
        timestamp: new Date(),
        success: true
      };
      
      dataMigrationService.saveMigrationLogs([testLog]);
      const logs = dataMigrationService.getMigrationLogs();
      
      expect(logs.length).toBe(1);
      expect(logs[0].migration).toBe('test-migration');
      expect(logs[0].success).toBe(true);
    });
  });
});
