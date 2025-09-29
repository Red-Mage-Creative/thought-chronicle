export type EntityType = 'character' | 'location' | 'organization' | 'item' | 'uncategorized';

export interface BaseEntity {
  id?: string;
  name: string;
  type: EntityType;
  description?: string;
}

export interface LocalEntity extends BaseEntity {
  localId?: string;
  modifiedLocally?: Date;
  syncStatus: 'pending' | 'synced' | 'conflict';
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