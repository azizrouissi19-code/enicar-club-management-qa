// Reproduction ciblée d'une régression (ANO-18)
import base from "./playwright.config.js";

export default {
  ...base,
  testDir: "./tests/regression",
  outputDir: "../qa/results/regression-artifacts",
  reporter: [["line"]],
  projects: [{ name: "edge", use: { channel: "msedge" } }],
};
