export interface BaseThought {
  id?: string;
  content: string;
  relatedEntities: string[];
  timestamp: Date;
  gameDate?: string;
}

export interface CampaignThought extends BaseThought {
  campaign_id: string;  // MongoDB ObjectId
  created_by: string;   // Supabase user ID
}

export interface LocalThought extends CampaignThought {
  localId?: string;
  modifiedLocally?: Date;
  syncStatus: 'pending' | 'synced' | 'conflict';
}