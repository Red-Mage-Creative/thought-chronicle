import { EntityType } from '@/types/entities';

// Standardized interfaces to eliminate duplication
export interface StandardThought {
  id?: string;
  localId?: string;
  content: string;
  relatedEntities: string[];
  timestamp: Date;
  gameDate?: string;
  syncStatus?: 'pending' | 'synced' | 'conflict';
  modifiedLocally?: Date;
}

export interface StandardEntityWithMetrics {
  id?: string;
  localId?: string;
  name: string;
  type: EntityType;
  description?: string;
  syncStatus?: 'pending' | 'synced' | 'conflict';
  modifiedLocally?: Date;
  metrics: {
    count: number;
    lastMentioned?: Date;
  };
}

export interface EntitySuggestionStandard {
  name: string;
  type: EntityType;
}

export interface CreateEntityData {
  name: string;
  type: EntityType;
  description?: string;
}