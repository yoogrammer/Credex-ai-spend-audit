/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
    },
    moduleNameMapper: {
        '^next/link$': '<rootDir>/tests/mocks/next-link.tsx',
        '^next/navigation$': '<rootDir>/tests/mocks/next-navigation.ts'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testMatch: ['**/?(*.)+(test|spec).ts?(x)']
}
