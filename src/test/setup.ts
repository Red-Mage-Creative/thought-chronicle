import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage for tests
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock window.dispatchEvent for tests
Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
  writable: true,
})