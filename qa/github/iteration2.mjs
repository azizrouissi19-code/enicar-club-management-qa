// Publie les résultats de l'itération 2 sur GitHub : commentaires sur les cas de test,
// verdict des exigences, statut des anomalies ouvertes. Usage : node qa/github/iteration2.mjs <owner/repo>
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { EXIGENCES, CAS, STATUT, ANOMALIES } from "../referentiel.mjs";
import { resultats } from "../resultats.mjs";

const REPO = process.argv[2];
const MAP = JSON.parse(readFileSync(new URL("./issues.json", import.meta.url), "utf8"));
const gh = (method, path, body) => {
  const r = spawnSync("gh", ["api", "-X", method, `repos/${REPO}${path}`, "--input", "-"], { input: JSON.stringify(body ?? {}), encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stdout + r.stderr);
};
const comment = (id, body) => gh("POST", `/issues/${MAP[id]}/comments`, { body });
const close = (id, reason = "completed") => gh("PATCH", `/issues/${MAP[id]}`, { state: "closed", state_reason: reason });

// Résultats des cas non automatisés par Jest/Playwright (mesures relevées dans qa/results)
export const MANUELS = {
  1: {
    "TNF-01": "Réussi — k6, 50 utilisateurs : p95 = 359 ms, 0 % d'erreurs (10 932 requêtes).",
    "TNF-02": "Échec — `npm audit --omit=dev` : 5 vulnérabilités hautes (ANO-13).",
    "TNF-03": "Échec — ESLint : 8 erreurs ; PMD : 2 alertes ; revue de code : ANO-01, ANO-02, ANO-14, ANO-15.",
    "TNF-04": "Réussi — instructions couvertes : frontend 80,1 %, backend 98 %. À noter : 24 tests d'API échouent malgré 98 % de couverture (une règle absente ne se mesure pas).",
  },
  2: {
    "TA-01": "Réussi — 6/6 étapes conformes (qa/acceptance/TA-fiches.md).",
    "TA-02": "Réussi — 5/5 étapes conformes.",
    "TA-03": "Réussi — 7/7 étapes conformes (dont test exploratoire : approbation directe par l'API refusée, 403).",
    "TNF-01": "Réussi — p95 = 357 ms, 0 % d'erreurs (10 728 requêtes) sur la version sécurisée.",
    "TNF-02": "Réussi — 0 vulnérabilité dans les dépendances de production après `npm audit fix`.",
    "TNF-03": "Réussi — ESLint : 0 erreur ; PMD : 5 alertes (2 complexités acceptées, 3 faux positifs du framework). 7 alertes introduites par les correctifs ont été corrigées.",
    "TNF-04": "Réussi — instructions couvertes : frontend 79 %, backend 75 % (≥ 70 %).",
    "TNF-05": "Réussi avec réserve — données identiques avant/après redémarrage ; les sessions sont perdues (ANO-16).",
    "TR-01": "Réussi — tous les cas en échec à l'itération 1 réussissent, sauf les 2 vérifications liées à ANO-12 (non corrigée).",
    "TR-02": "Réussi — Jest unitaires 69/71, API 45/45, E2E 22/22 (Edge + Firefox), k6 conforme. Une régression (ANO-18) a été détectée, corrigée et re-testée (TS-04 répété 10 fois : 10/10).",
    "TM-01": "Réussi avec réserve — 45/45 tests d'API sur MariaDB 10.4 ; avertissement Hibernate HHH000511 (ANO-17).",
  },
};

const VERDICT = { "EF-10": "Non satisfaite (ANO-12)", "EF-01": "Satisfaite avec réserve (ANO-16)", "ENF-08": "Satisfaite avec réserve (ANO-16)", "ENF-10": "Satisfaite avec réserve (ANO-17)" };
export const verdict = (id) => VERDICT[id] ?? "Satisfaite";

if (process.argv[1].endsWith("iteration2.mjs")) {
  const r1 = resultats(1), r2 = resultats(2);
  const fmt = (r) => (r ? `${r.passed}/${r.total} vérifications réussies${r.echecs.length ? "\n" + r.echecs.map((e) => `- échec : ${e}`).join("\n") : ""}` : null);
  for (const c of CAS) {
    const it1 = MANUELS[1][c.id];
    if (it1) comment(c.id, `### Résultat — itération 1 (v1.0.0)\n${it1}`);
    const res = fmt(r2[c.id]) ?? MANUELS[2][c.id] ?? "—";
    const avant = r1[c.id] ? ` (itération 1 : ${r1[c.id].passed}/${r1[c.id].total})` : "";
    comment(c.id, `### Résultat — itération 2 (v1.0.1)${avant}\n${res}`);
    close(c.id);
  }
  for (const e of EXIGENCES) {
    const v = verdict(e.id);
    comment(e.id, `### Verdict après l'itération 2 (v1.0.1)\n**${v}**`);
    if (v === "Satisfaite") close(e.id);
  }
  for (const a of ANOMALIES) if (STATUT[a.id].startsWith("Ouverte")) comment(a.id, `Statut après l'itération 2 : **${STATUT[a.id]}**`);
  console.log("ok");
}
