// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest', // Важно для TypeScript
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1', // Если используете алиасы путей
    },
    modulePaths: [
        "<rootDir>"
    ],
    moduleDirectories: [
        "node_modules"
    ]
};

export default config;