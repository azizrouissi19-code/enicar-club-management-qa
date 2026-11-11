// Aide à l'exécution des tests d'acceptation (fiches qa/acceptance/TA-fiches.md)
import base from "./playwright.config.js";

export default {
  ...base,
  testDir: "./tests/acceptance",
  outputDir: "../qa/results/acceptance-artifacts",
  reporter: [["list"]],
  projects: [{ name: "edge", use: { channel: "msedge" } }],
};
