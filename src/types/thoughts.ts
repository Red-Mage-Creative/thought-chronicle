export interface BaseThought {
  id?: string;
  content: string;
  
  // ID-based references (v1.3.0+) - Primary reference system
  relatedEntityIds?: string[];  // Array of entity IDs
  
  // Legacy name-based references (deprecated in v1.3.0, kept for backward compatibility)
  relatedEntities: string[];  // Deprecated: Use relatedEntityIds instead
  
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