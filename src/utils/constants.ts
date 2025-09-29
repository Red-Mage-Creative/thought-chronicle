import { Users, MapPin, Package, Shield, Scroll } from 'lucide-react';
import { EntityType } from '@/types/entities';

// Standardized entity types
export const ENTITY_TYPES = {
  CHARACTER: 'character' as const,
  LOCATION: 'location' as const,
  ORGANIZATION: 'organization' as const,
  ITEM: 'item' as const,
} as const;

// Entity type mapping for icons
export const ENTITY_ICONS = {
  [ENTITY_TYPES.CHARACTER]: Users,
  [ENTITY_TYPES.LOCATION]: MapPin,
  [ENTITY_TYPES.ORGANIZATION]: Shield,
  [ENTITY_TYPES.ITEM]: Package,
  // Legacy support
  player: Users,
  npc: Users,
  place: MapPin,
  city: MapPin,
  weapon: Package,
  artifact: Package,
  guild: Shield,
  faction: Shield,
} as const;

// Entity type mapping for CSS classes
export const ENTITY_CLASSES = {
  [ENTITY_TYPES.CHARACTER]: 'entity-tag entity-npc',
  [ENTITY_TYPES.LOCATION]: 'entity-tag entity-location',
  [ENTITY_TYPES.ORGANIZATION]: 'entity-tag entity-organization',
  [ENTITY_TYPES.ITEM]: 'entity-tag entity-item',
  // Legacy support
  player: 'entity-player',
  npc: 'entity-npc',
  place: 'entity-location',
  city: 'entity-location',
  weapon: 'entity-item',
  artifact: 'entity-item',
  guild: 'entity-organization',
  faction: 'entity-organization',
} as const;

// Type inference patterns
export const TYPE_INFERENCE_PATTERNS = {
  [ENTITY_TYPES.CHARACTER]: [
    'king', 'queen', 'lord', 'lady', 'sir', 'captain', 'priest', 'wizard', 'ranger',
    'he', 'she', 'they', 'i', 'player', 'npc'
  ],
  [ENTITY_TYPES.LOCATION]: [
    'city', 'town', 'village', 'castle', 'temple', 'tavern', 'forest', 'mountain', 'river'
  ],
  [ENTITY_TYPES.ORGANIZATION]: [
    'guild', 'order', 'house', 'clan', 'company', 'faction'
  ],
  [ENTITY_TYPES.ITEM]: [
    'sword', 'shield', 'ring', 'potion', 'scroll', 'armor', 'weapon', 'staff', 'artifact'
  ],
} as const;

export type EntityTypeKey = keyof typeof ENTITY_TYPES;

// Magic strings and constants
export const STORAGE_KEYS = {
  LOCAL_DATA: 'dnd_chronicle_data',
  DEFAULT_TAGS: 'dnd_chronicle_default_tags',
} as const;

export const VALIDATION = {
  MAX_CONTENT_LENGTH: 500,
  MAX_CONTENT_DISPLAY_LENGTH: 600,
  MAX_SUGGESTIONS: 5,
  MAX_FILTER_ENTITIES: 8,
} as const;

export const MESSAGES = {
  ENTITY_CREATED_SINGLE: 'Created 1 new entity',
  ENTITY_CREATED_MULTIPLE: (count: number) => `Created ${count} new entities`,
  SYNC_SUCCESS: 'Archives updated successfully',
  SYNC_ERROR: 'Failed to refresh chronicles',
  NO_ENTITIES_FOUND: 'No entities found. Start writing chronicles to create entities!',
  NO_THOUGHTS_FOUND: 'No thoughts found',
  SEARCH_PLACEHOLDER: 'Search entities...',
  TAG_PLACEHOLDER: 'Add additional entity tags...',
} as const;