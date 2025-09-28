const BASE_URL = 'https://xn93r8.buildship.run';

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
  content: string;
  entities: string[];
  timestamp: Date;
  gameDate?: string;
}

export interface BuildshipEntity {
  name: string;
  type: string;
  count: number;
  lastMentioned: Date;
  description?: string;
}

// Utility function to parse MongoDB dates
const parseMongoDate = (mongoDate: { $date: { $numberLong: string } }): Date => {
  return new Date(parseInt(mongoDate.$date.$numberLong));
};

// Transform raw MongoDB thought to component format
const transformThought = (raw: RawMongoThought): BuildshipThought => ({
  id: raw._id.$oid,
  content: raw.text,
  entities: raw.relatedEntities || [],
  timestamp: parseMongoDate(raw.createdAt),
  gameDate: raw.inGameDate !== 'TBD' ? raw.inGameDate : undefined,
});

// Transform raw MongoDB entity to component format
const transformEntity = (raw: RawMongoEntity, count: number = 0, lastMentioned?: Date): BuildshipEntity => ({
  name: raw.entityName,
  type: raw.entityType,
  count,
  lastMentioned: lastMentioned || parseMongoDate(raw.updatedAt),
  description: raw.entityDescription,
});

export const searchThoughts = async (query: string = ""): Promise<BuildshipThought[]> => {
  const params = new URLSearchParams({
    index_name: 'thoughts',
    collection: 'thoughts',
    query: query.trim()
  });

  const response = await fetch(`${BASE_URL}/chronicle-search?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to search thoughts: ${response.statusText}`);
  }

  const data = await response.json();
  const rawThoughts = data.results || data || [];
  
  // Transform MongoDB format to component format
  return rawThoughts.map((raw: RawMongoThought) => transformThought(raw));
};

export const searchEntities = async (query: string = ""): Promise<BuildshipEntity[]> => {
  const params = new URLSearchParams({
    index_name: 'entities',
    collection: 'entities', 
    query: query.trim()
  });

  const response = await fetch(`${BASE_URL}/chronicle-search?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to search entities: ${response.statusText}`);
  }

  const data = await response.json();
  const rawEntities = data.results || data || [];
  
  // Transform MongoDB format to component format and calculate entity metrics
  return await Promise.all(rawEntities.map(async (raw: RawMongoEntity) => {
    // For now, return basic entity data - count calculation would need thoughts data
    return transformEntity(raw, 0);
  }));
};

// New function to get entity counts and last mentioned dates from thoughts
export const getEntityMetrics = async (entities: BuildshipEntity[], thoughts: BuildshipThought[]): Promise<BuildshipEntity[]> => {
  const entityMetrics = new Map<string, { count: number; lastMentioned: Date }>();
  
  // Calculate metrics from thoughts
  thoughts.forEach(thought => {
    thought.entities.forEach(entityName => {
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