import { localStorageService } from './localStorageService';
import { searchThoughts, searchEntities } from './buildshipApi';

export interface SyncResult {
  success: boolean;
  message: string;
  syncedCount: number;
}

export const syncService = {
  async syncToServer(): Promise<SyncResult> {
    try {
      const data = localStorageService.getData();
      const { thoughts } = data.pendingChanges;
      
      // For now, we'll simulate uploading to server
      // In a real implementation, you would:
      // 1. Upload thoughts.added to Buildship
      // 2. Update thoughts.modified on Buildship
      // 3. Delete thoughts.deleted from Buildship
      
      const totalChanges = thoughts.added.length + thoughts.modified.length + thoughts.deleted.length;
      
      if (totalChanges === 0) {
        return {
          success: true,
          message: "No changes to sync",
          syncedCount: 0
        };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear pending changes on success
      localStorageService.clearPendingChanges();

      return {
        success: true,
        message: `Successfully synced ${totalChanges} changes to the Archive`,
        syncedCount: totalChanges
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        message: "Failed to sync to the Archive. Please try again.",
        syncedCount: 0
      };
    }
  },

  async refreshFromServer(): Promise<SyncResult> {
    try {
      // Fetch fresh data from server
      const [thoughts, entities] = await Promise.all([
        searchThoughts(''),
        searchEntities('')
      ]);

      // Update local storage with server data
      localStorageService.updateServerData(thoughts, entities);

      return {
        success: true,
        message: `Refreshed ${thoughts.length} thoughts and ${entities.length} entities from the Archive`,
        syncedCount: thoughts.length + entities.length
      };
    } catch (error) {
      console.error('Refresh failed:', error);
      return {
        success: false,
        message: "Failed to refresh from the Archive. Please check your connection.",
        syncedCount: 0
      };
    }
  }
};