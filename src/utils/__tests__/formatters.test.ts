import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatDate, formatDateTime, formatRelativeTime, capitalize, formatEntityCount } from '../formatters'

describe('formatters', () => {
  beforeEach(() => {
    // Mock the current date for consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const result = formatDate(date)
      expect(typeof result).toBe('string')
      expect(result).toContain('2024')
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const result = formatDateTime(date)
      expect(typeof result).toBe('string')
      expect(result).toContain('2024')
    })
  })

  describe('formatRelativeTime', () => {
    it('should return "just now" for very recent dates', () => {
      const now = new Date()
      const result = formatRelativeTime(now)
      expect(result).toBe('just now')
    })

    it('should format minutes correctly', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const result = formatRelativeTime(fiveMinutesAgo)
      expect(result).toBe('5 minutes ago')
    })

    it('should format singular minute correctly', () => {
      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000)
      const result = formatRelativeTime(oneMinuteAgo)
      expect(result).toBe('1 minute ago')
    })

    it('should format hours correctly', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      const result = formatRelativeTime(twoHoursAgo)
      expect(result).toBe('2 hours ago')
    })

    it('should format days correctly', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(threeDaysAgo)
      expect(result).toBe('3 days ago')
    })

    it('should fall back to date format for old dates', () => {
      const oldDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(oldDate)
      expect(result).not.toContain('ago')
      expect(typeof result).toBe('string')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter and lowercase the rest', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('HELLO')).toBe('Hello')
      expect(capitalize('hELLO')).toBe('Hello')
    })

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('')
    })

    it('should handle single characters', () => {
      expect(capitalize('a')).toBe('A')
      expect(capitalize('A')).toBe('A')
    })
  })

  describe('formatEntityCount', () => {
    it('should format single mention correctly', () => {
      expect(formatEntityCount(1)).toBe('1 mention')
    })

    it('should format plural mentions correctly', () => {
      expect(formatEntityCount(0)).toBe('0 mentions')
      expect(formatEntityCount(2)).toBe('2 mentions')
      expect(formatEntityCount(10)).toBe('10 mentions')
    })
  })
})