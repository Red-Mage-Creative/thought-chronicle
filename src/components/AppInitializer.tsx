import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { campaignValidationService } from '@/services/campaignValidationService';
import { campaignService } from '@/services/campaignService';
import { dataMigrationService } from '@/services/dataMigrationService';
import { schemaVersionService } from '@/services/schemaVersionService';
import { DataMigrationModal } from './DataMigrationModal';
import { toast } from '@/hooks/use-toast';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer = ({ children }: AppInitializerProps) => {
  const { user } = useAuth();
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user && !isInitialized) {
      const initializeApp = async () => {
        try {
          console.log('[App] Initializing app for user:', user.id);
          
          // Initialize user context
          campaignService.initializeUserContext(user.id);

          // Run data migrations (now async and comprehensive)
          const migrationLogs = await dataMigrationService.runMigrations();
          
          if (migrationLogs.length > 0) {
            const successful = migrationLogs.filter(log => log.success).length;
            const failed = migrationLogs.filter(log => !log.success).length;
            
            console.log(`[App] Migrations completed: ${successful} successful, ${failed} failed`);
            
            if (failed === 0) {
              toast({
                title: "Data Updated",
                description: `Successfully migrated to v${schemaVersionService.CURRENT_VERSION}`,
              });
            } else {
              toast({
                title: "Migration Issues",
                description: `Some migrations failed. Please check console.`,
                variant: "destructive"
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
          toast({
            title: "Initialization Failed",
            description: error.message || "Please refresh and try again.",
            variant: "destructive"
          });
          // Still allow app to load even if migration fails
          setIsInitialized(true);
        }
      };
      
      initializeApp();
    }
  }, [user, isInitialized]);

  const handleMigrationComplete = () => {
    setShowMigrationModal(false);
    setIsInitialized(true);
    
    // Reload the page to ensure all components get the updated data
    window.location.reload();
  };

  if (!user) {
    return <>{children}</>;
  }

  if (!isInitialized && !showMigrationModal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Initializing...</p>
          <p className="text-xs text-muted-foreground">Running data migrations</p>
        </div>
      </div>
    );
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