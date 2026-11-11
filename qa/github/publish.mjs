// Publie le référentiel de test sur GitHub (labels, jalons, issues liées entre elles).
// Usage : node qa/github/publish.mjs <owner/repo>
// Idempotent : les issues déjà créées (même titre) sont réutilisées. Correspondance id -> n° dans issues.json
import { spawnSync } from "node:child_process";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { EXIGENCES, CAS, ANOMALIES } from "../referentiel.mjs";
import { resultats } from "../resultats.mjs";

const REPO = process.argv[2];
const OUT = join(dirname(fileURLToPath(import.meta.url)), "issues.json");
const map = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

function gh(method, path, body) {
  const args = ["api", "-X", method, `repos/${REPO}${path}`];
  if (body) args.push("--input", "-");
  const r = spawnSync("gh", args, { input: body ? JSON.stringify(body) : undefined, encoding: "utf8" });
  if (r.status !== 0 && !/already_exists/.test(r.stdout + r.stderr)) throw new Error(`${method} ${path}: ${r.stdout}${r.stderr}`);
  return r.stdout ? JSON.parse(r.stdout) : null;
}

// ---------- labels ----------
const LABELS = {
  exigence: ["1d76db", "Exigence du logiciel (fonctionnelle ou non fonctionnelle)"],
  "cas de test": ["5319e7", "Cas de test du plan de test"],
  anomalie: ["d73a4a", "Défaut détecté pendant la campagne"],
  critique: ["b60205", "Criticité / gravité critique"],
  majeure: ["fbca04", "Criticité / gravité majeure"],
  mineure: ["c2e0c6", "Criticité / gravité mineure"],
  fonctionnelle: ["0e8a16", "Exigence fonctionnelle"],
  "non fonctionnelle": ["006b75", "Exigence non fonctionnelle"],
  "niveau: unitaire": ["bfdadc", ""], "niveau: intégration": ["bfdadc", ""], "niveau: système": ["bfdadc", ""],
  "niveau: acceptation": ["bfdadc", ""], "niveau: changements/maintenance": ["bfdadc", ""],
  automatisé: ["ededed", "Test automatisé"], manuel: ["ededed", "Test manuel"],
};
for (const [name, [color, description]] of Object.entries(LABELS)) gh("POST", "/labels", { name, color, description });

// ---------- jalons (campagnes) ----------
const milestones = gh("GET", "/milestones?state=all") ?? [];
function milestone(title, description) {
  return (milestones.find((m) => m.title === title) ?? gh("POST", "/milestones", { title, description })).number;
}
const IT1 = milestone("Itération 1 — build v1.0.0", "Première exécution complète du plan de test sur la version du projet récupérée (v1.0.0).");
const IT2 = milestone("Itération 2 — build v1.0.1", "Correctifs, re-test de confirmation, non-régression et maintenance (v1.0.1).");

// ---------- issues ----------
const existing = new Map();
for (let page = 1; ; page++) {
  const list = gh("GET", `/issues?state=all&per_page=100&page=${page}`);
  if (!list.length) break;
  for (const i of list) existing.set(i.title, i.number);
}
function issue(id, title, body, labels, ms) {
  const full = `[${id}] ${title}`;
  const number = existing.get(full) ?? map[id] ?? gh("POST", "/issues", { title: full, body, labels, milestone: ms }).number;
  map[id] = number;
  writeFileSync(OUT, JSON.stringify(map, null, 2));
  return number;
}
const ref = (ids) => ids.map((x) => (map[x] ? `#${map[x]} (${x})` : x)).join(", ");
const critLabel = (c) => c.toLowerCase();
const niveauLabel = (n) =>
  n.startsWith("Unitaire") ? "niveau: unitaire" : n === "Intégration" ? "niveau: intégration" : n === "Acceptation" ? "niveau: acceptation" : n === "Tous" ? "niveau: changements/maintenance" : "niveau: système";

// exigences
for (const e of EXIGENCES) {
  const nf = e.id.startsWith("ENF");
  issue(e.id, e.titre, [
    `**Type :** ${nf ? `non fonctionnelle (${e.cat})` : "fonctionnelle"}  `,
    `**Criticité :** ${e.crit}`, "", "### Description", e.desc, "",
    "### Cas de test qui la vérifient", CAS.filter((c) => c.ex.includes(e.id)).map((c) => `- ${c.id} — ${c.titre}`).join("\n") || "_aucun_",
  ].join("\n"), ["exigence", nf ? "non fonctionnelle" : "fonctionnelle", critLabel(e.crit)]);
}

// cas de test
const r1 = resultats(1);
for (const c of CAS) {
  const r = r1[c.id];
  const res = r ? `${r.passed}/${r.total} vérifications réussies${r.echecs.length ? "\n\nÉchecs :\n" + r.echecs.map((x) => `- ${x}`).join("\n") : ""}` : "_à exécuter_";
  const ms = c.id.startsWith("TR") || c.id.startsWith("TM") ? IT2 : IT1;
  issue(c.id, c.titre, [
    `| Niveau | Type | Technique | Mode | Outil |`, `|---|---|---|---|---|`,
    `| ${c.niveau} | ${c.type} | ${c.tech} | ${c.mode === "auto" ? "automatisé" : "manuel"} | ${c.outil} |`, "",
    `**Vérifie :** ${ref(c.ex)}  `, `**Fichier :** \`${c.fichier}\``, "",
    "### Résultat — itération 1 (v1.0.0)", res,
  ].join("\n"), ["cas de test", niveauLabel(c.niveau), c.mode === "auto" ? "automatisé" : "manuel"], ms);
}

// anomalies
for (const a of ANOMALIES) {
  issue(a.id, a.titre, [
    `**Gravité :** ${a.grav}  `, `**Exigence(s) :** ${ref(a.ex)}  `, `**Détectée par :** ${ref(a.par)}`, "",
    "### Description", a.desc, "", "### Reproduction", a.repro, "",
    "### Cycle de vie", "Détectée → Confirmée → Corrigée → Re-testée → Fermée",
  ].join("\n"), ["anomalie", critLabel(a.grav)], a.id === "ANO-12" ? undefined : IT2);
}
console.log(JSON.stringify(map));
