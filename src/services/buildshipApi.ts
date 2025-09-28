const BASE_URL = 'https://xn93r8.buildship.run';

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
}

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
  
  // Transform the response to match our Thought interface
  return (data.results || data || []).map((item: any) => ({
    ...item,
    timestamp: new Date(item.timestamp)
  }));
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
  
  // Transform the response to match our Entity interface
  return (data.results || data || []).map((item: any) => ({
    ...item,
    lastMentioned: new Date(item.lastMentioned)
  }));
};