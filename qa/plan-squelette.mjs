// Génère les squelettes Playwright des 25 tests du plan (frontend/tests/plan/<type>/).
// Chaque test est déclaré avec test.fixme : il apparaît dans l'outil, mais reste « à écrire ».
// Usage : node qa/plan-squelette.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { PLAN, TYPES } from "./plan-evaluation.mjs";

const DOSSIER = { "Fonctionnel": "fonctionnels", "Non fonctionnel": "non-fonctionnels", "Structurel": "structurels", "Lié aux changements": "changements", "Maintenance": "maintenance" };
const q = (s) => JSON.stringify(s);

for (const y of TYPES) {
  const dir = new URL(`../frontend/tests/plan/${DOSSIER[y.famille]}/`, import.meta.url);
  mkdirSync(dir, { recursive: true });
  const tests = PLAN.filter((t) => t.famille === y.famille).map((t) => `
  // ${t.niveau} · ${t.tech}
  // Usage de Playwright : ${t.outil} · Exigences : ${t.ex.join(", ")}
  // Résultat attendu : ${t.attendu}
  test.fixme(${q(`${t.id} : ${t.titre}`)}, {
    tag: [${q("@" + y.prefixe)}, ${q("@" + t.niveau.toLowerCase())}],
    annotation: [
      { type: "responsable", description: ${q(t.resp)} },
      { type: "exigences", description: ${q(t.ex.join(", "))} },
    ],
  }, async (${/request|module/i.test(t.outil) && !/Navigateur/.test(t.outil) ? "{ request }" : "{ page }"}) => {
    // À écrire par ${t.resp}
  });
`).join("");
  writeFileSync(new URL(`${y.prefixe}.spec.js`, dir), `// ${y.titre} — ${y.question}
// ${y.def}
// Fichier généré par qa/plan-squelette.mjs : les tests sont planifiés (test.fixme), pas encore écrits.
import { test } from "@playwright/test";

test.describe(${q(y.titre)}, () => {${tests}});
`);
}
console.log("squelettes générés :", PLAN.length, "tests");
