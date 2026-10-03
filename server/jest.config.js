/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        diagnostics: { ignoreCodes: [151002] },
      },
    ],
  },
  setupFiles: ["<rootDir>/tests/setup.ts"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  testTimeout: 20000,
  // Tests share one MongoDB connection/database - avoid workers racing
  // each other over the same collections.
  maxWorkers: 1,
};
