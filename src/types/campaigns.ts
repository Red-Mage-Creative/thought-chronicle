export interface Campaign {
  id: string;          // MongoDB ObjectId
  name: string;
  description?: string;
  created_by: string;  // Supabase user ID
  members: CampaignMember[];
  created_at: Date;
  updated_at: Date;
}

export interface CampaignMember {
  user_id: string;     // Supabase user ID  
  role: 'dm' | 'player';
  joined_at: Date;
}

export interface CampaignWithMembers extends Campaign {
  member_count: number;
}

export interface LocalCampaign extends Campaign {
  localId?: string;
  syncStatus: 'pending' | 'synced' | 'conflict';
  modifiedLocally?: Date;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
}

export interface JoinCampaignData {
  inviteCode: string;
}