import { EntityType } from '@/types/entities';

export interface FieldSchema {
  requiredFields: string[];
  optionalFields: string[];
  defaults: Record<string, any>;
}

export const EntitySchema: FieldSchema = {
  requiredFields: ['name', 'type', 'campaign_id', 'created_by', 'syncStatus'],
  optionalFields: [
    'id', 
    'localId', 
    'description', 
    'parentEntities', 
    'linkedEntities', 
    'attributes',
    'creationSource', 
    'createdLocally', 
    'modifiedLocally'
  ],
  defaults: {
    type: 'uncategorized' as EntityType,
    syncStatus: 'pending' as const,
    creationSource: 'manual' as const,
    parentEntities: [] as string[],
    linkedEntities: [] as string[],
    attributes: [] as any[],
    createdLocally: () => new Date(),
    modifiedLocally: () => new Date()
  }
};

export const ThoughtSchema: FieldSchema = {
  requiredFields: [
    'content', 
    'relatedEntities', 
    'timestamp', 
    'campaign_id', 
    'created_by', 
    'syncStatus'
  ],
  optionalFields: ['id', 'localId', 'gameDate', 'modifiedLocally'],
  defaults: {
    relatedEntities: [] as string[],
    timestamp: () => new Date(),
    syncStatus: 'pending' as const,
    modifiedLocally: () => new Date()
  }
};

export const CampaignSchema: FieldSchema = {
  requiredFields: [
    'name', 
    'created_by', 
    'members', 
    'created_at', 
    'updated_at', 
    'syncStatus'
  ],
  optionalFields: ['id', 'localId', 'description', 'modifiedLocally'],
  defaults: {
    members: [] as any[],
    created_at: () => new Date(),
    updated_at: () => new Date(),
    syncStatus: 'pending' as const,
    modifiedLocally: () => new Date()
  }
};
