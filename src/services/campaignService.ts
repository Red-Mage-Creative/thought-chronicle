import { Campaign, LocalCampaign, CreateCampaignData, JoinCampaignData } from '@/types/campaigns';
import { dataStorageService } from './dataStorageService';
import { buildshipCampaignApi } from './buildshipCampaignApi';
import { supabase } from '@/integrations/supabase/client';

export const campaignService = {
  // Create new campaign (user becomes DM)
  async createCampaign(data: CreateCampaignData): Promise<LocalCampaign> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to create campaigns');

    const campaign: Omit<LocalCampaign, 'localId' | 'syncStatus'> = {
      id: '', // Will be set by MongoDB
      name: data.name,
      description: data.description,
      created_by: user.id,
      members: [{
        user_id: user.id,
        role: 'dm',
        joined_at: new Date()
      }],
      created_at: new Date(),
      updated_at: new Date()
    };

    // Add to local storage
    const localCampaign = dataStorageService.addCampaign(campaign);
    
    // Set as current campaign
    dataStorageService.setCurrentContext(localCampaign.localId!, user.id);
    
    return localCampaign;
  },

  // Get user's campaigns from local storage
  getUserCampaigns(): LocalCampaign[] {
    const data = dataStorageService.getData();
    return data.campaigns;
  },

  // Join existing campaign
  async joinCampaign(data: JoinCampaignData): Promise<Campaign> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to join campaigns');

    // This would be implemented with Buildship API
    // For now, throw not implemented
    throw new Error('Join campaign not implemented yet');
  },

  // Switch active campaign (updates localStorage)
  async switchCampaign(campaignId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated');

    dataStorageService.setCurrentContext(campaignId, user.id);
    
    // Dispatch custom event for UI refresh
    window.dispatchEvent(new CustomEvent('campaignSwitched', { 
      detail: { campaignId } 
    }));
  },

  // Get current campaign context
  getCurrentCampaign(): LocalCampaign | null {
    const data = dataStorageService.getData();
    const { campaignId } = dataStorageService.getCurrentContext();
    
    if (!campaignId) return null;
    
    return data.campaigns.find(c => c.localId === campaignId || c.id === campaignId) || null;
  },

  // Get current campaign ID
  getCurrentCampaignId(): string | null {
    const { campaignId } = dataStorageService.getCurrentContext();
    return campaignId;
  },

  // Get current user ID
  getCurrentUserId(): string | null {
    const { userId } = dataStorageService.getCurrentContext();
    return userId;
  },

  // Initialize user context on app start
  initializeUserContext(userId: string): void {
    const data = dataStorageService.getData();
    
    // Set user context if not already set
    if (!data.currentUserId) {
      dataStorageService.setCurrentContext(data.currentCampaignId, userId);
    }
  },

  // Create default campaign for new users
  async createDefaultCampaign(userId: string, userName: string): Promise<LocalCampaign> {
    const campaignData: CreateCampaignData = {
      name: `${userName}'s Campaign`,
      description: 'Your first D&D campaign'
    };

    return await this.createCampaign(campaignData);
  },

  // Update existing campaign
  async updateCampaign(campaignId: string, data: Partial<CreateCampaignData>): Promise<LocalCampaign> {
    const localData = dataStorageService.getData();
    const campaignIndex = localData.campaigns.findIndex(c => c.localId === campaignId || c.id === campaignId);
    
    if (campaignIndex === -1) {
      throw new Error('Campaign not found');
    }

    const updatedCampaign = {
      ...localData.campaigns[campaignIndex],
      ...data,
      updated_at: new Date(),
      modifiedLocally: new Date(),
      syncStatus: 'pending' as const
    };

    localData.campaigns[campaignIndex] = updatedCampaign;
    
    // Add to pending changes
    const pendingId = updatedCampaign.id || updatedCampaign.localId!;
    if (!localData.pendingChanges.campaigns.modified.includes(pendingId)) {
      localData.pendingChanges.campaigns.modified.push(pendingId);
    }

    dataStorageService.saveData(localData);
    return updatedCampaign;
  },

  // Get campaign statistics
  getCampaignStats(campaignId: string): { thoughtsCount: number; entitiesCount: number } {
    const data = dataStorageService.getCampaignData(campaignId);
    return {
      thoughtsCount: data.thoughts.length,
      entitiesCount: data.entities.length
    };
  },

  // Delete campaign with data migration options
  async deleteCampaign(
    campaignId: string, 
    migrationOptions: { action: 'move' | 'delete'; targetCampaignId?: string }
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated');

    const localData = dataStorageService.getData();
    const campaignIndex = localData.campaigns.findIndex(c => c.localId === campaignId || c.id === campaignId);
    
    if (campaignIndex === -1) {
      throw new Error('Campaign not found');
    }

    // Prevent deletion of last campaign
    if (localData.campaigns.length <= 1) {
      throw new Error('Cannot delete the last campaign. You must have at least one campaign.');
    }

    const campaign = localData.campaigns[campaignIndex];
    const campaignData = dataStorageService.getCampaignData(campaignId);

    // Handle data migration
    if (migrationOptions.action === 'move' && migrationOptions.targetCampaignId) {
      // Move thoughts to target campaign
      campaignData.thoughts.forEach(thought => {
        const thoughtIndex = localData.thoughts.findIndex(t => t.localId === thought.localId);
        if (thoughtIndex !== -1) {
          localData.thoughts[thoughtIndex] = {
            ...thought,
            campaign_id: migrationOptions.targetCampaignId!,
            modifiedLocally: new Date(),
            syncStatus: 'pending'
          };
        }
      });

      // Move entities to target campaign
      campaignData.entities.forEach(entity => {
        const entityIndex = localData.entities.findIndex(e => e.localId === entity.localId);
        if (entityIndex !== -1) {
          localData.entities[entityIndex] = {
            ...entity,
            campaign_id: migrationOptions.targetCampaignId!,
            modifiedLocally: new Date(),
            syncStatus: 'pending'
          };
        }
      });
    } else if (migrationOptions.action === 'delete') {
      // Delete all associated thoughts
      campaignData.thoughts.forEach(thought => {
        const thoughtIndex = localData.thoughts.findIndex(t => t.localId === thought.localId);
        if (thoughtIndex !== -1) {
          localData.thoughts.splice(thoughtIndex, 1);
          // Add to pending deletions
          const thoughtId = thought.id || thought.localId!;
          if (!localData.pendingChanges.thoughts.deleted.includes(thoughtId)) {
            localData.pendingChanges.thoughts.deleted.push(thoughtId);
          }
        }
      });

      // Delete all associated entities
      campaignData.entities.forEach(entity => {
        const entityIndex = localData.entities.findIndex(e => e.localId === entity.localId);
        if (entityIndex !== -1) {
          localData.entities.splice(entityIndex, 1);
          // Add to pending deletions
          const entityId = entity.id || entity.localId!;
          if (!localData.pendingChanges.entities.deleted.includes(entityId)) {
            localData.pendingChanges.entities.deleted.push(entityId);
          }
        }
      });
    }

    // Remove the campaign
    localData.campaigns.splice(campaignIndex, 1);
    
    // Add campaign to pending deletions
    const campaignIdToDelete = campaign.id || campaign.localId!;
    if (!localData.pendingChanges.campaigns.deleted.includes(campaignIdToDelete)) {
      localData.pendingChanges.campaigns.deleted.push(campaignIdToDelete);
    }

    // Switch to another campaign if we're deleting the current one
    if (localData.currentCampaignId === campaignId) {
      const newCurrentCampaign = localData.campaigns[0];
      if (newCurrentCampaign) {
        localData.currentCampaignId = newCurrentCampaign.localId!;
      }
    }

    dataStorageService.saveData(localData);
    
    // Dispatch campaign switched event
    window.dispatchEvent(new CustomEvent('campaignSwitched', { 
      detail: { campaignId: localData.currentCampaignId } 
    }));
  }
};