import { describe, it, expect, vi, beforeEach } from 'vitest'
import { businessLogicService } from '../businessLogicService'
import { entityService } from '../entityService'
import { thoughtService } from '../thoughtService'

// Mock the services
vi.mock('../entityService')
vi.mock('../thoughtService')
vi.mock('@/utils/entityUtils', () => ({
  createEntitiesFromTags: vi.fn(() => []),
  generateLocalId: vi.fn(() => 'test-id')
}))

describe('businessLogicService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createEntitySuggestions', () => {
    it('should create suggestions from entities and thoughts', () => {
      const entities = [
        { name: 'Arthur', type: 'character' },
        { name: 'Camelot', type: 'location' }
      ]
      const thoughts = [
        { relatedEntities: ['Merlin', 'Arthur'] },
        { relatedEntities: ['Excalibur'] }
      ]

      const result = businessLogicService.createEntitySuggestions(entities, thoughts)

      expect(result).toEqual([
        { name: 'Arthur', type: 'character' },
        { name: 'Camelot', type: 'location' },
        { name: 'Merlin', type: 'character' },
        { name: 'Excalibur', type: 'character' }
      ])
    })

    it('should handle empty inputs', () => {
      const result = businessLogicService.createEntitySuggestions([], [])
      expect(result).toEqual([])
    })

    it('should not duplicate entities', () => {
      const entities = [{ name: 'Arthur', type: 'character' }]
      const thoughts = [{ relatedEntities: ['Arthur', 'arthur'] }] // Different case

      const result = businessLogicService.createEntitySuggestions(entities, thoughts)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Arthur')
    })
  })

  describe('validateContentLength', () => {
    it('should validate content correctly', () => {
      expect(businessLogicService.validateContentLength('Valid content')).toEqual({
        isValid: true,
        isOverLimit: false,
        characterCount: 13
      })

      expect(businessLogicService.validateContentLength('')).toEqual({
        isValid: false,
        isOverLimit: false,
        characterCount: 0
      })

      expect(businessLogicService.validateContentLength('   ')).toEqual({
        isValid: false,
        isOverLimit: false,
        characterCount: 3
      })
    })

    it('should detect content over limit', () => {
      const longContent = 'a'.repeat(3000)
      const result = businessLogicService.validateContentLength(longContent)
      
      expect(result.isValid).toBe(false)
      expect(result.isOverLimit).toBe(true)
      expect(result.characterCount).toBe(3000)
    })
  })

  describe('formatEntityCreationMessage', () => {
    it('should format single entity message', () => {
      const result = businessLogicService.formatEntityCreationMessage(1, ['Arthur'])
      expect(result).toContain('Arthur')
    })

    it('should format multiple entities message', () => {
      const result = businessLogicService.formatEntityCreationMessage(2, ['Arthur', 'Merlin'])
      expect(result).toContain('2')
      expect(result).toContain('Arthur')
      expect(result).toContain('Merlin')
    })

    it('should return empty string for zero entities', () => {
      const result = businessLogicService.formatEntityCreationMessage(0, [])
      expect(result).toBe('')
    })
  })

  describe('processThoughtCreation', () => {
    beforeEach(() => {
      vi.mocked(entityService.getAllEntities).mockReturnValue([])
      vi.mocked(entityService.createEntity).mockReturnValue({
        localId: 'entity-id',
        name: 'Test Entity',
        type: 'character',
        syncStatus: 'pending',
        modifiedLocally: new Date(),
        createdLocally: new Date(),
        campaign_id: 'test-campaign',
        created_by: 'test-user'
      })
      vi.mocked(thoughtService.createThought).mockReturnValue({
        localId: 'thought-id',
        content: 'Test thought',
        relatedEntities: [],
        timestamp: new Date(),
        syncStatus: 'pending',
        modifiedLocally: new Date(),
        campaign_id: 'test-campaign',
        created_by: 'test-user'
      })
    })

    it('should throw error for empty content', async () => {
      await expect(
        businessLogicService.processThoughtCreation('', [], [])
      ).rejects.toThrow('Content cannot be empty')
    })

    it('should throw error for content over limit', async () => {
      const longContent = 'a'.repeat(3000)
      await expect(
        businessLogicService.processThoughtCreation(longContent, [], [])
      ).rejects.toThrow('Content exceeds maximum length')
    })

    it('should process valid thought creation', async () => {
      const result = await businessLogicService.processThoughtCreation(
        'Valid content',
        ['tag1'],
        ['tag2'],
        '2024-01-01'
      )

      expect(result).toHaveProperty('thought')
      expect(result).toHaveProperty('newEntitiesCreated')
      expect(result).toHaveProperty('entityNames')
      expect(thoughtService.createThought).toHaveBeenCalledWith(
        'Valid content',
        ['tag2', 'tag1'],
        '2024-01-01'
      )
    })
  })
})