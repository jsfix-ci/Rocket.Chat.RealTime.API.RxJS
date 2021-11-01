/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "tsx"],
  transform: { "^.+\\.(ts|tsx)$": "ts-jest" },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  testMatch: ["**/tests/*.+(ts|tsx|js)"],
  coverageDirectory: "./coverage/",
  collectCoverage: true,
};
