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
  parentEntities?: string[];  // Array of entity IDs/names representing hierarchical parents
  linkedEntities?: string[];  // Array of entity IDs/names representing non-hierarchical relationships
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