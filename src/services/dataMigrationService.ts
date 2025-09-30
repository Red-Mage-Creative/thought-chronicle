import { dataStorageService, LocalDataStore } from './dataStorageService';
import { schemaVersionService } from './schemaVersionService';
import { schemaValidationService } from './schemaValidationService';
import { migrationRegistry } from './migrationRegistry';

export interface MigrationLog {
  version: string;
  migration: string;
  timestamp: Date;
  success: boolean;
  error?: string;
  validationErrors?: number;
}

export interface MigrationProgressCallback {
  onPhaseChange?: (phase: 'backup' | 'migration' | 'validation' | 'complete') => void;
  onMigrationStart?: (migration: string, current: number, total: number) => void;
  onMigrationComplete?: (migration: string) => void;
  onValidationProgress?: (progress: {
    entitiesChecked: number;
    thoughtsChecked: number;
    campaignsChecked: number;
    issuesFixed: number;
  }) => void;
  onProgress?: (current: number, total: number, message: string) => void;
}

const BACKUP_KEY = 'dnd_chronicle_backup';
const MIGRATION_LOGS_KEY = 'dnd_chronicle_migration_logs';

export const dataMigrationService = {
  /**
   * Run all necessary migrations based on current data version
   */
  async runMigrations(callbacks?: MigrationProgressCallback): Promise<MigrationLog[]> {
    const logs: MigrationLog[] = [];
    const storedVersion = schemaVersionService.getStoredVersion();
    const currentVersion = schemaVersionService.CURRENT_VERSION;
    
    console.log('[Migration] Starting migration check...');
    console.log('[Migration] Stored version:', storedVersion || 'none (fresh install)');
    console.log('[Migration] Current version:', currentVersion);
    
    // No stored version = fresh install, just set version and validate
    if (!storedVersion) {
      console.log('[Migration] Fresh install detected, setting version and validating data');
      callbacks?.onPhaseChange?.('validation');
      callbacks?.onProgress?.(1, 1, 'Setting up initial data structure...');
      
      schemaVersionService.setStoredVersion(currentVersion);
      
      // Still validate and fix data structure
      try {
        const data = dataStorageService.getData();
        const validatedData = this.validateAndFixData(data, callbacks);
        dataStorageService.saveData(validatedData);
      } catch (error) {
        console.error('[Migration] Validation failed on fresh install:', error);
      }
      
      callbacks?.onPhaseChange?.('complete');
      return logs;
    }
    
    // Already at current version, just validate
    if (storedVersion === currentVersion) {
      console.log('[Migration] Already at current version, running validation only');
      callbacks?.onPhaseChange?.('validation');
      callbacks?.onProgress?.(1, 1, 'Validating data integrity...');
      
      try {
        const data = dataStorageService.getData();
        const validatedData = this.validateAndFixData(data, callbacks);
        dataStorageService.saveData(validatedData);
      } catch (error) {
        console.error('[Migration] Validation failed:', error);
      }
      
      callbacks?.onPhaseChange?.('complete');
      return logs;
    }
    
    console.log(`[Migration] Migrating from v${storedVersion} to v${currentVersion}`);
    
    // Create backup before any changes
    callbacks?.onPhaseChange?.('backup');
    callbacks?.onProgress?.(0, 1, 'Creating backup of your data...');
    this.createBackup();
    console.log('[Migration] Backup created');
    
    // Get all migrations that need to run
    const migrationsToRun = migrationRegistry.filter(migration => {
      const migrationVersion = schemaVersionService.getVersionNumber(migration.version);
      const stored = schemaVersionService.getVersionNumber(storedVersion);
      return migrationVersion > stored;
    });
    
    console.log(`[Migration] Found ${migrationsToRun.length} migrations to run`);
    
    // Run migrations in order
    callbacks?.onPhaseChange?.('migration');
    let data = dataStorageService.getData();
    const totalSteps = migrationsToRun.length + 1; // migrations + validation
    
    for (let i = 0; i < migrationsToRun.length; i++) {
      const migration = migrationsToRun[i];
      try {
        console.log(`[Migration] Running: ${migration.name} (${migration.version})`);
        callbacks?.onMigrationStart?.(migration.name, i + 1, migrationsToRun.length);
        callbacks?.onProgress?.(i + 1, totalSteps, `Running: ${migration.name}`);
        
        data = migration.up(data);
        
        callbacks?.onMigrationComplete?.(migration.name);
        
        logs.push({
          version: migration.version,
          migration: migration.name,
          timestamp: new Date(),
          success: true
        });
        
        console.log(`[Migration] ✓ ${migration.name} completed successfully`);
      } catch (error: any) {
        console.error(`[Migration] ✗ Migration failed: ${migration.name}`, error);
        
        logs.push({
          version: migration.version,
          migration: migration.name,
          timestamp: new Date(),
          success: false,
          error: error.message
        });
        
        // Restore backup on failure
        console.log('[Migration] Restoring from backup...');
        this.restoreBackup();
        this.saveMigrationLogs(logs);
        throw new Error(`Migration failed: ${migration.name} - ${error.message}`);
      }
    }
    
    // Validate all data after migrations
    callbacks?.onPhaseChange?.('validation');
    callbacks?.onProgress?.(totalSteps, totalSteps, 'Validating all data...');
    console.log('[Migration] Running post-migration validation...');
    try {
      data = this.validateAndFixData(data, callbacks);
      console.log('[Migration] ✓ Validation completed');
    } catch (error: any) {
      console.error('[Migration] ✗ Data validation failed after migration', error);
      this.restoreBackup();
      this.saveMigrationLogs(logs);
      throw new Error(`Data validation failed after migration: ${error.message}`);
    }
    
    // Save migrated and validated data
    dataStorageService.saveData(data);
    console.log('[Migration] Data saved');
    
    // Update stored version
    schemaVersionService.setStoredVersion(currentVersion);
    console.log(`[Migration] Version updated to ${currentVersion}`);
    
    // Save migration logs
    this.saveMigrationLogs(logs);
    console.log('[Migration] Migration logs saved');
    
    callbacks?.onPhaseChange?.('complete');
    console.log(`[Migration] ✓ All migrations completed successfully`);
    return logs;
  },
  
  /**
   * Validate entire dataset and fill missing fields
   */
  validateAndFixData(data: LocalDataStore, callbacks?: MigrationProgressCallback): LocalDataStore {
    console.log('[Validation] Starting data validation...');
    
    // Validate entities
    const entityResult = schemaValidationService.validateAllEntities(data.entities);
    const entityIssuesFixed = entityResult.errors.filter(e => !entityResult.invalid.some((_, idx) => idx === e.index)).length;
    
    callbacks?.onValidationProgress?.({
      entitiesChecked: data.entities.length,
      thoughtsChecked: 0,
      campaignsChecked: 0,
      issuesFixed: entityIssuesFixed
    });
    
    if (entityResult.errors.length > 0) {
      console.warn(`[Validation] Found ${entityResult.errors.length} entity field issues`);
      console.warn(`[Validation] Valid: ${entityResult.valid.length}, Invalid: ${entityResult.invalid.length}`);
    }
    
    // Throw error if we have invalid entities with missing required fields
    if (entityResult.invalid.length > 0) {
      const criticalErrors = entityResult.errors.filter(e => 
        entityResult.invalid.some((_, idx) => idx === e.index)
      );
      console.error('[Validation] Critical: Some entities missing required fields', criticalErrors);
      throw new Error(`${entityResult.invalid.length} entities have critical validation errors`);
    }
    
    // Validate thoughts
    const thoughtResult = schemaValidationService.validateAllThoughts(data.thoughts);
    const thoughtIssuesFixed = thoughtResult.errors.filter(e => !thoughtResult.invalid.some((_, idx) => idx === e.index)).length;
    
    callbacks?.onValidationProgress?.({
      entitiesChecked: data.entities.length,
      thoughtsChecked: data.thoughts.length,
      campaignsChecked: 0,
      issuesFixed: entityIssuesFixed + thoughtIssuesFixed
    });
    
    if (thoughtResult.errors.length > 0) {
      console.warn(`[Validation] Found ${thoughtResult.errors.length} thought field issues`);
      console.warn(`[Validation] Valid: ${thoughtResult.valid.length}, Invalid: ${thoughtResult.invalid.length}`);
    }
    
    if (thoughtResult.invalid.length > 0) {
      const criticalErrors = thoughtResult.errors.filter(e => 
        thoughtResult.invalid.some((_, idx) => idx === e.index)
      );
      console.error('[Validation] Critical: Some thoughts missing required fields', criticalErrors);
      throw new Error(`${thoughtResult.invalid.length} thoughts have critical validation errors`);
    }
    
    // Validate campaigns
    const campaignResult = schemaValidationService.validateAllCampaigns(data.campaigns);
    const campaignIssuesFixed = campaignResult.errors.filter(e => !campaignResult.invalid.some((_, idx) => idx === e.index)).length;
    const totalIssuesFixed = entityIssuesFixed + thoughtIssuesFixed + campaignIssuesFixed;
    
    callbacks?.onValidationProgress?.({
      entitiesChecked: data.entities.length,
      thoughtsChecked: data.thoughts.length,
      campaignsChecked: data.campaigns.length,
      issuesFixed: totalIssuesFixed
    });
    
    if (campaignResult.errors.length > 0) {
      console.warn(`[Validation] Found ${campaignResult.errors.length} campaign field issues`);
      console.warn(`[Validation] Valid: ${campaignResult.valid.length}, Invalid: ${campaignResult.invalid.length}`);
    }
    
    if (campaignResult.invalid.length > 0) {
      const criticalErrors = campaignResult.errors.filter(e => 
        campaignResult.invalid.some((_, idx) => idx === e.index)
      );
      console.error('[Validation] Critical: Some campaigns missing required fields', criticalErrors);
      throw new Error(`${campaignResult.invalid.length} campaigns have critical validation errors`);
    }
    
    console.log('[Validation] ✓ All data validated and fixed');
    console.log(`[Validation] Summary: ${totalIssuesFixed} minor issues auto-fixed`);
    
    return {
      ...data,
      entities: entityResult.valid,
      thoughts: thoughtResult.valid,
      campaigns: campaignResult.valid
    };
  },
  
  /**
   * Create backup of current data
   */
  createBackup(): void {
    const data = dataStorageService.getData();
    const backup = {
      timestamp: new Date().toISOString(),
      version: schemaVersionService.getStoredVersion(),
      data: data
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
  },
  
  /**
   * Restore from backup
   */
  restoreBackup(): void {
    const backupStr = localStorage.getItem(BACKUP_KEY);
    if (backupStr) {
      try {
        const backup = JSON.parse(backupStr);
        dataStorageService.saveData(backup.data);
        if (backup.version) {
          schemaVersionService.setStoredVersion(backup.version);
        }
        console.log('[Migration] Backup restored successfully');
      } catch (error) {
        console.error('[Migration] Failed to restore backup:', error);
      }
    }
  },
  
  /**
   * Get backup info if it exists
   */
  getBackupInfo(): { timestamp: string; version: string | null } | null {
    const backupStr = localStorage.getItem(BACKUP_KEY);
    if (backupStr) {
      try {
        const backup = JSON.parse(backupStr);
        return {
          timestamp: backup.timestamp,
          version: backup.version || 'unknown'
        };
      } catch (error) {
        return null;
      }
    }
    return null;
  },
  
  /**
   * Save migration logs for debugging
   */
  saveMigrationLogs(logs: MigrationLog[]): void {
    const existingLogs = this.getMigrationLogs();
    const allLogs = [...existingLogs, ...logs];
    localStorage.setItem(MIGRATION_LOGS_KEY, JSON.stringify(allLogs));
  },
  
  /**
   * Get migration history
   */
  getMigrationLogs(): MigrationLog[] {
    const logsStr = localStorage.getItem(MIGRATION_LOGS_KEY);
    if (logsStr) {
      try {
        const logs = JSON.parse(logsStr);
        // Convert timestamp strings back to Date objects
        return logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      } catch (error) {
        return [];
      }
    }
    return [];
  },
  
  /**
   * Clear all migration logs (for testing/debugging)
   */
  clearMigrationLogs(): void {
    localStorage.removeItem(MIGRATION_LOGS_KEY);
  }
};