import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { campaignValidationService } from '@/services/campaignValidationService';
import { campaignService } from '@/services/campaignService';
import { dataMigrationService } from '@/services/dataMigrationService';
import { DataMigrationModal } from './DataMigrationModal';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer = ({ children }: AppInitializerProps) => {
  const { user } = useAuth();
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user && !isInitialized) {
      // Initialize user context
      campaignService.initializeUserContext(user.id);

      // Run data migrations (e.g., character -> npc)
      dataMigrationService.runMigrations();

      // Run validation
      const validation = campaignValidationService.validate();
      
      if (!validation.isValid) {
        setShowMigrationModal(true);
      } else {
        setIsInitialized(true);
      }
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
        <p className="text-muted-foreground">Initializing...</p>
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