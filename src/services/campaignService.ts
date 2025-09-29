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
  }
};