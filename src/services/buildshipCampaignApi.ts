import { getApiBaseUrl } from '@/utils/environment';
import { Campaign, CreateCampaignData } from '@/types/campaigns';

const BASE_URL = getApiBaseUrl();

// Raw MongoDB structure for campaigns
interface RawMongoCampaign {
  _id: { $oid: string };
  name: string;
  description?: string;
  created_by: string;
  members: Array<{
    user_id: string;
    role: 'dm' | 'player';
    joined_at: { $date: { $numberLong: string } };
  }>;
  createdAt: { $date: { $numberLong: string } };
  updatedAt: { $date: { $numberLong: string } };
}

// Utility function to parse MongoDB dates
const parseMongoDate = (mongoDate: { $date: { $numberLong: string } }): Date => {
  return new Date(parseInt(mongoDate.$date.$numberLong));
};

// Transform raw MongoDB campaign to component format
const transformCampaign = (raw: RawMongoCampaign): Campaign => ({
  id: raw._id.$oid,
  name: raw.name,
  description: raw.description,
  created_by: raw.created_by,
  members: raw.members.map(member => ({
    user_id: member.user_id,
    role: member.role,
    joined_at: parseMongoDate(member.joined_at)
  })),
  created_at: parseMongoDate(raw.createdAt),
  updated_at: parseMongoDate(raw.updatedAt)
});

export const buildshipCampaignApi = {
  // Create new campaign
  async createCampaign(data: CreateCampaignData & { created_by: string }): Promise<Campaign> {
    const response = await fetch(`${BASE_URL}/create-campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        created_by: data.created_by,
        members: [{
          user_id: data.created_by,
          role: 'dm',
          joined_at: new Date().toISOString()
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create campaign: ${response.statusText}`);
    }

    const rawCampaign = await response.json();
    return transformCampaign(rawCampaign);
  },

  // Get user's campaigns
  async getUserCampaigns(userId: string): Promise<Campaign[]> {
    const params = new URLSearchParams({
      user_id: userId
    });

    const response = await fetch(`${BASE_URL}/user-campaigns?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get user campaigns: ${response.statusText}`);
    }

    const data = await response.json();
    const rawCampaigns = data.results || data || [];
    
    return rawCampaigns.map((raw: RawMongoCampaign) => transformCampaign(raw));
  },

  // Join existing campaign
  async joinCampaign(campaignId: string, userId: string, role: 'dm' | 'player' = 'player'): Promise<Campaign> {
    const response = await fetch(`${BASE_URL}/join-campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaign_id: campaignId,
        user_id: userId,
        role: role
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to join campaign: ${response.statusText}`);
    }

    const rawCampaign = await response.json();
    return transformCampaign(rawCampaign);
  },

  // Get campaign details
  async getCampaign(campaignId: string): Promise<Campaign> {
    const params = new URLSearchParams({
      campaign_id: campaignId
    });

    const response = await fetch(`${BASE_URL}/campaign-details?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get campaign: ${response.statusText}`);
    }

    const rawCampaign = await response.json();
    return transformCampaign(rawCampaign);
  }
};