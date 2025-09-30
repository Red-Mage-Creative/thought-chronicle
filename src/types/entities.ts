export type EntityType = 'pc' | 'npc' | 'race' | 'religion' | 'quest' | 'enemy' | 'location' | 'organization' | 'item' | 'plot-thread' | 'uncategorized';

export interface EntityAttribute {
  key: string;
  value: string;
}

export interface DefaultEntityAttribute {
  id?: string;
  key: string;
  defaultValue?: string;
  required: boolean;
  entityTypes: EntityType[];
}

export interface BaseEntity {
  id?: string;
  name: string;
  type: EntityType;
  description?: string;
  
  // ID-based references (v1.3.0+) - Primary reference system
  parentEntityIds?: string[];  // Array of entity IDs representing hierarchical parents
  linkedEntityIds?: string[];  // Array of entity IDs representing non-hierarchical relationships
  
  // Legacy name-based references (deprecated in v1.3.0, kept for backward compatibility)
  parentEntities?: string[];  // Deprecated: Use parentEntityIds instead
  linkedEntities?: string[];  // Deprecated: Use linkedEntityIds instead
  
  attributes?: EntityAttribute[];  // Array of key-value pairs
}

export interface CampaignEntity extends BaseEntity {
  campaign_id: string;  // MongoDB ObjectId
  created_by: string;   // Supabase user ID
}

export interface LocalEntity extends CampaignEntity {
  localId?: string;
  modifiedLocally?: Date;
  syncStatus: 'pending' | 'synced' | 'conflict';
  creationSource?: 'manual' | 'auto';
  createdLocally?: Date;
}

export interface EntityMetrics {
  count: number;
  lastMentioned?: Date;
}

export interface EntityWithMetrics extends LocalEntity {
  metrics: EntityMetrics;
}

export interface EntitySuggestion {
  name: string;
  type: EntityType;
}