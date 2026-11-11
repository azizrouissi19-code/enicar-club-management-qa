// Tests système (E2E) : frontend React + backend Spring Boot + MySQL
// Prérequis : backend démarré sur http://localhost:9090
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "../qa/results/e2e-artifacts",
  timeout: 30000,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "../qa/results/e2e-results.json" }], ["html", { outputFolder: "../qa/results/e2e-report", open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    screenshot: "only-on-failure",
    viewport: { width: 1440, height: 900 },
    locale: "fr-FR",
  },
  projects: [
    { name: "edge", use: { channel: "msedge" } },
    { name: "firefox", use: { browserName: "firefox" } },
  ],
  webServer: {
    command: "npx vite --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60000,
  },
});
