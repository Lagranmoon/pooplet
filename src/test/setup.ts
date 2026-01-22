// Test setup file for Vitest
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

// Mock environment variables for testing
beforeAll(() => {
  // Set up test environment variables
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
  process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'
})

// Clean up after all tests
afterAll(() => {
  // Clean up any global state
})

// Reset state before each test
beforeEach(() => {
  // Reset any mocks or state
})

// Clean up after each test
afterEach(() => {
  // Clean up any test-specific state
})