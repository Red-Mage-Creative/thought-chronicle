import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { campaignValidationService } from '@/services/campaignValidationService';
import { campaignService } from '@/services/campaignService';
import { dataMigrationService } from '@/services/dataMigrationService';
import { schemaVersionService } from '@/services/schemaVersionService';
import { DataMigrationModal } from './DataMigrationModal';
import { MigrationLoadingScreen, MigrationProgress } from './MigrationLoadingScreen';
import { MigrationErrorScreen } from './MigrationErrorScreen';
import { toast } from '@/hooks/use-toast';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer = ({ children }: AppInitializerProps) => {
  const { user } = useAuth();
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress>({
    phase: 'backup',
    currentStep: 0,
    totalSteps: 1,
    message: 'Initializing...'
  });
  const [migrationError, setMigrationError] = useState<{
    message: string;
    migration?: string;
    version?: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    if (user && !isInitialized) {
      const initializeApp = async () => {
        try {
          console.log('[App] Initializing app for user:', user.id);
          
          // Initialize user context
          campaignService.initializeUserContext(user.id);

          // Run data migrations with progress tracking
          const migrationLogs = await dataMigrationService.runMigrations({
            onPhaseChange: (phase) => {
              setMigrationProgress(prev => ({ ...prev, phase }));
            },
            onProgress: (current, total, message) => {
              setMigrationProgress(prev => ({
                ...prev,
                currentStep: current,
                totalSteps: total,
                message
              }));
            },
            onMigrationStart: (migration, current, total) => {
              setMigrationProgress(prev => ({
                ...prev,
                currentMigration: migration,
                currentStep: current,
                totalSteps: total + 1, // +1 for validation
                message: `Running migration: ${migration}`
              }));
            },
            onValidationProgress: (validationProgress) => {
              setMigrationProgress(prev => ({
                ...prev,
                validationProgress,
                message: 'Validating data integrity...'
              }));
            }
          });
          
          if (migrationLogs.length > 0) {
            const successful = migrationLogs.filter(log => log.success).length;
            const failed = migrationLogs.filter(log => !log.success).length;
            
            console.log(`[App] Migrations completed: ${successful} successful, ${failed} failed`);
            
            if (failed === 0) {
              const issuesFixed = migrationProgress.validationProgress?.issuesFixed || 0;
              toast({
                title: "Data Updated",
                description: `Successfully migrated to v${schemaVersionService.CURRENT_VERSION}${issuesFixed > 0 ? ` • ${issuesFixed} issues auto-fixed` : ''}`,
              });
            } else {
              toast({
                title: "Migration Failed",
                description: `${failed} migration(s) failed`,
                variant: "destructive"
              });
              setMigrationError({
                message: 'Some migrations failed during execution',
                version: schemaVersionService.CURRENT_VERSION
              });
              return;
            }
          } else {
            // Show success for validation-only runs
            const issuesFixed = migrationProgress.validationProgress?.issuesFixed || 0;
            if (issuesFixed > 0) {
              toast({
                title: "Data Validated",
                description: `${issuesFixed} minor issues auto-fixed`,
              });
            }
          }

          // Run campaign validation
          const validation = campaignValidationService.validate();
          
          if (!validation.isValid) {
            console.log('[App] Validation issues found, showing migration modal');
            setShowMigrationModal(true);
          } else {
            console.log('[App] Initialization complete');
            setIsInitialized(true);
          }
        } catch (error: any) {
          console.error('[App] Initialization failed:', error);
          setMigrationError({
            message: error.message || 'An unknown error occurred',
            details: error.stack,
            version: schemaVersionService.CURRENT_VERSION
          });
          // Do NOT auto-initialize on error - show error screen instead
        }
      };
      
      initializeApp();
    }
  }, [user, isInitialized]);

  const handleMigrationComplete = () => {
    setShowMigrationModal(false);
    setIsInitialized(true);
    window.location.reload();
  };

  const handleRetryMigration = () => {
    setMigrationError(null);
    setIsInitialized(false);
    window.location.reload();
  };

  const handleContinueAnyway = () => {
    console.warn('[App] User chose to continue despite migration errors');
    setMigrationError(null);
    setIsInitialized(true);
  };

  if (!user) {
    return <>{children}</>;
  }

  // Show error screen if migration failed
  if (migrationError) {
    const backupInfo = dataMigrationService.getBackupInfo();
    return (
      <MigrationErrorScreen
        error={migrationError}
        hasBackup={!!backupInfo}
        onRetry={handleRetryMigration}
        onContinueAnyway={handleContinueAnyway}
      />
    );
  }

  // Show loading screen during migration
  if (!isInitialized && !showMigrationModal) {
    return <MigrationLoadingScreen progress={migrationProgress} />;
  }

  return (
    <>
      {showMigrationModal && (
        <DataMigrationModal
          open={showMigrationModal}
          onComplete={handleMigrationComplete}
          userId={user.id}
          userName={user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
        />
      )}
      {isInitialized && children}
    </>
  );
};