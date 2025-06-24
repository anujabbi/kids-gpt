
import '@testing-library/jest-dom'

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock console methods to avoid noise in tests
global.console.warn = vi.fn()
global.console.error = vi.fn()
