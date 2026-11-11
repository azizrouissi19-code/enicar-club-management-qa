/** Configuration Jest — Atelier Test Logiciel
 *  - projet "unit"  : composants React et logique (jsdom, API simulée)
 *  - projet "api"   : tests d'intégration de l'API Spring Boot réelle (node)
 */
module.exports = {
  coverageDirectory: "../qa/results/coverage-frontend",
  coverageReporters: ["text", "text-summary", "html", "json-summary"],
  collectCoverageFrom: ["src/**/*.{js,jsx}", "!src/main.jsx"],
  projects: [
    {
      displayName: "unit",
      clearMocks: true,
      collectCoverageFrom: ["<rootDir>/src/**/*.{js,jsx}", "!<rootDir>/src/main.jsx"],
      testEnvironment: "jsdom",
      roots: ["<rootDir>/tests/unit"],
      setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
      moduleNameMapper: { "\.(css|less|scss)$": "identity-obj-proxy" },
    },
    {
      displayName: "api",
      testEnvironment: "node",
      roots: ["<rootDir>/tests/api"],
    },
  ],
};
