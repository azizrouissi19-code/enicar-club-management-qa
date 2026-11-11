// Génère le rapport HTML (imprimé ensuite en PDF) à partir du référentiel et des résultats réels.
import { writeFileSync, readFileSync } from "node:fs";
import { EXIGENCES, CAS, ANOMALIES, STATUT } from "../referentiel.mjs";
import { resultats, totaux } from "../resultats.mjs";
import { MANUELS, verdict } from "../github/iteration2.mjs";

const ISSUES = JSON.parse(readFileSync(new URL("../github/issues.json", import.meta.url), "utf8"));
const REPO = "https://github.com/azizrouissi19-code/enicar-club-management-qa";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const r1 = resultats(1), r2 = resultats(2), t1 = totaux(1), t2 = totaux(2);
const TA = JSON.parse(readFileSync(new URL("../results/acceptance/TA-results.json", import.meta.url), "utf8"));
let fig = 0;
const img = (src, cap, w = 100) => `<figure style="width:${w}%"><img src="${src}"><figcaption>Figure ${++fig} – ${cap}</figcaption></figure>`;
const pair = (a, ca, b, cb) => `<div class="pair">${img(a, ca, 49)}${img(b, cb, 49)}</div>`;
const res = (r) => (r ? `${r.passed}/${r.total}` : "—");
const ok = (r) => r && r.passed === r.total;
const badge = (txt, cls) => `<span class="b ${cls}">${txt}</span>`;
const statusCell = (r, manuel) => {
  if (r) return ok(r) ? badge(res(r), "ok") : badge(res(r), "ko");
  if (!manuel) return "—";
  return badge(manuel.split(" — ")[0], manuel.startsWith("Échec") ? "ko" : manuel.includes("réserve") ? "wa" : "ok");
};
const casOf = (e) => CAS.filter((c) => c.ex.includes(e)).map((c) => c.id);
const issue = (id) => `<a href="${REPO}/issues/${ISSUES[id]}">#${ISSUES[id]}</a>`;
const code = (s) => `<pre>${esc(s.trim())}</pre>`;
const gravCls = (g) => (g === "Critique" ? "ko" : g === "Majeure" ? "wa" : "mi");
const stCls = (s) => (s.startsWith("Corrigée") ? "ok" : "wa");

const it1 = ANOMALIES.slice(0, 15);
const nb = (g, list = it1) => list.filter((a) => a.grav === g).length;
const statiques = ["ANO-01", "ANO-02", "ANO-13", "ANO-14", "ANO-15"];
const anoCorr = ANOMALIES.filter((a) => STATUT[a.id].startsWith("Corrigée")).length;
const ex = { total: EXIGENCES.length, sat: EXIGENCES.filter((e) => verdict(e.id) === "Satisfaite").length, res: EXIGENCES.filter((e) => verdict(e.id).includes("réserve")).length, non: EXIGENCES.filter((e) => verdict(e.id).startsWith("Non")).length };

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport atelier test logiciel</title>
<style>
@page{size:A4;margin:16mm 15mm 16mm 15mm}
:root{--c:#1f3a68;--c2:#2f6db5;--soft:#eef3fa;--line:#c9d3e0}
*{box-sizing:border-box}body{font-family:"Segoe UI",Calibri,Arial,sans-serif;font-size:10pt;line-height:1.45;color:#1b1b1b;background:#fff;margin:0}
h1{color:var(--c);font-size:18pt;border-bottom:3px solid var(--c2);padding-bottom:4px;margin:0 0 10px;page-break-before:always}
h2{color:var(--c2);font-size:12.5pt;margin:16px 0 6px;page-break-after:avoid}h3{color:var(--c);font-size:10.8pt;margin:12px 0 4px;page-break-after:avoid}
p{margin:4px 0 7px;text-align:justify}ul{margin:3px 0 8px;padding-left:20px}li{margin:2px 0}
table{width:100%;border-collapse:collapse;margin:6px 0 11px;font-size:8.6pt}tr{page-break-inside:avoid}
th{background:var(--c);color:#fff;text-align:left;padding:4px 5px;font-weight:600}td{border:1px solid var(--line);padding:3px 5px;vertical-align:top}
tr:nth-child(even) td{background:#f7f9fc}
pre{font-family:Consolas,monospace;font-size:7.9pt;background:#f4f6f9;border-left:3px solid var(--c2);padding:7px 9px;white-space:pre-wrap;margin:5px 0 9px;page-break-inside:avoid}
code{font-family:Consolas,monospace;font-size:8.6pt;background:#f1f3f6;padding:0 3px}
figure{margin:6px auto 10px;page-break-inside:avoid;text-align:center}figure img{max-width:100%;border:1px solid #cfd6e0}
figcaption{font-size:8.3pt;color:#444;margin-top:3px}.pair{display:flex;justify-content:space-between;gap:2%}
.b{display:inline-block;padding:0 6px;border-radius:9px;font-size:8pt;font-weight:600;white-space:nowrap}.ok{background:#dcf2e3;color:#14592b}.ko{background:#fbe1df;color:#8b1a14}.wa{background:#fff0cf;color:#7a5200}.mi{background:#e6ecf3;color:#36495e}
.note{background:var(--soft);border-left:4px solid var(--c2);padding:6px 10px;margin:8px 0}.warn{background:#fff4e5;border-left:4px solid #e08a00;padding:6px 10px;margin:8px 0}
.kpis{display:flex;gap:7px;margin:9px 0 12px}.kpi{flex:1;background:var(--soft);border-radius:6px;padding:7px;text-align:center}.kpi b{display:block;font-size:15pt;color:var(--c)}.kpi span{font-size:8pt}
.cover{height:262mm;display:flex;flex-direction:column;justify-content:space-between}
.cover .top{color:var(--c2);font-weight:700;letter-spacing:1px;font-size:10pt}.cover .t{font-size:28pt;color:var(--c);font-weight:800;line-height:1.15;margin-top:40px}
.cover .s{font-size:13pt;margin-top:10px}.band{background:var(--c);color:#fff;padding:14px 18px;border-radius:6px}.band div{margin:3px 0}
.toc div{display:flex;justify-content:space-between;border-bottom:1px dotted #aaa;padding:3px 0}.toc .l2{padding-left:18px;font-size:9.3pt;color:#333}
.arch{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:8px 0 4px;font-size:8.6pt}.box{border:1.5px solid var(--c2);border-radius:6px;padding:6px 8px;background:#fafcff}.box b{color:var(--c)}
.verdict{border:2px solid #e08a00;background:#fff8ec;padding:9px 12px;border-radius:6px;margin:8px 0;font-weight:600}
a{color:var(--c2);text-decoration:none}
</style></head><body>

<section class="cover">
<div><div class="top">ÉCOLE NATIONALE D'INGÉNIEURS DE CARTHAGE · ATELIER TEST LOGICIEL</div>
<div class="t">Plateforme de gestion des clubs de l'ENICarthage</div>
<div class="s">Rapport d'atelier — exigences, plan de test, exécution et recette</div>
<div class="kpis" style="margin-top:40px">
<div class="kpi"><b>${EXIGENCES.length}</b><span>exigences</span></div><div class="kpi"><b>${CAS.length}</b><span>cas de test</span></div>
<div class="kpi"><b>${t2.unit.total + t2.api.total}</b><span>tests Jest</span></div><div class="kpi"><b>${t2.e2e.total}</b><span>tests E2E (2 navigateurs)</span></div>
<div class="kpi"><b>${ANOMALIES.length}</b><span>anomalies détectées</span></div></div></div>
<div class="band"><div><b>Réalisé par :</b> Mohamed Aziz Rouissi · Mohamed Bouchahda · Mohamed Hosni Missaoui</div><div><b>Encadrement :</b> [Nom de l'encadrant]</div>
<div><b>Outil de test :</b> Jest 30 (+ React Testing Library) · Playwright · k6 · JaCoCo · ESLint · PMD</div>
<div><b>Gestion des tests et des exigences :</b> GitHub Issues, jalons et Pull Requests — <a style="color:#cfe0ff" href="${REPO}">${REPO.replace("https://", "")}</a></div>
<div><b>Date :</b> 11 novembre 2026 · Année universitaire 2026 – 2027</div></div>
</section>

<section class="toc"><h1>Sommaire</h1>
<div><span>1. Introduction et objectifs des ateliers</span></div><div><span>2. Choix du projet (objectif 1)</span></div>
<div><span>3. Installation de l'environnement de test</span></div><div><span>4. Besoins fonctionnels et non fonctionnels (objectif 2)</span></div>
<div><span>5. Outil de gestion des tests et des exigences : GitHub (objectif 3)</span></div><div><span>6. Plan de test (objectif 4)</span></div>
<div><span>7. Exécution du plan de test (objectif 5)</span></div>
<div class="l2"><span>7.1 Tests statiques · 7.2 Unitaires (Jest) · 7.3 Intégration (API) · 7.4 Structurels (couverture)</span></div>
<div class="l2"><span>7.5 Système (E2E) · 7.6 Acceptation · 7.7 Non fonctionnels · 7.8 Changements et maintenance · 7.9 Suivi sur GitHub</span></div>
<div><span>8. Bilan : anomalies, métriques et verdict de recette</span></div><div><span>9. Conclusion</span></div><div><span>10. Annexe : rejouer les tests</span></div>
</section>

<h1>1. Introduction et objectifs des ateliers</h1>
<p>Ce rapport présente la démarche de test menée sur notre plateforme de gestion des clubs de l'ENICarthage. Il suit les cinq objectifs fixés par l'atelier. Tous les résultats présentés proviennent d'exécutions réelles ; les fichiers bruts sont conservés dans le dossier <code>qa/results</code> du dépôt.</p>
<table><tr><th>Objectif</th><th>Travail réalisé</th><th>Chap.</th></tr>
<tr><td>1. Choisir un projet</td><td>Notre plateforme de gestion des clubs (Spring Boot + React + MySQL), lancée en local</td><td>2, 3</td></tr>
<tr><td>2. Présenter les besoins fonctionnels et non fonctionnels</td><td>${EXIGENCES.filter((e) => e.id.startsWith("EF")).length} exigences fonctionnelles et ${EXIGENCES.filter((e) => e.id.startsWith("ENF")).length} non fonctionnelles, identifiées et classées par criticité</td><td>4</td></tr>
<tr><td>3. Utiliser un outil de gestion de test (et des exigences)</td><td>GitHub : ${Object.keys(ISSUES).length} issues liées (exigences, cas de test, anomalies), libellés, 2 jalons (campagnes), Pull Request de correction ; matrice de traçabilité</td><td>5</td></tr>
<tr><td>4. Élaborer un plan de test</td><td>Plan IEEE 829 : 4 niveaux (unitaire, intégration, système, acceptation), 5 types (fonctionnel, non fonctionnel, structurel, lié aux changements, maintenance), stratégie basée sur les risques</td><td>6</td></tr>
<tr><td>5. Exécuter le plan de test</td><td>Techniques statiques et dynamiques, tests manuels et automatisés, 2 itérations ; ${ANOMALIES.length} anomalies dont ${anoCorr} corrigées et re-testées</td><td>7, 8</td></tr></table>
<div class="kpis"><div class="kpi"><b>${t1.unit.passed + t1.api.passed + t1.e2e.passed}/${t1.unit.total + t1.api.total + t1.e2e.total}</b><span>tests réussis — itération 1</span></div>
<div class="kpi"><b>${t2.unit.passed + t2.api.passed + t2.e2e.passed}/${t2.unit.total + t2.api.total + t2.e2e.total}</b><span>tests réussis — itération 2</span></div>
<div class="kpi"><b>${ex.sat + ex.res}/${ex.total}</b><span>exigences satisfaites (dont ${ex.res} avec réserve)</span></div>
<div class="kpi"><b>${anoCorr}/${ANOMALIES.length}</b><span>anomalies corrigées</span></div></div>

<h1>2. Choix du projet (objectif 1)</h1>
<h2>2.1 Présentation</h2>
<p>La plateforme centralise la vie associative de l'école : clubs, événements, salles, équipements et réservations de ressources. Elle repose sur trois profils :</p>
<table><tr><th>Profil</th><th>Rôle principal</th></tr>
<tr><td>Administration (<code>ADMINISTRATOR</code>)</td><td>Crée les clubs et le compte de leur président, gère les salles et les équipements, valide ou rejette les réservations</td></tr>
<tr><td>Président de club (<code>CLUB_PRESIDENT</code>)</td><td>Organise les événements de son club</td></tr>
<tr><td>Membre de club (<code>CLUB_MEMBER</code>)</td><td>S'inscrit, consulte les clubs et événements, réserve des ressources</td></tr></table>
<h2>2.2 Version testée</h2>
<p>Le dépôt GitHub de l'équipe ne contenait qu'une partie du frontend (fichiers vides ou tronqués, aucune trace du backend). La version complète a été récupérée depuis le Google Drive de l'équipe, versionnée et étiquetée <b>v1.0.0</b> : c'est la version testée lors de l'itération 1. Les correctifs forment la version <b>v1.0.1</b> (itération 2). Le tout est publié dans un nouveau dépôt : <a href="${REPO}">${REPO.replace("https://", "")}</a>.</p>
<h2>2.3 Pourquoi ce projet se prête au test</h2>
<ul><li><b>Application complète :</b> interface React, API REST Spring Boot, base MySQL : tous les niveaux de test s'appliquent.</li>
<li><b>Trois rôles :</b> terrain idéal pour les tests de contrôle d'accès (tables de décision rôle × action).</li>
<li><b>Règles métier testables :</b> capacité d'une salle (valeurs limites), cycle de vie d'une réservation (transitions d'états), adresse institutionnelle (partitions d'équivalence).</li>
<li><b>Données sensibles :</b> mots de passe et comptes, d'où des exigences de sécurité.</li></ul>
<h2>2.4 Architecture technique</h2>
<table><tr><th>Couche</th><th>Technologies</th></tr>
<tr><td>Frontend</td><td>React 19, Vite 8, React Router 7, Axios, Tailwind CSS</td></tr>
<tr><td>Backend</td><td>Java 17, Spring Boot 4.0, Spring Security, Spring Data JPA / Hibernate 7, Lombok, BCrypt</td></tr>
<tr><td>Base de données</td><td>MySQL (XAMPP), schéma généré par Hibernate (<code>ddl-auto=update</code>), données initiales par <code>DataLoader</code></td></tr></table>
${pair("../results/screenshots/TS01-1-login.png", "Page de connexion", "../results/screenshots/TS01-2-dashboard-admin.png", "Tableau de bord de l'administrateur (v1.0.1)")}

<h1>3. Installation de l'environnement de test</h1>
<h2>3.1 Outils</h2>
<table><tr><th>Outil</th><th>Version</th><th>Rôle</th></tr>
<tr><td>JDK / Maven Wrapper</td><td>17 · 3.9</td><td>Compilation et exécution du backend</td></tr>
<tr><td>Node.js / npm</td><td>24 · 11</td><td>Frontend, Jest, Playwright</td></tr>
<tr><td>Docker Desktop</td><td>29</td><td>MySQL 8.4, MariaDB 10.4 (maintenance), k6</td></tr>
<tr><td><b>Jest</b> + React Testing Library + user-event</td><td>30 · 16</td><td><b>Outil principal</b> : tests unitaires/composants (jsdom) et tests d'intégration de l'API (HTTP réel)</td></tr>
<tr><td>Playwright</td><td>1.x</td><td>Tests système E2E sur Microsoft Edge et Firefox ; aide à l'exécution des tests d'acceptation</td></tr>
<tr><td>k6 (grafana/k6)</td><td>Docker</td><td>Test de charge (50 utilisateurs virtuels)</td></tr>
<tr><td>JaCoCo</td><td>0.8.13</td><td>Couverture du backend (agent attaché au serveur pendant les tests)</td></tr>
<tr><td>ESLint · PMD/CPD · npm audit</td><td>9 · 7.7 · npm</td><td>Analyse statique JavaScript et Java, audit des dépendances</td></tr>
<tr><td>Git · GitHub · GitHub CLI</td><td>2.52 · gh 2.103</td><td>Gestion de version, des exigences, des tests et des anomalies</td></tr></table>
<h2>3.2 Architecture de l'environnement de test</h2>
<div class="arch">
<div class="box"><b>Jest — projet « unit »</b><br>jsdom, API simulée (<code>jest.mock</code>)<br>→ composants React</div>
<div class="box"><b>Jest — projet « api »</b><br>requêtes HTTP réelles<br>→ API Spring Boot :9090</div>
<div class="box"><b>Playwright</b> (Edge, Firefox)<br>→ React :5173 → API → MySQL</div>
<div class="box"><b>k6</b> (Docker)<br>→ API :9090 (50 utilisateurs)</div>
<div class="box"><b>Backend Spring Boot</b><br>+ agent JaCoCo (port 6300)<br>→ MySQL 8.4 (Docker, :3306)</div>
<div class="box"><b>GitHub</b><br>exigences, cas, anomalies (issues)<br>campagnes (jalons), correctifs (PR)</div></div>
<p style="font-size:8.5pt;color:#444;text-align:center">Figure ${++fig} – Architecture de l'environnement de test</p>
<h2>3.3 Problèmes rencontrés et solutions</h2>
<table><tr><th>Problème</th><th>Solution</th></tr>
<tr><td>Le dépôt GitHub de l'équipe était incomplet (backend absent, <code>ClubsPage.jsx</code> tronqué)</td><td>Version complète récupérée depuis le Drive, versionnée (v1.0.0) dans un nouveau dépôt</td></tr>
<tr><td>Le backend attend un MySQL XAMPP (root sans mot de passe)</td><td>MySQL 8.4 dans Docker avec la même configuration</td></tr>
<tr><td>Le projet Vite utilise des modules ES ; Jest ne les comprend pas nativement</td><td><code>babel.config.cjs</code> (preset-env + preset-react) ; <code>TextEncoder</code> ajouté pour React Router dans jsdom</td></tr>
<tr><td>PMD ne s'exécute pas avec des règles personnalisées en ligne de commande</td><td>Profil Maven <code>qa</code> dans <code>pom.xml</code> (règles bestpractices, errorprone, security, design)</td></tr>
<tr><td>Couverture JaCoCo d'une application lancée hors Maven</td><td>Agent JaCoCo en mode <code>tcpserver</code> ; vidage avec <code>jacococli dump</code> après chaque campagne</td></tr>
<tr><td>Le jeton GitHub n'a pas le droit <code>project</code></td><td>Suivi par issues, libellés et jalons ; le tableau GitHub Projects peut être ajouté après <code>gh auth refresh -s project</code></td></tr></table>

<h1>4. Besoins fonctionnels et non fonctionnels (objectif 2)</h1>
<p>Chaque exigence possède un identifiant unique, repris dans une issue GitHub (libellé <code>exigence</code>) pour la traçabilité. La criticité oriente l'effort de test (approche basée sur les risques).</p>
<h2>4.1 Exigences fonctionnelles</h2>
<table><tr><th>Réf.</th><th>Exigence</th><th>Description</th><th>Criticité</th><th>Issue</th></tr>
${EXIGENCES.filter((e) => e.id.startsWith("EF")).map((e) => `<tr><td>${e.id}</td><td>${esc(e.titre)}</td><td>${esc(e.desc)}</td><td>${e.crit}</td><td>${issue(e.id)}</td></tr>`).join("")}</table>
<h2>4.2 Exigences non fonctionnelles</h2>
<table><tr><th>Réf.</th><th>Exigence</th><th>Catégorie</th><th>Description (mesurable)</th><th>Criticité</th><th>Issue</th></tr>
${EXIGENCES.filter((e) => e.id.startsWith("ENF")).map((e) => `<tr><td>${e.id}</td><td>${esc(e.titre)}</td><td>${e.cat}</td><td>${esc(e.desc)}</td><td>${e.crit}</td><td>${issue(e.id)}</td></tr>`).join("")}</table>
<div class="note">Les besoins vagues du premier rapport (« temps acceptable », « plusieurs centaines d'utilisateurs ») ont été reformulés en seuils vérifiables (ENF-03 : p95 &lt; 500 ms à 50 utilisateurs ; ENF-04 : contenu ≥ 80 % de la largeur à 360 px). Cette revue des exigences est la première technique statique appliquée.</div>

<h1>5. Outil de gestion des tests et des exigences : GitHub (objectif 3)</h1>
<h2>5.1 Choix et organisation</h2>
<p>L'équipe gère déjà son code sur GitHub. Nous y avons aussi géré les exigences, les cas de test, les campagnes et les anomalies, pour garder la traçabilité au même endroit que le code et les correctifs.</p>
<table><tr><th>Fonction d'un outil de gestion de test</th><th>Réalisation dans GitHub</th></tr>
<tr><td>Référentiel des exigences</td><td>${EXIGENCES.length} issues <code>[EF-xx]</code> / <code>[ENF-xx]</code>, libellés <code>exigence</code>, <code>fonctionnelle</code>/<code>non fonctionnelle</code>, criticité</td></tr>
<tr><td>Cas de test rattachés aux exigences</td><td>${CAS.length} issues <code>[TU/TI/TS/TA/TNF/TR/TM-xx]</code> : niveau, type, technique, mode, fichier ; lien « Vérifie #n »</td></tr>
<tr><td>Campagnes d'exécution</td><td>Jalons « Itération 1 — build v1.0.0 » et « Itération 2 — build v1.0.1 »</td></tr>
<tr><td>Résultats d'exécution</td><td>Commentaire de résultat par itération sur chaque cas (x/y vérifications), fermeture une fois exécuté</td></tr>
<tr><td>Gestion des anomalies</td><td>${ANOMALIES.length} issues <code>[ANO-xx]</code> : gravité, exigence, test détecteur, reproduction</td></tr>
<tr><td>Traçabilité anomalie → correctif → re-test</td><td>Pull Request #71 « Fixes #n » : la fusion ferme les anomalies corrigées</td></tr>
<tr><td>Rapports</td><td>Filtres par libellé et jalon ; matrice générée depuis le référentiel (<code>qa/referentiel.mjs</code>)</td></tr></table>
<p>Pour éviter une saisie manuelle de ${Object.keys(ISSUES).length} issues, le référentiel est écrit une seule fois (<code>qa/referentiel.mjs</code>) puis publié par l'API GitHub (<code>qa/github/publish.mjs</code>). Le même fichier génère les tableaux de ce rapport, ce qui garantit leur cohérence.</p>
${img("img/gh-exigences.png", "Issues « exigence » du dépôt", 92)}
${img("img/gh-ti03.png", "Cas de test TI-03 : lien vers les exigences, résultats des deux itérations", 92)}
${img("img/gh-milestones.png", "Jalons = campagnes de test", 92)}
<h2>5.2 Matrice de traçabilité exigences → cas de test</h2>
<table><tr><th>Exigence</th><th>Criticité</th><th>Cas de test qui la vérifient</th><th>Verdict (v1.0.1)</th></tr>
${EXIGENCES.map((e) => { const v = verdict(e.id); return `<tr><td>${e.id} ${esc(e.titre)}</td><td>${e.crit}</td><td>${casOf(e.id).join(", ")}</td><td>${badge(v, v === "Satisfaite" ? "ok" : v.startsWith("Non") ? "ko" : "wa")}</td></tr>`; }).join("")}</table>
<div class="note"><b>Couverture des exigences : ${EXIGENCES.filter((e) => casOf(e.id).length).length}/${EXIGENCES.length} (100 %)</b> — chaque exigence est vérifiée par au moins un cas de test.</div>

<h1>6. Plan de test (objectif 4)</h1>
<p>Ce plan suit la structure de la norme IEEE 829 / ISO/IEC/IEEE 29119-3.</p>
<h2>6.1 Objet et périmètre</h2>
<table><tr><th>Dans le périmètre</th><th>Hors périmètre</th></tr><tr><td>Authentification, inscription, rôles · clubs · événements · salles · équipements · réservations · tableau de bord · profil/paramètres/notifications · sécurité de l'API · performance · affichage mobile · compatibilité · maintenabilité · dépendances · persistance · portabilité de la base</td><td>Déploiement en production ; envoi d'e-mails (non implémenté) ; accessibilité avancée (lecteurs d'écran)</td></tr></table>
<h2>6.2 Stratégie : approche basée sur les risques</h2>
<table><tr><th>Risque produit</th><th>Prob.</th><th>Impact</th><th>Priorité</th><th>Tests prévus</th></tr>
<tr><td>Action d'administration par un utilisateur non autorisé</td><td>Élevée</td><td>Critique</td><td>P1</td><td>Revue de code, TI-03, TU-02, TU-04</td></tr>
<tr><td>Fuite des mots de passe</td><td>Moyenne</td><td>Critique</td><td>P1</td><td>Revue, TI-01, TU-01</td></tr>
<tr><td>Double réservation d'une salle</td><td>Moyenne</td><td>Majeur</td><td>P1</td><td>TI-06, TS-05, TA-03</td></tr>
<tr><td>Événement dépassant la capacité d'une salle</td><td>Moyenne</td><td>Majeur</td><td>P1</td><td>TI-05, TA-02</td></tr>
<tr><td>Données incohérentes affichées</td><td>Moyenne</td><td>Majeur</td><td>P2</td><td>TU-05, TS-06</td></tr>
<tr><td>Erreur 500 sur une saisie invalide</td><td>Moyenne</td><td>Moyen</td><td>P2</td><td>TI-01 à TI-07</td></tr>
<tr><td>Lenteur en période d'inscription</td><td>Faible</td><td>Majeur</td><td>P2</td><td>TNF-01</td></tr>
<tr><td>Mauvais affichage sur smartphone</td><td>Moyenne</td><td>Moyen</td><td>P2</td><td>TS-07, TA-03</td></tr>
<tr><td>Dépendances vulnérables</td><td>Élevée</td><td>Majeur</td><td>P2</td><td>TNF-02</td></tr>
<tr><td>Perte de données au redémarrage</td><td>Faible</td><td>Critique</td><td>P2</td><td>TNF-05</td></tr></table>
<h2>6.3 Niveaux de test (cycle en V)</h2>
<table><tr><th>Phase de développement</th><th>Niveau de test</th><th>Cas</th><th>Objectif</th></tr>
<tr><td>Besoins (EF / ENF)</td><td>Acceptation</td><td>TA-01 … TA-03</td><td>Valider le besoin du point de vue de chaque profil</td></tr>
<tr><td>Spécifications</td><td>Système</td><td>TS-01 … TS-08, TNF-01, TNF-05</td><td>Application complète dans un navigateur réel</td></tr>
<tr><td>Conception (API REST, modèle JPA)</td><td>Intégration</td><td>TI-01 … TI-07</td><td>API + sécurité + base de données réelles</td></tr>
<tr><td>Codage</td><td>Unitaire / composant</td><td>TU-01 … TU-06, TNF-03, TNF-04</td><td>Composants React et logique isolés (API simulée)</td></tr></table>
<h2>6.4 Types de test par niveau</h2>
<table><tr><th>Niveau \\ Type</th><th>Fonctionnel</th><th>Non fonctionnel</th><th>Structurel</th><th>Lié aux changements</th><th>Maintenance</th></tr>
<tr><td>Unitaire</td><td>TU-01 … TU-06</td><td>TU-01 (sécurité), TNF-03</td><td>TNF-04 (Jest)</td><td>TR-01, TR-02</td><td>—</td></tr>
<tr><td>Intégration</td><td>TI-01, 02, 04 … 07</td><td>TI-03 (sécurité), TI-01</td><td>TNF-04 (JaCoCo)</td><td>TR-01, TR-02</td><td>TM-01</td></tr>
<tr><td>Système</td><td>TS-01 … TS-06</td><td>TS-07, TS-08, TNF-01, TNF-02, TNF-05</td><td>—</td><td>TR-02</td><td>TM-01</td></tr>
<tr><td>Acceptation</td><td>TA-01 … TA-03</td><td>TA-03 (mobile)</td><td>—</td><td>—</td><td>—</td></tr></table>
<h2>6.5 Techniques de test</h2>
<table><tr><th>Famille</th><th>Technique</th><th>Application</th></tr>
<tr><td rowspan="4">Statique</td><td>Revue des exigences</td><td>Reformulation des besoins en seuils mesurables (§ 4)</td></tr>
<tr><td>Revue de code</td><td>Contrôleurs, sécurité, configuration : ANO-01, ANO-02 et ANO-15 trouvées avant exécution</td></tr>
<tr><td>Analyse statique outillée</td><td>ESLint (JavaScript), PMD/CPD (Java)</td></tr>
<tr><td>Analyse de composition</td><td><code>npm audit</code> sur les dépendances de production</td></tr>
<tr><td rowspan="5">Dynamique boîte noire</td><td>Partitions d'équivalence</td><td>Identifiants valides/invalides, adresses institutionnelles ou non (TU-01, TI-01, TI-02)</td></tr>
<tr><td>Valeurs limites</td><td>Mot de passe 5/6 caractères ; capacité 40/41 ; capacité 0/−10 (TU-06, TI-02, TI-05, TI-07)</td></tr>
<tr><td>Table de décision</td><td>Routes protégées (6 règles), rôle × action (TU-02, TU-04, TI-03)</td></tr>
<tr><td>Transitions d'états</td><td>Réservation PENDING → APPROVED / REJECTED (TU-04, TI-06)</td></tr>
<tr><td>Cas d'utilisation</td><td>Scénarios multi-acteurs E2E et d'acceptation</td></tr>
<tr><td>Boîte blanche</td><td>Couverture instructions / branches</td><td>Jest --coverage, JaCoCo (TNF-04)</td></tr>
<tr><td>Expérience</td><td>Tests exploratoires</td><td>Revue visuelle des captures (ANO-09, ANO-11), appel direct de l'API (TA-03), redémarrage (TNF-05)</td></tr></table>
<h2>6.6 Tests manuels et automatisés</h2>
<table><tr><th>Mode</th><th>Cas</th><th>Outils</th></tr>
<tr><td>Automatisé</td><td>${CAS.filter((c) => c.mode === "auto").map((c) => c.id).join(", ")}</td><td>Jest, Playwright, k6, npm audit, JaCoCo</td></tr>
<tr><td>Manuel</td><td>${CAS.filter((c) => c.mode === "manuel").map((c) => c.id).join(", ")}</td><td>Navigateur, fiches d'acceptation, revue de code</td></tr></table>
<h2>6.7 Environnement et données de test</h2>
<ul><li><b>Unitaires :</b> jsdom, API simulée avec les mêmes données que le <code>DataLoader</code> ; stockage local vidé avant chaque test.</li>
<li><b>Intégration et système :</b> backend réel sur MySQL 8.4 ; chaque test crée ses propres données (suffixe unique) pour être rejouable.</li>
<li><b>Acceptation :</b> base réinitialisée (données initiales uniquement) ; comptes admin@enicar.tn et ahmed@enicar.tn.</li>
<li><b>Navigateurs :</b> Microsoft Edge et Firefox, 1440 × 900 et 360 × 800.</li></ul>
<h2>6.8 Critères d'entrée, de sortie et de suspension</h2>
<table><tr><th>Critère</th><th>Définition</th></tr>
<tr><td>Entrée</td><td>Application compilée et démarrée ; base accessible ; exigences et cas publiés sur GitHub</td></tr>
<tr><td>Sortie</td><td>100 % des cas exécutés ; aucune anomalie critique ou majeure ouverte ; 100 % des exigences couvertes ; couverture des instructions ≥ 70 % ; p95 &lt; 500 ms</td></tr>
<tr><td>Suspension</td><td>Environnement indisponible ou anomalie bloquante empêchant plus de 30 % des tests</td></tr>
<tr><td>Reprise</td><td>Correctif livré ; re-test de confirmation puis non-régression complète</td></tr></table>
<h2>6.9 Gestion des anomalies</h2>
<p><b>Cycle de vie :</b> Détectée → Confirmée → Corrigée → Re-testée → Fermée. <b>Gravité :</b> Critique (sécurité, perte de données), Majeure (fonction dégradée), Mineure (gêne). Chaque anomalie est une issue <code>[ANO-xx]</code> liée à l'exigence et au test qui l'a détectée ; elle est fermée par la Pull Request qui la corrige.</p>
<h2>6.10 Planning et livrables</h2>
<table><tr><th>Phase</th><th>Livrables</th></tr>
<tr><td>1. Installation</td><td>Environnement Docker, application v1.0.0 lancée</td></tr>
<tr><td>2. Analyse des besoins</td><td>Exigences EF / ENF (issues GitHub)</td></tr>
<tr><td>3. Conception des tests</td><td>Cas de test, matrice de traçabilité, plan de test</td></tr>
<tr><td>4. Itération 1 (v1.0.0)</td><td>Statiques, unitaires, intégration, système, non fonctionnels ; anomalies</td></tr>
<tr><td>5. Correctifs</td><td>Branche <code>iteration-2-correctifs</code>, Pull Request #71</td></tr>
<tr><td>6. Itération 2 (v1.0.1)</td><td>Re-test, non-régression, acceptation, persistance, maintenance</td></tr>
<tr><td>7. Clôture</td><td>Bilan, verdict, rapport</td></tr></table>

<h1>7. Exécution du plan de test (objectif 5)</h1>
<h2>7.1 Tests statiques</h2>
<h3>7.1.1 Revue de code</h3>
<p>Avant toute exécution, les contrôleurs et la configuration ont été relus en les confrontant aux exigences. Trois défauts graves ont été trouvés, puis confirmés par les tests dynamiques :</p>
${code(`// SecurityConfig.java — toutes les requêtes sont autorisées (EF-03, ENF-02)        -> ANO-01
.requestMatchers("/api/**").permitAll() // For development, allow all.
// AuthController.java — jeton prévisible, jamais vérifié ; l'entité User est renvoyée telle quelle
String dummyToken = "dummy-jwt-token-" + userOpt.get().getId();                     // -> ANO-01
response.put("user", userOpt.get());   // contient le hash BCrypt du mot de passe      -> ANO-02
// application.properties — secret et compte root sans mot de passe dans le dépôt     -> ANO-15
jwt.secret=94a08da1fe…   spring.datasource.password=   spring.jpa.show-sql=true`)}
<h3>7.1.2 Analyse statique outillée</h3>
<table><tr><th>Outil</th><th>v1.0.0</th><th>v1.0.1</th></tr>
<tr><td>ESLint (frontend)</td><td>${badge("8 erreurs", "ko")} : 5 fonctions appelées dans <code>useEffect</code> avant leur déclaration, variables inutilisées, export mixte dans <code>AuthContext</code></td><td>${badge("0 erreur", "ok")}</td></tr>
<tr><td>PMD 7.7 (backend)</td><td>2 alertes (classe utilitaire, <code>throws Exception</code>)</td><td>5 alertes : 7 alertes introduites par les correctifs (<code>toLowerCase</code> sans <code>Locale</code>, exception d'origine perdue…) ont été corrigées ; restent 2 complexités acceptées et 3 faux positifs liés au framework</td></tr>
<tr><td>CPD</td><td>0 duplication</td><td>0 duplication</td></tr>
<tr><td>npm audit (production)</td><td>${badge("5 hautes", "ko")} : axios, react-router(-dom), follow-redirects, form-data</td><td>${badge("0", "ok")} après <code>npm audit fix</code></td></tr></table>
<div class="note">PMD ne trouve presque rien dans le backend (code généré par Lombok, peu de logique), alors que la revue de code trouve les deux anomalies critiques. Un outil d'analyse statique ne remplace pas la lecture du code par rapport aux exigences.</div>

<h2>7.2 Tests unitaires et de composants (Jest + React Testing Library)</h2>
<p>Les composants React sont testés isolément dans jsdom ; le module <code>api/axios</code> est remplacé par une API simulée. Exemple : la table de décision des routes protégées.</p>
${code(`test.each([
  ["R1 non connecté, sans rôle exigé",     "PAGE LOGIN",     null,           undefined],
  ["R5 connecté, rôle non autorisé",       "PAGE DASHBOARD", USERS.member,   ["ADMINISTRATOR"]],
  ["R6 connecté, un des rôles autorisés",  "PAGE PROTEGEE",  USERS.president, ["ADMINISTRATOR", "CLUB_PRESIDENT"]],
  /* … 6 règles */
])("%s -> %s", (_r, expected, user, roles) => {
  renderAt(user, roles);
  expect(screen.getByText(expected)).toBeInTheDocument();
});`)}
<table><tr><th>Cas</th><th>Objet</th><th>Technique</th><th>Itération 1</th><th>Itération 2</th></tr>
${CAS.filter((c) => c.id.startsWith("TU")).map((c) => `<tr><td>${c.id}</td><td>${esc(c.titre)}</td><td>${esc(c.tech)}</td><td>${statusCell(r1[c.id])}</td><td>${statusCell(r2[c.id])}</td></tr>`).join("")}
<tr><td colspan="3"><b>Total Jest « unit »</b></td><td><b>${t1.unit.passed}/${t1.unit.total}</b></td><td><b>${t2.unit.passed}/${t2.unit.total}</b></td></tr></table>
<p>Échecs de l'itération 1 : hash du mot de passe conservé (ANO-02), tableau de bord et badges fictifs (ANO-08), membre pouvant gérer les événements et club codé en dur (ANO-10), échec silencieux de la création de club (ANO-06), paramètres et notifications non fonctionnels (ANO-12). Les 2 échecs restants en itération 2 concernent ANO-12, qui n'a pas été corrigée.</p>

<h2>7.3 Tests d'intégration de l'API (Jest, requêtes HTTP réelles)</h2>
<p>Le projet Jest « api » envoie de vraies requêtes au backend Spring Boot connecté à MySQL. Exemple : valeurs limites de la capacité d'une salle.</p>
${code(`test.each([["participants > capacité de la salle (41 pour 40)", 41], ["participants négatifs", -5]])(
  "refus : %s -> 400", async (_c, attendees) => {
    const room = await newRoom(40);
    const r = await post("/events", { title: \`Evt \${uid()}\`, clubId: 1, date: futureDate(),
                                     room: room.name, attendees }, admin);
    expect(r.status).toBe(400);   // v1.0.0 : 200 -> ANO-04
});`)}
<table><tr><th>Cas</th><th>Objet</th><th>Technique</th><th>Itération 1</th><th>Itération 2</th></tr>
${CAS.filter((c) => c.id.startsWith("TI")).map((c) => `<tr><td>${c.id}</td><td>${esc(c.titre)}</td><td>${esc(c.tech)}</td><td>${statusCell(r1[c.id])}</td><td>${statusCell(r2[c.id])}</td></tr>`).join("")}
<tr><td colspan="3"><b>Total Jest « api »</b></td><td><b>${t1.api.passed}/${t1.api.total}</b></td><td><b>${t2.api.passed}/${t2.api.total}</b></td></tr></table>
<div class="warn"><b>Itération 1 :</b> l'API accepte toutes les requêtes sans jeton (TI-03 : 5 échecs sur 6), renvoie le hash du mot de passe (TI-01), n'applique aucune règle métier (TI-02, TI-05, TI-06, TI-07) et répond par une erreur 500 à une réservation inexistante ou à un e-mail de président déjà utilisé.</div>

<h2>7.4 Tests structurels (couverture de code)</h2>
<table><tr><th>Mesure</th><th>Itération 1</th><th>Itération 2</th><th>Objectif</th></tr>
<tr><td>Frontend — instructions (Jest)</td><td>80,1 %</td><td>79,0 %</td><td>≥ 70 %</td></tr>
<tr><td>Backend — instructions (JaCoCo)</td><td>98 %</td><td>75 %</td><td>≥ 70 %</td></tr>
<tr><td>Backend — branches (JaCoCo)</td><td>88 %</td><td>75 %</td><td>—</td></tr></table>
<div class="note"><b>Analyse :</b> à l'itération 1, le backend est couvert à 98 % alors que 24 tests d'API échouent. Une règle qui n'existe pas dans le code (contrôle d'accès, capacité, double réservation) ne peut pas être mesurée par la couverture. À l'itération 2, la couverture baisse à 75 % parce que les correctifs ajoutent des branches d'erreur et que le <code>DataLoader</code> ne s'exécute plus (base déjà remplie). Les branches non couvertes, visibles en jaune et rouge dans le rapport, indiquent les prochains tests à écrire.</div>
${pair("img/cov-front.png", "Couverture du frontend (Jest)", "img/cov-back.png", "Couverture du backend (JaCoCo)")}
${img("img/cov-back-reservation.png", "Vue source JaCoCo : branches couvertes (vert), partielles (jaune), non couvertes (rouge)", 80)}

<h2>7.5 Tests système (E2E avec Playwright)</h2>
<p>Chaque scénario traverse toute l'application (React → API → MySQL) dans un vrai navigateur, sous Edge et sous Firefox (TS-08, compatibilité).</p>
<table><tr><th>Cas</th><th>Scénario</th><th>Itération 1</th><th>Itération 2</th></tr>
${CAS.filter((c) => c.id.startsWith("TS")).map((c) => `<tr><td>${c.id}</td><td>${esc(c.titre)}</td><td>${statusCell(r1[c.id])}</td><td>${statusCell(r2[c.id])}</td></tr>`).join("")}
<tr><td colspan="2"><b>Total (11 scénarios × 2 navigateurs)</b></td><td><b>${t1.e2e.passed}/${t1.e2e.total}</b></td><td><b>${t2.e2e.passed}/${t2.e2e.total}</b></td></tr></table>
<div class="warn"><b>Deux anomalies vues uniquement grâce aux captures (test exploratoire) :</b> (1) avec un mauvais mot de passe, la page se recharge et le message disparaît (ANO-09). Le test unitaire TU-06 ne l'avait pas détecté, car l'API y est simulée : c'est un défaut d'intégration. (2) Sur smartphone, il n'y a pas de défilement horizontal (le critère automatique passait), mais la barre latérale occupe 60 % de l'écran (ANO-11). Le critère du test a donc été renforcé : la zone de contenu doit occuper au moins 80 % de la largeur.</div>
${pair("../results/screenshots-iteration1/TS01-3-mauvais-mdp.png", "v1.0.0 : mauvais mot de passe, aucun message (ANO-09)", "../results/screenshots/TS01-3-mauvais-mdp.png", "v1.0.1 : message affiché")}
<div class="pair">${img("../results/screenshots-iteration1/TS07-mobile-dashboard.png", "v1.0.0 : smartphone 360 px (ANO-11)", 30)}${img("../results/screenshots/TS07-mobile-dashboard.png", "v1.0.1 : menu en tiroir, contenu lisible", 30)}${img("img/e2e-report.png", "Rapport HTML Playwright (v1.0.1)", 36)}</div>
${pair("../results/screenshots/TS03-1-nouveau-club.png", "TS-03 : l'administrateur crée un club et son président", "../results/screenshots/TS05-2-reservation-approuvee.png", "TS-05 : réservation d'un membre approuvée par l'administrateur")}

<h2>7.6 Tests d'acceptation (manuels)</h2>
<p>Les fiches TA-01 à TA-03 (<code>qa/acceptance/TA-fiches.md</code>) décrivent un parcours métier par profil (action → résultat attendu). Elles ont été exécutées pas à pas dans le navigateur sur la version v1.0.1, avec une base réinitialisée. Un script d'aide (<code>tests/acceptance/TA_acceptance.spec.js</code>) réalise les actions et prend une capture à chaque étape comme preuve.</p>
${["TA-01", "TA-02", "TA-03"].map((ta) => `<h3>${ta} — ${esc(CAS.find((c) => c.id === ta).titre)}</h3><table><tr><th>#</th><th>Action</th><th>Résultat attendu</th><th>Résultat obtenu</th></tr>${TA.filter((s) => s.ta === ta).map((s) => `<tr><td>${s.n}</td><td>${esc(s.action)}</td><td>${esc(s.attendu)}</td><td>${s.obtenu === "Conforme" ? badge("Conforme", "ok") : badge(esc(s.obtenu), "ko")}</td></tr>`).join("")}</table>`).join("")}
${pair("../results/acceptance/TA-01-5.png", "TA-01 étape 5 : président déjà inscrit, message affiché", "../results/acceptance/TA-02-3.png", "TA-02 étape 3 : capacité de la salle dépassée")}
${pair("../results/acceptance/TA-03-1.png", "TA-03 étape 1 : adresse non institutionnelle refusée", "../results/acceptance/TA-03-5.png", "TA-03 étape 5 : double réservation refusée")}

<h2>7.7 Tests non fonctionnels</h2>
<h3>Performance et fiabilité — test de charge k6 (TNF-01)</h3>
<p>Profil : montée à 50 utilisateurs virtuels en 15 s, palier de 45 s, descente en 10 s. Chaque utilisateur se connecte puis consulte les cinq ressources. Seuils : p95 &lt; 500 ms (ENF-03) et taux d'erreur &lt; 1 %.</p>
<table><tr><th>Mesure</th><th>Itération 1 (v1.0.0)</th><th>Itération 2 (v1.0.1, API sécurisée)</th></tr>
<tr><td>Requêtes</td><td>10 932 (155 req/s)</td><td>10 728 (153 req/s)</td></tr>
<tr><td>Temps moyen / médian</td><td>99,6 ms / 50,6 ms</td><td>104,9 ms / 68,3 ms</td></tr>
<tr><td>p95 (seuil 500 ms)</td><td>${badge("359 ms", "ok")}</td><td>${badge("357 ms", "ok")}</td></tr>
<tr><td>Taux d'erreur (seuil 1 %)</td><td>${badge("0 %", "ok")}</td><td>${badge("0 %", "ok")}</td></tr></table>
<p>La vérification du jeton à chaque requête (une lecture en base) augmente légèrement le temps médian sans dégrader le p95. Remarque : les listes ne sont pas paginées ; leur temps de réponse augmentera avec le volume de données.</p>
<h3>Sécurité</h3>
<table><tr><th>Contrôle</th><th>v1.0.0</th><th>v1.0.1</th></tr>
<tr><td>Suppression d'une salle sans jeton (TI-03)</td><td>${badge("200 accepté", "ko")}</td><td>${badge("401", "ok")}</td></tr>
<tr><td>Jeton falsifié « dummy-jwt-token-1 »</td><td>${badge("200 accepté", "ko")}</td><td>${badge("401", "ok")}</td></tr>
<tr><td>Membre qui crée une salle / approuve une réservation</td><td>${badge("200 accepté", "ko")}</td><td>${badge("403", "ok")}</td></tr>
<tr><td>Hash du mot de passe dans la réponse de connexion</td><td>${badge("présent", "ko")}</td><td>${badge("absent", "ok")}</td></tr>
<tr><td>Rôle envoyé par le client à l'inscription</td><td>${badge("ignoré", "ok")}</td><td>${badge("ignoré", "ok")}</td></tr>
<tr><td>Dépendances vulnérables en production</td><td>${badge("5 hautes", "ko")}</td><td>${badge("0", "ok")}</td></tr></table>
<h3>Persistance (TNF-05)</h3>
<p>Le décompte des données est identique avant et après un redémarrage du backend (12 clubs, 17 événements, 35 salles, 4 équipements, 19 réservations). En revanche, les jetons de session sont conservés en mémoire : après un redémarrage, le jeton obtenu avant est refusé (401) et tous les utilisateurs doivent se reconnecter. C'est un effet de bord du correctif d'ANO-01 (ANO-16).</p>

<h2>7.8 Tests liés aux changements et tests de maintenance</h2>
<h3>Correctifs appliqués (v1.0.1)</h3>
<table><tr><th>Anomalie</th><th>Correctif</th></tr>
<tr><td>ANO-01</td><td><code>TokenService</code> (jeton aléatoire de 256 bits) + <code>TokenAuthenticationFilter</code> ; règles par rôle dans <code>SecurityConfig</code> ; réponses 401/403</td></tr>
<tr><td>ANO-02</td><td><code>@JsonProperty(access = WRITE_ONLY)</code> sur le mot de passe ; le frontend retire aussi ce champ par précaution</td></tr>
<tr><td>ANO-03 à 07</td><td>Validations métier dans les contrôleurs ; erreurs 400 / 404 / 409 explicites (classe <code>ApiError</code>)</td></tr>
<tr><td>ANO-08</td><td>Tableau de bord calculé à partir de l'API ; suppression de <code>mock/data.js</code> et des badges codés en dur</td></tr>
<tr><td>ANO-09</td><td>L'intercepteur axios ne redirige plus sur un 401 venant de <code>/auth/*</code></td></tr>
<tr><td>ANO-10</td><td>Événements gérés par le président et l'administrateur ; club du président sélectionné ; club de l'utilisateur pour les réservations</td></tr>
<tr><td>ANO-11</td><td>Barre latérale en tiroir sous 768 px (bouton ☰), grilles responsives</td></tr>
<tr><td>ANO-13, 14, 15</td><td><code>npm audit fix</code> ; ESLint corrigé (hook <code>useAuth</code> séparé) ; configuration par variables d'environnement, CORS limité, <code>show-sql</code> désactivé</td></tr></table>
${code(`// SecurityConfig.java (v1.0.1) — ANO-01 : règles d'accès par rôle
.requestMatchers("/api/auth/**", "/error").permitAll()
.requestMatchers(HttpMethod.GET, "/api/clubs/**", "/api/events/**", "/api/rooms/**", "/api/equipment/**").permitAll()
.requestMatchers("/api/clubs/**", "/api/rooms/**", "/api/equipment/**").hasRole(ADMIN)
.requestMatchers(HttpMethod.PUT, "/api/reservations/*/status").hasRole(ADMIN)
.requestMatchers("/api/events/**").hasAnyRole(ADMIN, PRESIDENT)
.anyRequest().authenticated()`)}
<h3>Re-test de confirmation (TR-01) et non-régression (TR-02)</h3>
<p>Le re-test ré-exécute les cas qui avaient échoué. La non-régression ré-exécute toutes les suites : Jest unit ${t2.unit.passed}/${t2.unit.total}, Jest API ${t2.api.passed}/${t2.api.total}, E2E ${t2.e2e.passed}/${t2.e2e.total}, et k6 reste conforme.</p>
<div class="warn"><b>Régression détectée puis corrigée (ANO-18) :</b> la première non-régression E2E a échoué une fois sous Edge (TS-04). Le correctif d'ANO-10 calcule le club du président à partir de la liste des clubs ; si le président clique sur « + Nouvel Événement » avant la fin du chargement, la page affiche « Aucun club associé à votre compte ». Correctif : bouton désactivé tant que les clubs ne sont pas chargés. Re-test : TS-04 répété 10 fois, 10/10 réussis. Ce cas montre l'intérêt de la non-régression : un correctif peut introduire un nouveau défaut.</div>
<p>Pour rendre ce défaut intermittent reproductible, un test de régression dédié (<code>tests/regression/ANO18.spec.js</code>) retarde volontairement de 2 s la réponse de <code>/api/clubs</code>. Il échoue sur le code d'avant le correctif et réussit après : il fait désormais partie de la suite de non-régression.</p>
${pair("../results/regression/ANO18-avant.png", "ANO-18 reproduite (code avant correctif) : « Aucun club associé »", "../results/regression/ANO18-apres.png", "Après correctif : bouton désactivé pendant le chargement, puis création possible")}
<h3>Tests de maintenance (TM-01)</h3>
<p>La configuration du projet vise XAMPP, qui embarque MariaDB 10.4. Le backend v1.0.1 a été porté sur MariaDB 10.4 (Docker) sans modifier le code : <b>45/45 tests d'API réussis</b>. Hibernate 7 signale toutefois que cette version n'est plus prise en charge (avertissement HHH000511 ; MariaDB 10.4 est en fin de vie depuis 2024) : ANO-17. Recommandation : MySQL 8 ou MariaDB ≥ 10.6.</p>

<h2>7.9 Suivi de la campagne sur GitHub</h2>
<p>Les correctifs sont regroupés dans la branche <code>iteration-2-correctifs</code> et la <a href="${REPO}/pull/71">Pull Request #71</a>. Chaque ligne « Fixes #n » de la description ferme l'anomalie correspondante lors de la fusion, ce qui relie anomalie, correctif et résultats de re-test.</p>
${img("img/gh-anomalies.png", "Issues « anomalie » liées à la Pull Request de correction", 92)}
${img("img/gh-pr.png", "Pull Request #71 : correctifs et résultats de l'itération 2", 92)}

<h1>8. Bilan : anomalies, métriques et verdict de recette</h1>
<h2>8.1 Anomalies détectées</h2>
<table><tr><th>Réf.</th><th>Gravité</th><th>Description</th><th>Détectée par</th><th>Exigence</th><th>Statut</th></tr>
${ANOMALIES.map((a) => `<tr><td>${a.id} ${issue(a.id)}</td><td>${badge(a.grav, gravCls(a.grav))}</td><td><b>${esc(a.titre)}</b></td><td>${a.par.join(", ")}</td><td>${a.ex.join(", ")}</td><td>${badge(STATUT[a.id], stCls(STATUT[a.id]))}</td></tr>`).join("")}</table>
<h2>8.2 Métriques</h2>
<table><tr><th>Indicateur</th><th>Itération 1 (v1.0.0)</th><th>Itération 2 (v1.0.1)</th></tr>
<tr><td>Tests Jest unitaires / composants</td><td>${t1.unit.passed}/${t1.unit.total}</td><td>${t2.unit.passed}/${t2.unit.total}</td></tr>
<tr><td>Tests Jest d'API (intégration)</td><td>${t1.api.passed}/${t1.api.total}</td><td>${t2.api.passed}/${t2.api.total}</td></tr>
<tr><td>Tests E2E Playwright (Edge + Firefox)</td><td>${t1.e2e.passed}/${t1.e2e.total}</td><td>${t2.e2e.passed}/${t2.e2e.total}</td></tr>
<tr><td>Étapes d'acceptation conformes</td><td>— (planifiées en itération 2)</td><td>${TA.filter((s) => s.obtenu === "Conforme").length}/${TA.length}</td></tr>
<tr><td>Cas de test exécutés</td><td>${CAS.length - 8}/${CAS.length} (les cas TA, TNF-05, TR, TM appartiennent à l'itération 2)</td><td>${CAS.length}/${CAS.length}</td></tr>
<tr><td>Anomalies</td><td>${it1.length} détectées (${nb("Critique")} critiques, ${nb("Majeure")} majeures, ${nb("Mineure")} mineures)</td><td>+3 détectées (ANO-16, 17, 18) ; ${anoCorr} corrigées et re-testées ; 3 ouvertes (mineures)</td></tr>
<tr><td>Efficacité des techniques statiques</td><td colspan="2">${statiques.length} anomalies sur ${ANOMALIES.length} trouvées sans exécuter le code (${statiques.join(", ")} : revue de code, ESLint, npm audit), dont les 2 critiques</td></tr>
<tr><td>Couverture des instructions (front / back)</td><td>80 % / 98 %</td><td>79 % / 75 %</td></tr>
<tr><td>p95 sous 50 utilisateurs</td><td>359 ms</td><td>357 ms</td></tr></table>
<h2>8.3 Évaluation des critères de sortie</h2>
<table><tr><th>Critère</th><th>Résultat</th><th>Verdict</th></tr>
<tr><td>100 % des cas planifiés exécutés</td><td>${CAS.length}/${CAS.length}</td><td>${badge("Atteint", "ok")}</td></tr>
<tr><td>Aucune anomalie critique ou majeure ouverte</td><td>Toutes corrigées et re-testées ; restent 3 mineures (ANO-12, 16, 17)</td><td>${badge("Atteint", "ok")}</td></tr>
<tr><td>100 % des exigences couvertes</td><td>${EXIGENCES.length}/${EXIGENCES.length} ; ${ex.sat} satisfaites, ${ex.res} avec réserve, ${ex.non} non satisfaite (EF-10)</td><td>${badge("Atteint", "ok")}</td></tr>
<tr><td>Couverture des instructions ≥ 70 %</td><td>Frontend 79 %, backend 75 %</td><td>${badge("Atteint", "ok")}</td></tr>
<tr><td>p95 &lt; 500 ms à 50 utilisateurs</td><td>357 ms, 0 % d'erreurs</td><td>${badge("Atteint", "ok")}</td></tr></table>
<div class="verdict">Verdict : recette de la version v1.0.1 prononcée AVEC RÉSERVES. Tous les critères de sortie sont atteints, mais l'exigence EF-10 (paramètres et notifications) n'est pas satisfaite (ANO-12) et deux réserves mineures subsistent : sessions perdues au redémarrage (ANO-16) et MariaDB 10.4 non prise en charge (ANO-17). La version v1.0.0 aurait été refusée : ${nb("Critique")} anomalies critiques et ${nb("Majeure")} majeures.</div>
<h2>8.4 Recommandations</h2>
<table><tr><th>Sujet</th><th>Recommandation</th></tr>
<tr><td>ANO-16</td><td>Remplacer les jetons en mémoire par des JWT signés (clé fournie par une variable d'environnement) avec expiration</td></tr>
<tr><td>ANO-17</td><td>Utiliser MySQL 8 ou MariaDB ≥ 10.6 avec le pilote MariaDB</td></tr>
<tr><td>ANO-12</td><td>Développer les notifications (table et API) et l'action « Désactiver mon compte », ou retirer ces écrans de la version livrée</td></tr>
<tr><td>Données</td><td>Rattacher les membres à leurs clubs (adhésion), paginer les listes, choisir la salle dans une liste plutôt que la saisir</td></tr>
<tr><td>Intégration continue</td><td>Exécuter <code>npm test</code>, ESLint, <code>npm audit</code> et Playwright à chaque Pull Request (GitHub Actions) ; bloquer la fusion en cas d'échec</td></tr></table>

<h1>9. Conclusion</h1>
<p>Cet atelier nous a permis de mener une démarche de test complète sur notre propre plateforme, de l'expression des besoins jusqu'au verdict de recette. GitHub a servi de référentiel unique : les exigences, les cas de test, les campagnes et les anomalies y sont des issues liées entre elles, et la Pull Request de correction relie chaque anomalie à son correctif et à son re-test.</p>
<p>La combinaison des techniques s'est révélée nécessaire. La revue de code a trouvé les défauts les plus graves avant toute exécution, alors que l'analyse outillée et la couverture (98 %) ne les voyaient pas. Les tests dynamiques avec Jest (partitions, valeurs limites, tables de décision, transitions d'états) les ont confirmés et mesurés. Les tests système dans deux navigateurs ont révélé un défaut d'intégration invisible au niveau unitaire (ANO-09). La revue visuelle des captures a montré la limite d'un critère automatique trop faible (ANO-11). Enfin, la non-régression a détecté un défaut introduit par un correctif (ANO-18), ce qui confirme que le cycle correction → re-test → non-régression est indispensable.</p>

<h1>10. Annexe : rejouer les tests</h1>
${code(`# 1. Base de données et backend (avec couverture JaCoCo)
docker run -d --name enicar-mysql -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -p 3306:3306 mysql:8.4
cd backend && ./mvnw -DskipTests package
java -javaagent:qa/tools/org.jacoco.agent-0.8.13-runtime.jar=output=tcpserver,port=6300 -jar backend/target/backend-0.0.1-SNAPSHOT.jar

# 2. Tests (dossier frontend)
npm install
npm run test:unit            # Jest unitaires/composants + couverture
npm run test:api             # Jest intégration : requêtes HTTP réelles vers l'API
npx playwright test          # E2E Edge + Firefox (démarre Vite automatiquement)
npx playwright test -c playwright.acceptance.config.js   # aide à l'exécution des tests d'acceptation
npx eslint src && npm audit --omit=dev                     # analyse statique et dépendances

# 3. Backend : analyse statique, charge, couverture
cd backend && ./mvnw -Pqa pmd:pmd pmd:cpd
docker run --rm -v ./qa/perf:/scripts grafana/k6 run /scripts/charge-api.js
java -jar qa/tools/org.jacoco.cli-0.8.13-nodeps.jar dump --address localhost --port 6300 --destfile jacoco.exec

# 4. Référentiel GitHub
node qa/github/publish.mjs <owner/repo>       # exigences, cas, anomalies -> issues
node qa/github/iteration2.mjs <owner/repo>    # résultats de l'itération 2
node qa/report/build.mjs                      # génère ce rapport`)}
<table><tr><th>Emplacement</th><th>Contenu</th></tr>
<tr><td><code>frontend/tests/unit/</code></td><td>TU-01 … TU-06 (Jest + React Testing Library)</td></tr>
<tr><td><code>frontend/tests/api/</code></td><td>TI-01 … TI-07 (Jest, HTTP réel)</td></tr>
<tr><td><code>frontend/tests/e2e/</code></td><td>TS-01 … TS-07 (Playwright)</td></tr>
<tr><td><code>frontend/tests/acceptance/</code>, <code>qa/acceptance/</code></td><td>Fiches et script d'aide TA-01 … TA-03</td></tr>
<tr><td><code>qa/perf/</code></td><td>Scénario k6 et résumés</td></tr>
<tr><td><code>qa/referentiel.mjs</code>, <code>qa/github/</code></td><td>Référentiel (exigences, cas, anomalies) et publication GitHub</td></tr>
<tr><td><code>qa/results/</code></td><td>Résultats bruts des deux itérations, couvertures, captures, rapports HTML</td></tr></table>
</body></html>`;

writeFileSync(new URL("./Rapport_Atelier_Test_Logiciel.html", import.meta.url), html);
console.log("figures:", fig, "taille:", html.length);
