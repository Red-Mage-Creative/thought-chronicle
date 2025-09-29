import { getApiBaseUrl } from '@/utils/environment';

// Use environment configuration
const BASE_URL = getApiBaseUrl();

// Raw MongoDB structure from database
interface RawMongoThought {
  _id: { $oid: string };
  text: string;
  createdAt: { $date: { $numberLong: string } };
  updatedAt: { $date: { $numberLong: string } };
  inGameDate: string;
  relatedEntities: string[];
}

interface RawMongoEntity {
  _id: { $oid: string };
  createdAt: { $date: { $numberLong: string } };
  updatedAt: { $date: { $numberLong: string } };
  entityName: string;
  entityType: string;
  entityDescription: string;
}

// Transformed interfaces for components
export interface BuildshipThought {
  id: string;
  campaign_id: string;
  content: string;
  relatedEntities: string[];
  timestamp: Date;
  gameDate?: string;
  created_by: string;
}

export interface BuildshipEntity {
  id: string;
  campaign_id: string;
  name: string;
  type: string;
  count: number;
  lastMentioned: Date;
  description?: string;
  created_by: string;
}

// Utility function to parse MongoDB dates
const parseMongoDate = (mongoDate: { $date: { $numberLong: string } }): Date => {
  return new Date(parseInt(mongoDate.$date.$numberLong));
};

// Transform raw MongoDB thought to component format
const transformThought = (raw: RawMongoThought): BuildshipThought => ({
  id: raw._id.$oid,
  campaign_id: '', // Will be set by caller based on context
  content: raw.text,
  relatedEntities: raw.relatedEntities || [],
  timestamp: parseMongoDate(raw.createdAt),
  gameDate: raw.inGameDate !== 'TBD' ? raw.inGameDate : undefined,
  created_by: '', // Will be set by caller based on context
});

// Transform raw MongoDB entity to component format
const transformEntity = (raw: RawMongoEntity, count: number = 0, lastMentioned?: Date): BuildshipEntity => ({
  id: raw._id.$oid,
  campaign_id: '', // Will be set by caller based on context
  name: raw.entityName,
  type: raw.entityType,
  count,
  lastMentioned: lastMentioned || parseMongoDate(raw.updatedAt),
  description: raw.entityDescription,
  created_by: '', // Will be set by caller based on context
});

export const searchThoughts = async (
  query: string = "", 
  campaignId?: string, 
  userId?: string
): Promise<BuildshipThought[]> => {
  const params = new URLSearchParams({
    index_name: 'thoughts',
    collection: 'thoughts',
    query: query.trim()
  });

  // Add campaign filter if provided
  if (campaignId) {
    params.append('campaign_id', campaignId);
  }

  // Add user filter if provided
  if (userId) {
    params.append('user_id', userId);
  }

  const response = await fetch(`${BASE_URL}/chronicle-search?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to search thoughts: ${response.statusText}`);
  }

  const data = await response.json();
  const rawThoughts = data.results || data || [];
  
  // Transform MongoDB format to component format
  return rawThoughts.map((raw: RawMongoThought) => {
    const thought = transformThought(raw);
    return {
      ...thought,
      campaign_id: campaignId || '',
      created_by: userId || ''
    };
  });
};

export const searchEntities = async (
  query: string = "", 
  campaignId?: string, 
  userId?: string
): Promise<BuildshipEntity[]> => {
  const params = new URLSearchParams({
    index_name: 'entities',
    collection: 'entities', 
    query: query.trim()
  });

  // Add campaign filter if provided
  if (campaignId) {
    params.append('campaign_id', campaignId);
  }

  // Add user filter if provided
  if (userId) {
    params.append('user_id', userId);
  }

  const response = await fetch(`${BASE_URL}/chronicle-search?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to search entities: ${response.statusText}`);
  }

  const data = await response.json();
  const rawEntities = data.results || data || [];
  
  // Transform MongoDB format to component format
  return await Promise.all(rawEntities.map(async (raw: RawMongoEntity) => {
    const entity = transformEntity(raw, 0);
    return {
      ...entity,
      campaign_id: campaignId || '',
      created_by: userId || ''
    };
  }));
};

// New function to get entity counts and last mentioned dates from thoughts
export const getEntityMetrics = async (entities: BuildshipEntity[], thoughts: BuildshipThought[]): Promise<BuildshipEntity[]> => {
  const entityMetrics = new Map<string, { count: number; lastMentioned: Date }>();
  
  // Calculate metrics from thoughts
  thoughts.forEach(thought => {
    thought.relatedEntities.forEach(entityName => {
      const existing = entityMetrics.get(entityName) || { count: 0, lastMentioned: thought.timestamp };
      entityMetrics.set(entityName, {
        count: existing.count + 1,
        lastMentioned: thought.timestamp > existing.lastMentioned ? thought.timestamp : existing.lastMentioned
      });
    });
  });
  
  // Apply metrics to entities
  return entities.map(entity => {
    const metrics = entityMetrics.get(entity.name);
    return {
      ...entity,
      count: metrics?.count || 0,
      lastMentioned: metrics?.lastMentioned || entity.lastMentioned
    };
  });
};