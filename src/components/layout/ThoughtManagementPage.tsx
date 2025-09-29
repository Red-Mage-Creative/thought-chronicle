import { useState } from 'react';
import { ThoughtForm } from '@/components/forms/ThoughtForm';
import { SyncBanner } from '@/components/SyncBanner';
import { Settings } from '@/components/Settings';
import { StatsCard } from '@/components/StatsCard';
import { useThoughts } from '@/hooks/useThoughts';
import { useEntities } from '@/hooks/useEntities';
import { useSyncState } from '@/hooks/useSyncState';
import { syncService } from '@/services/syncService';
import { businessLogicService } from '@/services/businessLogicService';
import { useToast } from '@/hooks/use-toast';
import { secureLog } from '@/utils/secureLogging';

interface ThoughtManagementPageProps {
  defaultTags?: string[];
  onDefaultTagsChange?: (tags: string[]) => void;
}

export const ThoughtManagementPage = ({ 
  defaultTags = [], 
  onDefaultTagsChange 
}: ThoughtManagementPageProps) => {
  const { thoughts, createThought, refreshThoughts } = useThoughts();
  const { getSuggestions, refreshEntities, entities } = useEntities();
  const { syncStatus, refreshSyncStatus } = useSyncState();
  const { toast } = useToast();

  const handleThoughtSubmit = async (content: string, tags: string[], gameDate?: string) => {
    secureLog.debug('handleThoughtSubmit called', {
      contentLength: content.length,
      tagCount: tags.length,
      hasGameDate: !!gameDate,
      defaultTagCount: defaultTags.length
    });

    try {
      // Separate manual tags from default tags for proper entity creation
      const manualTags = tags.filter(tag => !defaultTags.includes(tag));
      secureLog.debug('Separated tags', {
        manualTagCount: manualTags.length,
        defaultTagCount: defaultTags.length,
        totalTagCount: tags.length
      });
      
      const result = await businessLogicService.processThoughtCreation(
        content,
        manualTags,
        defaultTags,
        gameDate
      );

      secureLog.debug('processThoughtCreation result', {
        newEntitiesCreated: result.newEntitiesCreated,
        entityCount: result.entityNames?.length || 0
      });
      
      // Show entity creation notification if entities were created
      if (result.newEntitiesCreated > 0) {
        const message = businessLogicService.formatEntityCreationMessage(
          result.newEntitiesCreated,
          result.entityNames
        );
        toast({
          title: 'Entities created',
          description: message
        });
        secureLog.debug('Showed success toast for new entities');
      }
      
      // Refresh related data
      secureLog.debug('Refreshing data...');
      refreshThoughts();
      refreshEntities();
      refreshSyncStatus();
      secureLog.debug('Data refresh completed');
    } catch (error) {
      secureLog.error('Error in handleThoughtSubmit:', error);
      throw error; // Re-throw to let ThoughtForm handle the error display
    }
  };

  const handleSync = async () => {
    try {
      await syncService.syncToServer();
      refreshSyncStatus();
      toast({
        title: 'Sync complete',
        description: 'Your data has been synchronized with the server.'
      });
    } catch (error) {
      secureLog.error('Sync failed:', error);
      toast({
        title: 'Sync failed',
        description: 'Could not sync to server. Check your connection.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      {syncStatus.pendingChanges > 0 && (
        <SyncBanner onSync={handleSync} />
      )}
      
      <ThoughtForm
        onSubmit={handleThoughtSubmit}
        suggestions={getSuggestions()}
        defaultTags={defaultTags}
        showSettings={!!onDefaultTagsChange}
        onDefaultTagsChange={onDefaultTagsChange}
        existingEntities={getSuggestions()}
      />
    </>
  );
};