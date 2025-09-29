import { dataStorageService } from './dataStorageService';
import { searchThoughts, searchEntities } from './buildshipApi';
import { 
  transformThoughtForMongo, 
  transformEntityForMongo, 
  transformCampaignForMongo,
  MongoThought,
  MongoEntity,
  MongoCampaign
} from '@/utils/mongoSchemas';

export interface SyncResult {
  success: boolean;
  message: string;
  syncedCount: number;
}

const BUILDSHIP_API_URL = 'https://xn93r8.buildship.run/chronicle-create';

async function uploadToMongoDB(data: any[], collection: string): Promise<boolean> {
  const authToken = 'bonelesschickenstrips'; // TODO: Move to environment/secrets
  
  try {
    const response = await fetch(BUILDSHIP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
      body: JSON.stringify({
        data,
        collection,
      }),
    });

    if (!response.ok) {
      console.error(`MongoDB upload failed for ${collection}:`, response.statusText);
      return false;
    }

    const result = await response.json();
    console.log(`Successfully uploaded ${data.length} ${collection} to MongoDB:`, result);
    return true;
  } catch (error) {
    console.error(`Error uploading ${collection} to MongoDB:`, error);
    return false;
  }
}

export const syncService = {
  async syncToServer(): Promise<SyncResult> {
    try {
      const data = dataStorageService.getData();
      const { thoughts, entities, campaigns } = data.pendingChanges;
      const { campaignId } = dataStorageService.getCurrentContext();

      if (!campaignId) {
        return {
          success: false,
          message: "No campaign selected. Please select a campaign before syncing.",
          syncedCount: 0
        };
      }

      let syncedCount = 0;
      let failures = 0;

      // Get campaign-scoped data to sync
      const campaignData = dataStorageService.getCampaignData(campaignId);

      // Sync campaigns (if any pending)
      if (campaigns.added.length > 0) {
        const campaignsToSync = data.campaigns
          .filter(c => campaigns.added.includes(c.localId!))
          .map(transformCampaignForMongo);

        if (campaignsToSync.length > 0) {
          const success = await uploadToMongoDB(campaignsToSync, 'campaigns');
          if (success) {
            syncedCount += campaignsToSync.length;
          } else {
            failures++;
          }
        }
      }

      // Sync thoughts
      if (thoughts.added.length > 0 || thoughts.modified.length > 0) {
        const thoughtsToSync = campaignData.thoughts
          .filter(t => 
            thoughts.added.includes(t.localId!) || 
            thoughts.modified.includes(t.localId!)
          )
          .map(transformThoughtForMongo);

        if (thoughtsToSync.length > 0) {
          const success = await uploadToMongoDB(thoughtsToSync, 'thoughts');
          if (success) {
            syncedCount += thoughtsToSync.length;
          } else {
            failures++;
          }
        }
      }

      // Sync entities (filter out uncategorized)
      if (entities.added.length > 0 || entities.modified.length > 0) {
        const entitiesToSync = campaignData.entities
          .filter(e => 
            e.type !== 'uncategorized' && 
            (entities.added.includes(e.localId!) || entities.modified.includes(e.localId!))
          )
          .map(transformEntityForMongo);

        if (entitiesToSync.length > 0) {
          const success = await uploadToMongoDB(entitiesToSync, 'entities');
          if (success) {
            syncedCount += entitiesToSync.length;
          } else {
            failures++;
          }
        }
      }

      const totalAttempted = 
        campaigns.added.length + 
        thoughts.added.length + thoughts.modified.length + 
        entities.added.length + entities.modified.length;

      if (totalAttempted === 0) {
        return {
          success: true,
          message: "No changes to sync",
          syncedCount: 0
        };
      }

      if (failures === 0) {
        // All uploads successful, clear pending changes
        dataStorageService.clearPendingChanges();
        return {
          success: true,
          message: `Successfully synced ${syncedCount} changes to the Archive`,
          syncedCount
        };
      } else {
        return {
          success: false,
          message: `Partial sync failure: ${syncedCount} items synced, ${failures} collections failed`,
          syncedCount
        };
      }

    } catch (error) {
      console.error('Sync service error:', error);
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

      // Update local storage with server data (implement this method if needed)
      // dataStorageService.updateServerData(thoughts, entities);

      return {
        success: true,
        message: `Refreshed ${thoughts.length} thoughts and ${entities.length} entities from the Archive`,
        syncedCount: thoughts.length + entities.length
      };
    } catch (error) {
      // Refresh failed - could add retry logic
      return {
        success: false,
        message: "Failed to refresh from the Archive. Please check your connection.",
        syncedCount: 0
      };
    }
  }
};