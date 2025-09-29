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
    console.log('🔍 [DEBUG] handleThoughtSubmit called', {
      content: content.substring(0, 50) + '...',
      tags,
      gameDate,
      defaultTags
    });

    try {
      // Separate manual tags from default tags for proper entity creation
      const manualTags = tags.filter(tag => !defaultTags.includes(tag));
      console.log('🔍 [DEBUG] Separated tags:', {
        manualTags,
        defaultTags,
        allTags: tags
      });
      
      const result = await businessLogicService.processThoughtCreation(
        content,
        manualTags,
        defaultTags,
        gameDate
      );

      console.log('🔍 [DEBUG] processThoughtCreation result:', result);
      
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
        console.log('🔍 [DEBUG] Showed success toast for new entities');
      }
      
      // Refresh related data
      console.log('🔍 [DEBUG] Refreshing data...');
      refreshThoughts();
      refreshEntities();
      refreshSyncStatus();
      console.log('🔍 [DEBUG] Data refresh completed');
    } catch (error) {
      console.error('🔍 [DEBUG] Error in handleThoughtSubmit:', error);
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
      console.error('Sync failed:', error);
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
      
      <StatsCard thoughts={thoughts} />
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Record a Thought</h2>
        {onDefaultTagsChange && (
          <Settings
            defaultTags={defaultTags}
            onDefaultTagsChange={onDefaultTagsChange}
            existingEntities={getSuggestions()}
          />
        )}
      </div>
      
      <ThoughtForm
        onSubmit={handleThoughtSubmit}
        suggestions={getSuggestions()}
        defaultTags={defaultTags}
      />
    </>
  );
};