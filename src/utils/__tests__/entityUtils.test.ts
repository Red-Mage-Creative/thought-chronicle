import { describe, it, expect } from 'vitest'
import { 
  getEntityIcon, 
  getEntityClass, 
  inferEntityType, 
  normalizeEntityType, 
  isValidEntityType,
  getAllEntityTypes,
  generateLocalId,
  createEntitiesFromTags
} from '../entityUtils'
import { User, MapPin, Sword, Building, Tag } from 'lucide-react'

describe('entityUtils', () => {
  describe('getEntityIcon', () => {
    it('should return correct icons for entity types', () => {
      expect(getEntityIcon('character')).toBe(User)
      expect(getEntityIcon('location')).toBe(MapPin)
      expect(getEntityIcon('item')).toBe(Sword)
      expect(getEntityIcon('organization')).toBe(Building)
      expect(getEntityIcon('uncategorized')).toBe(Tag)
    })

    it('should return default icon for unknown types', () => {
      expect(getEntityIcon('unknown' as any)).toBe(Tag)
    })
  })

  describe('getEntityClass', () => {
    it('should return correct CSS classes for entity types', () => {
      expect(getEntityClass('character')).toContain('entity-player')
      expect(getEntityClass('location')).toContain('entity-location')
      expect(getEntityClass('item')).toContain('entity-item')
      expect(getEntityClass('organization')).toContain('entity-organization')
      expect(getEntityClass('uncategorized')).toContain('entity-uncategorized')
    })
  })

  describe('inferEntityType', () => {
    it('should correctly infer character types', () => {
      expect(inferEntityType('Sir Galahad')).toBe('character')
      expect(inferEntityType('King Arthur')).toBe('character')
      expect(inferEntityType('Dr. Smith')).toBe('character')
    })

    it('should correctly infer location types', () => {
      expect(inferEntityType('Camelot')).toBe('location')
      expect(inferEntityType('The Tavern')).toBe('location')
      expect(inferEntityType('Blackwood Forest')).toBe('location')
    })

    it('should correctly infer item types', () => {
      expect(inferEntityType('Excalibur')).toBe('item')
      expect(inferEntityType('Health Potion')).toBe('item')
      expect(inferEntityType('Magic Sword')).toBe('item')
    })

    it('should correctly infer organization types', () => {
      expect(inferEntityType('Knights of the Round Table')).toBe('organization')
      expect(inferEntityType('The Guild')).toBe('organization')
      expect(inferEntityType('Order of Mages')).toBe('organization')
    })

    it('should return uncategorized for unclear names', () => {
      expect(inferEntityType('xyz123')).toBe('uncategorized')
      expect(inferEntityType('random')).toBe('uncategorized')
    })
  })

  describe('normalizeEntityType', () => {
    it('should normalize valid entity types', () => {
      expect(normalizeEntityType('character')).toBe('character')
      expect(normalizeEntityType('location')).toBe('location')
    })

    it('should map legacy types', () => {
      expect(normalizeEntityType('player')).toBe('character')
      expect(normalizeEntityType('npc')).toBe('character')
    })

    it('should return uncategorized for invalid types', () => {
      expect(normalizeEntityType('invalid')).toBe('uncategorized')
    })
  })

  describe('isValidEntityType', () => {
    it('should validate correct entity types', () => {
      expect(isValidEntityType('character')).toBe(true)
      expect(isValidEntityType('location')).toBe(true)
      expect(isValidEntityType('item')).toBe(true)
      expect(isValidEntityType('organization')).toBe(true)
      expect(isValidEntityType('uncategorized')).toBe(true)
    })

    it('should reject invalid entity types', () => {
      expect(isValidEntityType('invalid')).toBe(false)
      expect(isValidEntityType('')).toBe(false)
    })
  })

  describe('getAllEntityTypes', () => {
    it('should return all valid entity types', () => {
      const types = getAllEntityTypes()
      expect(types).toContain('character')
      expect(types).toContain('location')
      expect(types).toContain('item')
      expect(types).toContain('organization')
      expect(types).toContain('uncategorized')
      expect(types).toHaveLength(5)
    })
  })

  describe('generateLocalId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateLocalId()
      const id2 = generateLocalId()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })
  })

  describe('createEntitiesFromTags', () => {
    it('should create entities for new tags', () => {
      const tagNames = ['Sir Galahad', 'Camelot', 'Excalibur']
      const existingNames = ['sir galahad'] // Case insensitive check
      
      const result = createEntitiesFromTags(tagNames, existingNames)
      
      expect(result).toHaveLength(2) // Should skip 'Sir Galahad' as it exists
      expect(result.find(e => e.name === 'Camelot')).toBeDefined()
      expect(result.find(e => e.name === 'Excalibur')).toBeDefined()
    })

    it('should infer correct types for created entities', () => {
      const tagNames = ['King Arthur', 'The Tavern']
      const existingNames: string[] = []
      
      const result = createEntitiesFromTags(tagNames, existingNames)
      
      expect(result.find(e => e.name === 'King Arthur')?.type).toBe('character')
      expect(result.find(e => e.name === 'The Tavern')?.type).toBe('location')
    })

    it('should handle empty arrays', () => {
      expect(createEntitiesFromTags([], [])).toEqual([])
    })
  })
})