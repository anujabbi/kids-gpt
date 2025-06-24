
// This file can be used to run tests programmatically if needed
// The main way to run tests will be through npm scripts

export const testConfig = {
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  setupFiles: ['./src/test/setup.ts'],
  environment: 'jsdom'
}
