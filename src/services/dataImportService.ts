import { dataStorageService } from './dataStorageService';
import { ExportData } from './dataExportService';
import { LocalThought } from '@/types/thoughts';
import { LocalEntity } from '@/types/entities';
import { LocalCampaign } from '@/types/campaigns';

export interface ImportResult {
  success: boolean;
  summary: {
    campaignsImported: number;
    thoughtsImported: number;
    entitiesImported: number;
    errors: string[];
  };
}

export const dataImportService = {
  /**
   * Validate import file structure
   */
  async validateImportFile(file: File): Promise<ExportData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          // Validate basic structure
          if (!data.metadata || !data.data) {
            reject(new Error('Invalid file structure: missing metadata or data'));
            return;
          }
          
          if (!data.data.campaigns || !data.data.thoughts || !data.data.entities) {
            reject(new Error('Invalid file structure: missing campaigns, thoughts, or entities'));
            return;
          }
          
          resolve(data as ExportData);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  },

  /**
   * Import data with replace strategy
   * Clears current campaign data and replaces with imported data
   */
  importData(exportData: ExportData): ImportResult {
    try {
      const localData = dataStorageService.getData();
      const context = dataStorageService.getCurrentContext();
      
      if (!context.campaignId || !context.userId) {
        throw new Error('No active campaign context');
      }

      // Convert imported data to local format with sync status
      const importedCampaigns: LocalCampaign[] = exportData.data.campaigns.map(c => ({
        ...c,
        syncStatus: 'pending' as const,
        created_at: new Date(c.created_at),
        updated_at: new Date(c.updated_at)
      }));

      const importedThoughts: LocalThought[] = exportData.data.thoughts.map(t => ({
        ...t,
        syncStatus: 'pending' as const,
        timestamp: new Date(t.timestamp)
      }));

      const importedEntities: LocalEntity[] = exportData.data.entities.map(e => ({
        ...e,
        syncStatus: 'pending' as const
      }));

      // Clear current campaign data and replace with imported
      const otherCampaigns = localData.campaigns.filter(c => c.id !== context.campaignId);
      const otherThoughts = localData.thoughts.filter(t => t.campaign_id !== context.campaignId);
      const otherEntities = localData.entities.filter(e => e.campaign_id !== context.campaignId);

      // Merge with imported data
      localData.campaigns = [...otherCampaigns, ...importedCampaigns];
      localData.thoughts = [...otherThoughts, ...importedThoughts];
      localData.entities = [...otherEntities, ...importedEntities];

      // Save to storage
      dataStorageService.saveData(localData);

      return {
        success: true,
        summary: {
          campaignsImported: importedCampaigns.length,
          thoughtsImported: importedThoughts.length,
          entitiesImported: importedEntities.length,
          errors: []
        }
      };
    } catch (error) {
      return {
        success: false,
        summary: {
          campaignsImported: 0,
          thoughtsImported: 0,
          entitiesImported: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error occurred']
        }
      };
    }
  }
};
