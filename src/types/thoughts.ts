export interface BaseThought {
  id?: string;
  content: string;
  relatedEntities: string[];
  timestamp: Date;
  gameDate?: string;
}

export interface LocalThought extends BaseThought {
  localId?: string;
  modifiedLocally?: Date;
  syncStatus: 'pending' | 'synced' | 'conflict';
}