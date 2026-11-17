// Configuration Playwright du plan de test (CR2) : 25 tests, 5 par type de test du cours.
// Lancement : npx playwright test -c playwright.plan.config.js        (ligne de commande)
//             npx playwright test -c playwright.plan.config.js --ui   (interface graphique UI Mode)
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/plan",          // fonctionnels/, non-fonctionnels/, structurels/, changements/, maintenance/
  outputDir: "../qa/results/plan-artifacts",
  timeout: 30000,
  reporter: [["list"], ["html", { outputFolder: "../qa/results/plan-report", open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",       // frontend React (Vite)
    extraHTTPHeaders: { Accept: "application/json" },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1440, height: 900 },
    locale: "fr-FR",
  },
  projects: [
    { name: "edge", use: { channel: "msedge" } },             // Microsoft Edge installé sur le poste
    { name: "firefox", use: { browserName: "firefox" } },     // Firefox téléchargé par « npx playwright install firefox »
  ],
  webServer: {
    command: "npx vite --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60000,
  },
});
