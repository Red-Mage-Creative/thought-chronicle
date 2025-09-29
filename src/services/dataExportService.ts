import { dataStorageService } from './dataStorageService';
import { LocalThought } from '@/types/thoughts';
import { LocalEntity } from '@/types/entities';
import { LocalCampaign } from '@/types/campaigns';

export interface ExportData {
  metadata: {
    exportDate: string;
    appVersion: string;
    exportType: 'current_campaign' | 'all_data';
    userId?: string;
    campaignId?: string;
    campaignName?: string;
  };
  data: {
    campaigns: LocalCampaign[];
    thoughts: LocalThought[];
    entities: LocalEntity[];
  };
}

export const dataExportService = {
  /**
   * Export data for the current campaign
   */
  exportCurrentCampaign(): ExportData {
    const localData = dataStorageService.getData();
    const context = dataStorageService.getCurrentContext();
    
    if (!context.campaignId) {
      throw new Error('No current campaign selected');
    }

    const currentCampaign = localData.campaigns.find(c => c.id === context.campaignId);
    const campaignData = dataStorageService.getCampaignData(context.campaignId);

    return {
      metadata: {
        exportDate: new Date().toISOString(),
        appVersion: '0.5.0',
        exportType: 'current_campaign',
        userId: context.userId || undefined,
        campaignId: context.campaignId,
        campaignName: currentCampaign?.name || 'Unknown Campaign'
      },
      data: {
        campaigns: currentCampaign ? [this.cleanCampaignForExport(currentCampaign)] : [],
        thoughts: campaignData.thoughts.map(this.cleanThoughtForExport),
        entities: campaignData.entities.map(this.cleanEntityForExport)
      }
    };
  },

  /**
   * Export all user data
   */
  exportAllData(): ExportData {
    const localData = dataStorageService.getData();
    const context = dataStorageService.getCurrentContext();

    return {
      metadata: {
        exportDate: new Date().toISOString(),
        appVersion: '0.5.0',
        exportType: 'all_data',
        userId: context.userId || undefined
      },
      data: {
        campaigns: localData.campaigns.map(this.cleanCampaignForExport),
        thoughts: localData.thoughts.map(this.cleanThoughtForExport),
        entities: localData.entities.map(this.cleanEntityForExport)
      }
    };
  },

  /**
   * Generate and download export file
   */
  downloadExport(exportData: ExportData): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `chronicle-export-${timestamp}.json`;
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Clean campaign data for export (remove internal fields)
   */
  cleanCampaignForExport(campaign: LocalCampaign): Omit<LocalCampaign, 'localId' | 'syncStatus' | 'modifiedLocally'> {
    const { localId, syncStatus, modifiedLocally, ...cleanCampaign } = campaign;
    return {
      ...cleanCampaign,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at
    };
  },

  /**
   * Clean thought data for export (remove internal fields)
   */
  cleanThoughtForExport(thought: LocalThought): Omit<LocalThought, 'localId' | 'syncStatus' | 'modifiedLocally'> {
    const { localId, syncStatus, modifiedLocally, ...cleanThought } = thought;
    return {
      ...cleanThought,
      timestamp: thought.timestamp
    };
  },

  /**
   * Clean entity data for export (remove internal fields)
   */
  cleanEntityForExport(entity: LocalEntity): Omit<LocalEntity, 'localId' | 'syncStatus' | 'modifiedLocally' | 'createdLocally'> {
    const { localId, syncStatus, modifiedLocally, createdLocally, ...cleanEntity } = entity;
    return cleanEntity;
  }
};