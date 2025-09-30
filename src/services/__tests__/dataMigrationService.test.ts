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

  describe('progress callbacks', () => {
    it('should invoke phase change callbacks during migration', async () => {
      schemaVersionService.setStoredVersion('0.6.0');
      
      const phases: string[] = [];
      
      await dataMigrationService.runMigrations({
        onPhaseChange: (phase) => {
          phases.push(phase);
        }
      });
      
      // Should have backup, migration, validation, and complete phases
      expect(phases).toContain('backup');
      expect(phases).toContain('migration');
      expect(phases).toContain('validation');
      expect(phases).toContain('complete');
    });

    it('should report validation progress', async () => {
      const data = dataStorageService.getData();
      data.entities = [
        {
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
        }
      ];
      dataStorageService.saveData(data);

      let validationCalled = false;
      
      await dataMigrationService.runMigrations({
        onValidationProgress: (progress) => {
          validationCalled = true;
          expect(progress.entitiesChecked).toBeGreaterThanOrEqual(1);
        }
      });
      
      expect(validationCalled).toBe(true);
    });
  });

  describe('validation with invalid data', () => {
    it('should throw error for entities with missing required fields', async () => {
      const data = dataStorageService.getData();
      data.entities = [{
        name: 'Invalid Entity',
        // Missing required fields: type, campaign_id, created_by, syncStatus
      } as any];
      dataStorageService.saveData(data);
      
      await expect(dataMigrationService.runMigrations()).rejects.toThrow();
    });

    it('should auto-fix entities with missing optional fields', async () => {
      const data = dataStorageService.getData();
      data.entities = [{
        name: 'Fixable Entity',
        type: 'npc' as any,
        campaign_id: 'test',
        created_by: 'user',
        syncStatus: 'pending' as const
        // Missing optional fields: parentEntities, linkedEntities, creationSource, createdLocally, modifiedLocally
      }];
      dataStorageService.saveData(data);
      
      const logs = await dataMigrationService.runMigrations();
      
      const fixedData = dataStorageService.getData();
      expect(fixedData.entities[0].parentEntities).toEqual([]);
      expect(fixedData.entities[0].linkedEntities).toEqual([]);
      expect(fixedData.entities[0].creationSource).toBe('manual');
      expect(fixedData.entities[0].createdLocally).toBeInstanceOf(Date);
      expect(fixedData.entities[0].modifiedLocally).toBeInstanceOf(Date);
    });
  });

  describe('migration failure and rollback', () => {
    it('should restore from backup on migration failure', async () => {
      const data = dataStorageService.getData();
      data.entities = [{
        name: 'Test Entity',
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
      
      // Create backup
      dataMigrationService.createBackup();
      
      // Corrupt data to cause validation failure
      const corruptData = dataStorageService.getData();
      corruptData.entities = [{ name: 'Corrupt' } as any];
      dataStorageService.saveData(corruptData);
      
      // Migration should fail
      try {
        await dataMigrationService.runMigrations();
      } catch (error) {
        // Expected to fail
      }
      
      // Data should be restored
      const restoredData = dataStorageService.getData();
      expect(restoredData.entities[0].name).toBe('Test Entity');
      expect(restoredData.entities[0].type).toBe('npc');
    });
  });
});
