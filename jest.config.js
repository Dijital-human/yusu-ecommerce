/**
 * Jest Configuration / Jest Konfiqurasiyası
 * This file configures Jest for testing the Next.js application
 * Bu fayl Next.js tətbiqi üçün Jest test konfiqurasiyasını təyin edir
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  // Next.js tətbiqinizin yolunu təmin edin ki, next.config.js və .env faylları yüklənsin
  dir: './',
})

// Add any custom config to be passed to Jest / Jest-ə ötürüləcək xüsusi konfiqurasiya əlavə et
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// createJestConfig bu şəkildə export edilir ki, next/jest Next.js konfiqurasiyasını yükləyə bilsin
module.exports = createJestConfig(customJestConfig)
