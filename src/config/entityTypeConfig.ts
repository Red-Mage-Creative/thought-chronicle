import { UserCheck, Users, Footprints, Church, ScrollText, Skull, MapPin, Shield, Package, Network } from 'lucide-react';
import { EntityType } from '@/types/entities';
import { LucideIcon } from 'lucide-react';

export interface EntityTypeConfig {
  value: EntityType;
  label: string;
  icon: LucideIcon;
}

/**
 * Centralized entity type configuration
 * This is the single source of truth for all entity types in the application.
 * Used by forms, settings, utilities, and display components.
 */
export const ENTITY_TYPE_CONFIGS: EntityTypeConfig[] = [
  { value: 'pc', label: 'Player Character', icon: UserCheck },
  { value: 'npc', label: 'NPC', icon: Users },
  { value: 'race', label: 'Race', icon: Footprints },
  { value: 'religion', label: 'Religion', icon: Church },
  { value: 'quest', label: 'Quest', icon: ScrollText },
  { value: 'enemy', label: 'Enemy', icon: Skull },
  { value: 'location', label: 'Location', icon: MapPin },
  { value: 'organization', label: 'Organization', icon: Shield },
  { value: 'item', label: 'Item', icon: Package },
  { value: 'plot-thread', label: 'Plot Thread', icon: Network }
];

/**
 * Get all entity type values as an array
 */
export const getAllEntityTypeValues = (): EntityType[] => 
  ENTITY_TYPE_CONFIGS.map(config => config.value);

/**
 * Get the display label for an entity type
 */
export const getEntityTypeLabel = (type: EntityType): string => 
  ENTITY_TYPE_CONFIGS.find(config => config.value === type)?.label || type;

/**
 * Get the icon component for an entity type
 */
export const getEntityTypeIcon = (type: EntityType): LucideIcon | undefined => 
  ENTITY_TYPE_CONFIGS.find(config => config.value === type)?.icon;

/**
 * Get the full configuration for an entity type
 */
export const getEntityTypeConfig = (type: EntityType): EntityTypeConfig | undefined => 
  ENTITY_TYPE_CONFIGS.find(config => config.value === type);
