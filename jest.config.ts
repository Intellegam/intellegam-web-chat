import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  testEnvironment: 'node', // Different from official docs - we need node for API routes
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  // coveragePathIgnorePatterns: [
  //   "/node_modules/"
  // ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // Setup files
  //setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  // Test patterns - only run integration tests, not component tests
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/test/e2e/', // Your Playwright tests
  ],

  // Module mapping for absolute imports (from your tsconfig.json)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Coverage settings
  collectCoverageFrom: [
    '<rootDir>/app/api/**/*.{ts,js}',
    '<rootDir>/lib/**/*.{ts,js}',
    '!<rootDir>/**/*.d.ts',
  ],

  // Timeout for database operations
  testTimeout: 30000,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
