import { z } from 'zod';
import { LocalThought } from '@/types/thoughts';
import { LocalEntity } from '@/types/entities';
import { LocalCampaign } from '@/types/campaigns';

// MongoDB schemas based on our local data structures
export const MongoThoughtSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  relatedEntities: z.array(z.string()),
  timestamp: z.date(),
  gameDate: z.string().optional(),
  campaign_id: z.string().min(1, 'Campaign ID is required'),
  created_by: z.string().min(1, 'Creator ID is required'),
  modifiedLocally: z.date().optional(),
});

export const MongoEntitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['character', 'location', 'organization', 'item', 'uncategorized']),
  description: z.string().optional(),
  campaign_id: z.string().min(1, 'Campaign ID is required'),
  created_by: z.string().min(1, 'Creator ID is required'),
  creationSource: z.enum(['manual', 'auto']).optional(),
  createdLocally: z.date().optional(),
  modifiedLocally: z.date().optional(),
});

export const MongoCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  created_by: z.string().min(1, 'Creator ID is required'),
  members: z.array(z.object({
    user_id: z.string(),
    role: z.enum(['dm', 'player']),
    joined_at: z.date(),
  })),
  created_at: z.date(),
  updated_at: z.date(),
});

// Transformation functions to clean local data for MongoDB
export const transformThoughtForMongo = (thought: LocalThought) => {
  // Remove local-only fields
  const { localId, syncStatus, ...mongoThought } = thought;
  
  return MongoThoughtSchema.parse(mongoThought);
};

export const transformEntityForMongo = (entity: LocalEntity) => {
  // Remove local-only fields
  const { localId, syncStatus, ...mongoEntity } = entity;
  
  return MongoEntitySchema.parse(mongoEntity);
};

export const transformCampaignForMongo = (campaign: LocalCampaign) => {
  // Remove local-only fields
  const { localId, syncStatus, modifiedLocally, ...mongoCampaign } = campaign;
  
  return MongoCampaignSchema.parse(mongoCampaign);
};

export type MongoThought = z.infer<typeof MongoThoughtSchema>;
export type MongoEntity = z.infer<typeof MongoEntitySchema>;
export type MongoCampaign = z.infer<typeof MongoCampaignSchema>;