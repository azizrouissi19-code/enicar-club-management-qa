// Rend les diagrammes Mermaid en SVG (Edge piloté par Playwright).
// Usage : node qa/report/conception/rendre.mjs <chemin de mermaid.min.js>
import { chromium } from "@playwright/test";
import { writeFileSync, readFileSync } from "node:fs";
import { DIAGRAMMES } from "./diagrammes.mjs";

const mermaidJs = readFileSync(process.argv[2], "utf8");
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage();
await page.setContent("<!doctype html><html><body></body></html>");
await page.addScriptTag({ content: mermaidJs });
await page.evaluate(() => window.mermaid.initialize({
  startOnLoad: false, theme: "base", securityLevel: "loose",
  themeVariables: { primaryColor: "#e8eef8", primaryBorderColor: "#2f6db5", primaryTextColor: "#13233f", lineColor: "#5b6678", fontFamily: "Segoe UI, Arial, sans-serif", fontSize: "14px" },
  htmlLabels: false, flowchart: { htmlLabels: false, curve: "basis" },
}));
for (const [nom, code] of Object.entries(DIAGRAMMES)) {
  try {
    const svg = await page.evaluate(async ([id, src]) => (await window.mermaid.render(id, src)).svg, ["d-" + nom, code]);
    writeFileSync(new URL(`./${nom}.svg`, import.meta.url), svg);
    console.log("ok", nom);
  } catch (e) {
    console.log("ÉCHEC", nom, e.message.split("\n")[0]);
  }
}
await browser.close();
