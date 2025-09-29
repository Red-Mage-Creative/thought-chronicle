import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEntities } from '../useEntities'
import { entityService } from '@/services/entityService'
import { thoughtService } from '@/services/thoughtService'

// Mock the services
vi.mock('@/services/entityService')
vi.mock('@/services/thoughtService')

describe('useEntities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up default mocks
    vi.mocked(entityService.getAllEntities).mockReturnValue([
      {
        localId: '1',
        name: 'Arthur',
        type: 'character',
        syncStatus: 'synced',
        modifiedLocally: new Date(),
        createdLocally: new Date(),
        campaign_id: 'test-campaign',
        created_by: 'test-user'
      }
    ])
    
    vi.mocked(thoughtService.getAllThoughts).mockReturnValue([
      {
        localId: '1',
        content: 'Arthur defeated the dragon',
        relatedEntities: ['Arthur'],
        timestamp: new Date(),
        syncStatus: 'synced',
        modifiedLocally: new Date(),
        campaign_id: 'test-campaign',
        created_by: 'test-user'
      }
    ])
    
    vi.mocked(entityService.getEntitiesWithMetrics).mockReturnValue([
      {
        localId: '1',
        name: 'Arthur',
        type: 'character',
        syncStatus: 'synced',
        modifiedLocally: new Date(),
        createdLocally: new Date(),
        campaign_id: 'test-campaign',
        created_by: 'test-user',
        metrics: { count: 1, lastMentioned: new Date() }
      }
    ])
  })

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useEntities())
    
    expect(result.current.isLoading).toBe(true)
  })

  it('should load entities and calculate metrics', async () => {
    const { result } = renderHook(() => useEntities())
    
    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.entities).toHaveLength(1)
    expect(result.current.entitiesWithMetrics).toHaveLength(1)
    expect(result.current.entitiesWithMetrics[0].metrics.count).toBe(1)
  })

  it('should create new entity', async () => {
    vi.mocked(entityService.createEntity).mockReturnValue({
      localId: '2',
      name: 'Merlin',
      type: 'character',
      syncStatus: 'pending',
      modifiedLocally: new Date(),
      createdLocally: new Date()
    })

    const { result } = renderHook(() => useEntities())
    
    await act(async () => {
      await result.current.createEntity('Merlin', 'character', 'Wise wizard')
    })
    
    expect(entityService.createEntity).toHaveBeenCalledWith(
      'Merlin',
      'character',
      'Wise wizard',
      'manual'
    )
  })

  it('should generate suggestions from entities', async () => {
    const { result } = renderHook(() => useEntities())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    const suggestions = result.current.getSuggestions()
    expect(suggestions).toEqual([
      { name: 'Arthur', type: 'character' }
    ])
  })

  it('should handle errors gracefully', async () => {
    vi.mocked(entityService.getAllEntities).mockImplementation(() => {
      throw new Error('Test error')
    })

    const { result } = renderHook(() => useEntities())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.entities).toEqual([])
  })
})