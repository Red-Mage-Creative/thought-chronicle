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

const BACKUP_KEY = 'dnd_chronicle_backup';
const MIGRATION_LOGS_KEY = 'dnd_chronicle_migration_logs';

export const dataMigrationService = {
  /**
   * Run all necessary migrations based on current data version
   */
  async runMigrations(): Promise<MigrationLog[]> {
    const logs: MigrationLog[] = [];
    const storedVersion = schemaVersionService.getStoredVersion();
    const currentVersion = schemaVersionService.CURRENT_VERSION;
    
    console.log('[Migration] Starting migration check...');
    console.log('[Migration] Stored version:', storedVersion || 'none (fresh install)');
    console.log('[Migration] Current version:', currentVersion);
    
    // No stored version = fresh install, just set version and validate
    if (!storedVersion) {
      console.log('[Migration] Fresh install detected, setting version and validating data');
      schemaVersionService.setStoredVersion(currentVersion);
      
      // Still validate and fix data structure
      try {
        const data = dataStorageService.getData();
        const validatedData = this.validateAndFixData(data);
        dataStorageService.saveData(validatedData);
      } catch (error) {
        console.error('[Migration] Validation failed on fresh install:', error);
      }
      
      return logs;
    }
    
    // Already at current version, just validate
    if (storedVersion === currentVersion) {
      console.log('[Migration] Already at current version, running validation only');
      try {
        const data = dataStorageService.getData();
        const validatedData = this.validateAndFixData(data);
        dataStorageService.saveData(validatedData);
      } catch (error) {
        console.error('[Migration] Validation failed:', error);
      }
      return logs;
    }
    
    console.log(`[Migration] Migrating from v${storedVersion} to v${currentVersion}`);
    
    // Create backup before any changes
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
    let data = dataStorageService.getData();
    
    for (const migration of migrationsToRun) {
      try {
        console.log(`[Migration] Running: ${migration.name} (${migration.version})`);
        data = migration.up(data);
        
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
    console.log('[Migration] Running post-migration validation...');
    try {
      data = this.validateAndFixData(data);
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
    
    console.log(`[Migration] ✓ All migrations completed successfully`);
    return logs;
  },
  
  /**
   * Validate entire dataset and fill missing fields
   */
  validateAndFixData(data: LocalDataStore): LocalDataStore {
    console.log('[Validation] Starting data validation...');
    
    // Validate entities
    const entityResult = schemaValidationService.validateAllEntities(data.entities);
    if (entityResult.errors.length > 0) {
      console.warn(`[Validation] Found ${entityResult.errors.length} entity field issues (auto-fixed)`);
      entityResult.errors.forEach(err => {
        console.warn(`  - Entity ${err.index}: ${err.error}`);
      });
    }
    
    // Validate thoughts
    const thoughtResult = schemaValidationService.validateAllThoughts(data.thoughts);
    if (thoughtResult.errors.length > 0) {
      console.warn(`[Validation] Found ${thoughtResult.errors.length} thought field issues (auto-fixed)`);
      thoughtResult.errors.forEach(err => {
        console.warn(`  - Thought ${err.index}: ${err.error}`);
      });
    }
    
    // Validate campaigns
    const campaignResult = schemaValidationService.validateAllCampaigns(data.campaigns);
    if (campaignResult.errors.length > 0) {
      console.warn(`[Validation] Found ${campaignResult.errors.length} campaign field issues (auto-fixed)`);
      campaignResult.errors.forEach(err => {
        console.warn(`  - Campaign ${err.index}: ${err.error}`);
      });
    }
    
    console.log('[Validation] ✓ All data validated and fixed');
    
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