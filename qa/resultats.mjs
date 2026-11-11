// Agrège les résultats bruts (Jest JSON, Playwright JSON) par cas de test (TU-xx, TI-xx, TS-xx).
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RES = join(dirname(fileURLToPath(import.meta.url)), "results");
const read = (f) => (existsSync(join(RES, f)) ? JSON.parse(readFileSync(join(RES, f), "utf8")) : null);
const idOf = (name) => (name.match(/\b(TU|TI|TS|TA|TNF|TR|TM)-\d+/) || [])[0];

function add(map, id, ok, detail) {
  if (!id) return;
  map[id] ??= { total: 0, passed: 0, echecs: [] };
  map[id].total++;
  if (ok) map[id].passed++;
  else map[id].echecs.push(detail);
}

/** Résultats d'une itération : { "TU-01": {total, passed, echecs[]} , ... } */
export function resultats(iteration) {
  const map = {};
  for (const f of [`jest-unit-iteration${iteration}.json`, `jest-api-iteration${iteration}.json`]) {
    const j = read(f);
    if (!j) continue;
    for (const s of j.testResults)
      for (const t of s.assertionResults) add(map, idOf(t.fullName), t.status === "passed", t.title);
  }
  const e2e = read(`e2e-iteration${iteration}.json`);
  if (e2e) {
    const walk = (suite, titles = []) => {
      for (const sp of suite.specs ?? [])
        for (const t of sp.tests) {
          const ok = t.results.at(-1)?.status === "passed";
          const id = idOf([...titles, sp.title].join(" "));
          add(map, id, ok, `[${t.projectName}] ${sp.title}`);
          add(map, "TS-08", ok, `[${t.projectName}] ${id} ${sp.title}`);
        }
      for (const s of suite.suites ?? []) walk(s, [...titles, s.title]);
    };
    for (const s of e2e.suites) walk(s);
  }
  return map;
}

/** Totaux par famille (unit, api, e2e) */
export function totaux(iteration) {
  const out = {};
  for (const [k, f] of [["unit", `jest-unit-iteration${iteration}.json`], ["api", `jest-api-iteration${iteration}.json`]]) {
    const j = read(f);
    if (j) out[k] = { total: j.numTotalTests, passed: j.numPassedTests, failed: j.numFailedTests };
  }
  const e = read(`e2e-iteration${iteration}.json`);
  if (e) out.e2e = { total: e.stats.expected + e.stats.unexpected + (e.stats.flaky || 0), passed: e.stats.expected, failed: e.stats.unexpected };
  return out;
}
