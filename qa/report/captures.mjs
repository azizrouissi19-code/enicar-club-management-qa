// Captures d'écran pour le rapport : pages GitHub (dépôt public) et rapports HTML locaux.
import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { mkdirSync, readFileSync } from "node:fs";

const OUT = resolve("qa/report/img");
mkdirSync(OUT, { recursive: true });
const REPO = "https://github.com/azizrouissi19-code/enicar-club-management-qa";
const MAP = JSON.parse(readFileSync("qa/github/issues.json", "utf8"));
const file = (p) => pathToFileURL(resolve(p)).href;

const PAGES = [
  ["gh-exigences", `${REPO}/issues?q=label%3Aexigence%20sort%3Acreated-asc`, 1300],
  ["gh-anomalies", `${REPO}/issues?q=label%3Aanomalie%20sort%3Acreated-asc`, 1300],
  ["gh-cas", `${REPO}/issues?q=label%3A%22cas%20de%20test%22%20sort%3Acreated-asc`, 1300],
  ["gh-ano01", `${REPO}/issues/${MAP["ANO-01"]}`, 1100],
  ["gh-ti03", `${REPO}/issues/${MAP["TI-03"]}`, 1500],
  ["gh-milestones", `${REPO}/milestones?state=all`, 700],
  ["gh-pr", `${REPO}/pull/71`, 1200],
  ["cov-front", file("qa/results/coverage-frontend-iteration2/index.html"), 900],
  ["cov-back", file("qa/results/coverage-backend-iteration2/index.html"), 650],
  ["cov-back-reservation", file("qa/results/coverage-backend-iteration2/com.example.backend.controller/ReservationController.java.html"), 1500],
  ["e2e-report", file("qa/results/e2e-report/index.html"), 1300],
];

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: "fr-FR" });
for (const [name, url, height] of PAGES) {
  try {
    await page.setViewportSize({ width: 1280, height });
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log("ok", name);
  } catch (e) {
    console.log("ÉCHEC", name, e.message.split("\n")[0]);
  }
}
await browser.close();
