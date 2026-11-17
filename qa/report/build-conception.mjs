// Rapport d'évaluation : description du projet, architecture, conception et plan de test.
// Ne contient aucun résultat d'exécution (phase suivante du projet).
// Usage : node qa/report/build-conception.mjs  →  qa/report/Rapport_Conception_Plan_de_Test.html
import { writeFileSync, readFileSync } from "node:fs";
import { EXIGENCES, CAS, RESPONSABLE } from "../referentiel.mjs";
import { PLAN } from "../plan-evaluation.mjs";

const window = {};
new Function("window", readFileSync(new URL("../../suivi/donnees.js", import.meta.url), "utf8"))(window);
const SUIVI = window.SUIVI;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const code = (s) => `<pre>${esc(s.trim())}</pre>`;
let fig = 0;
const img = (src, cap, w = 100) => `<figure style="width:${w}%"><img src="${src}"><figcaption>Figure ${++fig} – ${cap}</figcaption></figure>`;
const casOf = (e) => CAS.filter((c) => c.ex.includes(e)).map((c) => c.id);
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const fmt = (iso) => { if (!iso) return "—"; const [y, m, d] = iso.split("-").map(Number); return `${d} ${MOIS[m - 1]} ${y}`; };
const EF = EXIGENCES.filter((e) => e.id.startsWith("EF")), ENF = EXIGENCES.filter((e) => e.id.startsWith("ENF"));
const weeks = [...new Set(SUIVI.taches.map((t) => t.semaine))].sort();
const phaseOf = (w) => (SUIVI.semaines.find((s) => s.semaine === w) || {}).phase || (SUIVI.phases || {})[w] || "";
const startOf = (w) => (SUIVI.semaines.find((s) => s.semaine === w) || {}).date_debut;
const fonctionnels = CAS.filter((c) => /^Fonctionnel/.test(c.type));
const nonFonctionnels = CAS.filter((c) => /Non fonctionnel|Sécurité/.test(c.type));

const short = (n) => n.replace(/^Mohamed /, "M. ");
const row = (t) => `<tr><td style="white-space:nowrap"><b>${t.id}</b></td><td>${esc(t.titre)}</td><td>${esc(t.attendu)}</td><td>${t.niveau}</td><td>${esc(t.tech)}</td><td>${t.ex.join(", ")}</td><td>${short(t.resp)}</td></tr>`;

const API = [
  ["POST", "/api/auth/register", "Inscription d'un étudiant (rôle CLUB_MEMBER)", "Public"],
  ["POST", "/api/auth/login", "Connexion : renvoie un jeton et le profil", "Public"],
  ["GET", "/api/clubs", "Liste des clubs", "Public"],
  ["POST", "/api/clubs", "Création d'un club et du compte de son président", "ADMINISTRATOR"],
  ["DELETE", "/api/clubs/{id}", "Suppression d'un club", "ADMINISTRATOR"],
  ["GET", "/api/events", "Liste des événements", "Public"],
  ["POST", "/api/events", "Création d'un événement (statut PENDING)", "CLUB_PRESIDENT, ADMINISTRATOR"],
  ["DELETE", "/api/events/{id}", "Suppression d'un événement", "CLUB_PRESIDENT, ADMINISTRATOR"],
  ["GET", "/api/rooms", "Liste des salles", "Public"],
  ["POST · DELETE", "/api/rooms", "Ajout et suppression d'une salle", "ADMINISTRATOR"],
  ["GET", "/api/equipment", "Liste des équipements", "Public"],
  ["POST · DELETE", "/api/equipment", "Ajout et suppression d'un équipement", "ADMINISTRATOR"],
  ["GET", "/api/reservations", "Liste des réservations", "Utilisateur connecté"],
  ["POST", "/api/reservations", "Demande de réservation d'une salle ou d'un équipement", "Utilisateur connecté"],
  ["PUT", "/api/reservations/{id}/status", "Approbation ou rejet d'une réservation", "ADMINISTRATOR"],
];

const OUTILS = [
  ["Jest 30 + React Testing Library", "Tests unitaires et de composants du frontend (API simulée) ; tests d'intégration de l'API par requêtes HTTP", "Unitaire, intégration", "Fonctionnel, sécurité"],
  ["Postman", "Logiciel de test d'API : collection en deux parties, A — fonctionnels, B — non fonctionnels (performance, sécurité, robustesse) ; Collection Runner et onglet Performance", "Intégration", "Fonctionnel et non fonctionnel"],
  ["Playwright (+ UI Mode)", "Tests système dans un vrai navigateur (Edge, Firefox), interface graphique avec chronologie et captures ; aide aux tests d'acceptation", "Système, acceptation", "Fonctionnel, utilisabilité, compatibilité"],
  ["k6", "Test de charge de l'API (50 utilisateurs virtuels)", "Système", "Non fonctionnel (performance)"],
  ["JaCoCo · couverture Jest", "Couverture des instructions et des branches", "Unitaire, intégration", "Structurel"],
  ["ESLint · PMD/CPD · npm audit", "Analyse statique du code et audit des dépendances", "—", "Statique, maintenabilité, sécurité"],
  ["GitHub (issues, jalons, Pull Requests, Projects)", "Gestion des exigences, des cas de test, des anomalies et des campagnes", "—", "Gestion des tests"],
];

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport conception et plan de test</title>
<style>
@page{size:A4;margin:16mm 15mm 16mm 15mm}
:root{--c:#13233f;--c2:#0e7c86;--soft:#e9f3f4;--line:#cfd8e3}
*{box-sizing:border-box}body{font-family:"Segoe UI",Calibri,Arial,sans-serif;font-size:10pt;line-height:1.5;color:#1b1b1b;background:#fff;margin:0}
h1{color:var(--c);font-family:Bahnschrift,"Segoe UI",sans-serif;font-size:19pt;border-bottom:3px solid var(--c2);padding-bottom:4px;margin:0 0 10px;page-break-before:always}
h2{color:var(--c2);font-family:Bahnschrift,"Segoe UI",sans-serif;font-size:13pt;margin:16px 0 6px;page-break-after:avoid}
h3{color:var(--c);font-size:10.8pt;margin:12px 0 4px;page-break-after:avoid}
p{margin:4px 0 7px;text-align:justify}ul,ol{margin:3px 0 8px;padding-left:20px}li{margin:2px 0}
table{width:100%;border-collapse:collapse;margin:6px 0 11px;font-size:8.7pt}tr{page-break-inside:avoid}
th{background:var(--c);color:#fff;text-align:left;padding:4px 6px;font-weight:600}td{border:1px solid var(--line);padding:3px 6px;vertical-align:top}
tr:nth-child(even) td{background:#f6f8fb}
pre{font-family:Consolas,monospace;font-size:8pt;background:#f3f5f8;border-left:3px solid var(--c2);padding:7px 9px;white-space:pre-wrap;margin:5px 0 9px;page-break-inside:avoid}
code{font-family:Consolas,monospace;font-size:8.6pt;background:#eef1f5;padding:0 3px}
figure{margin:8px auto 12px;page-break-inside:avoid;text-align:center}figure img{max-width:100%}
figcaption{font-size:8.4pt;color:#444;margin-top:4px}
.note{background:var(--soft);border-left:4px solid var(--c2);padding:6px 10px;margin:8px 0}
.cover{height:262mm;display:flex;flex-direction:column;justify-content:space-between}
.cover .top{color:var(--c2);font-weight:700;letter-spacing:1.5px;font-size:10pt}
.cover .t{font-family:Bahnschrift,"Segoe UI",sans-serif;font-size:30pt;color:var(--c);font-weight:700;line-height:1.12;margin-top:46px}
.cover .s{font-size:13.5pt;margin-top:12px;color:#333}
.pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:28px}.pills span{border:1.5px solid var(--c2);color:var(--c2);border-radius:999px;padding:3px 12px;font-weight:600;font-size:10pt}
.band{background:var(--c);color:#fff;padding:14px 18px;border-radius:6px}.band div{margin:3px 0}
.toc div{display:flex;justify-content:space-between;border-bottom:1px dotted #aaa;padding:3px 0}.toc .l2{padding-left:18px;font-size:9.3pt;color:#333}
.badge{display:inline-block;padding:0 7px;border-radius:9px;font-size:8pt;font-weight:600;background:#e6ecf3;color:#36495e}
.b-f{background:#dff1e5;color:#17633a}.b-nf{background:#fbeed8;color:#7a4e00}
.part{page-break-before:always;height:250mm;display:flex;flex-direction:column;justify-content:center;border-left:8px solid var(--c2);padding-left:24px}
.part .k{color:var(--c2);font-weight:700;letter-spacing:2px;font-size:11pt}
.part .t{font-family:Bahnschrift,"Segoe UI",sans-serif;font-size:26pt;color:var(--c);font-weight:700;margin:8px 0 14px}
.part ul{font-size:11.5pt;color:#333}
</style></head><body>

<section class="cover">
<div>
<div class="top">ÉCOLE NATIONALE D'INGÉNIEURS DE CARTHAGE · ATELIER TEST LOGICIEL</div>
<div class="t">Plateforme de gestion des clubs de l'ENICarthage</div>
<div class="s">Compte rendu 3 — Rapport : CR1 (description du projet, outil de gestion des tests) + CR2 (plan de test) + besoins, architecture et conception</div>
<div class="pills"><span>CR1 · CR2 · CR3</span><span>${PLAN.length} tests : 5 fonctionnels, 5 non fonctionnels, 4 d'API</span><span>Un outil de test : Playwright</span><span>Gestion des tests : GitHub</span></div>
</div>
<div class="band">
<div><b>Réalisé par :</b> ${SUIVI.equipe.join(" · ")}</div>
<div><b>Chef d'équipe :</b> ${SUIVI.chef}</div>
<div><b>Encadrement :</b> ${SUIVI.encadrant}</div>
<div><b>Outil de test :</b> Playwright · <b>Outil de gestion des tests :</b> GitHub</div>
<div><b>Date :</b> 17 novembre 2026 · Année universitaire 2026 – 2027</div>
</div>
</section>
<section class="toc"><h1 style="page-break-before:always">Sommaire</h1>
<div>1. Introduction</div>
<div><b>Partie 1 — CR1 : description du projet et outil de gestion des tests</b></div>
<div class="l2">2. Description du projet · 3. Outil de gestion des tests : GitHub</div>
<div><b>Partie 2 — CR2 : plan de test</b></div>
<div class="l2">4. Plan de test (document) · 5. Outil de test : Playwright · 6. Le plan de test dans l'outil de gestion</div>
<div><b>Partie 3 — Compléments du rapport</b></div>
<div class="l2">7. Spécification des besoins · 8. Architecture · 9. Conception · 10. Revue formelle du rapport</div>
<div>11. Conclusion</div>
</section>
<h1>1. Introduction</h1>
<p>Ce rapport présente notre projet pour l'atelier de test logiciel : une plateforme web de gestion des clubs de l'ENICarthage. Il suit l'organisation demandée par l'encadrant : il réunit le compte rendu 1 (CR1) et le compte rendu 2 (CR2), complétés par la spécification des besoins, l'architecture et la conception, puis soumis à une revue formelle.</p>
<table><tr><th>Livrable</th><th>Contenu</th><th>Chapitres</th></tr>
<tr><td><b>CR1</b></td><td>Description du projet (D.P.) et outil de gestion des tests (O.G.T.)</td><td>2, 3</td></tr>
<tr><td><b>CR2</b></td><td>Plan de test (P.T.), livré sous forme de document et saisi dans l'outil de gestion des tests ; outil de test retenu</td><td>4, 5, 6</td></tr>
<tr><td><b>CR3 — rapport</b></td><td>CR1 + CR2 + spécification des besoins, architecture, conception ; revue formelle du rapport</td><td>1 à 11</td></tr></table>
<section class="part"><div class="k">PARTIE 1 — COMPTE RENDU 1 (CR1)</div><div class="t">Description du projet et outil de gestion des tests</div><ul><li>2. Description du projet</li><li>3. Outil de gestion des tests : GitHub</li></ul></section>
<h1>2. Description du projet</h1>
<h2>2.1 Contexte et problématique</h2>
<p>La vie associative de l'ENICarthage repose sur de nombreux clubs. Leur gestion (création des clubs, organisation des événements, réservation des salles et du matériel, validation par l'administration) se fait aujourd'hui par des échanges dispersés, sans vue d'ensemble ni traçabilité. Une même salle peut être demandée deux fois pour la même date, et l'administration n'a pas de tableau de bord commun.</p>
<h2>2.2 Objectifs de la plateforme</h2>
<ul><li>Centraliser les clubs, leurs membres et leurs événements dans une seule application web.</li>
<li>Permettre la réservation des salles et des équipements, avec validation par l'administration et sans double réservation.</li>
<li>Donner à chaque profil uniquement les actions qui le concernent.</li>
<li>Offrir à l'administration un tableau de bord de l'activité.</li></ul>
<h2>2.3 Profils d'utilisateurs</h2>
<table><tr><th>Profil</th><th>Rôle technique</th><th>Ce qu'il peut faire</th></tr>
<tr><td>Visiteur</td><td>—</td><td>S'inscrire (adresse institutionnelle @enicar.tn) et se connecter</td></tr>
<tr><td>Membre de club</td><td><code>CLUB_MEMBER</code></td><td>Consulter les clubs et les événements, réserver une salle ou un équipement, suivre ses réservations, consulter son profil</td></tr>
<tr><td>Président de club</td><td><code>CLUB_PRESIDENT</code></td><td>Tout ce que fait un membre, plus créer et supprimer les événements de son club</td></tr>
<tr><td>Administration</td><td><code>ADMINISTRATOR</code></td><td>Créer les clubs et le compte de leur président, gérer les salles et les équipements, approuver ou rejeter les réservations</td></tr></table>
<h2>2.4 Fonctionnalités par module</h2>
<table><tr><th>Module</th><th>Fonctionnalités</th></tr>
<tr><td>Authentification</td><td>Inscription, connexion, déconnexion, session conservée dans le navigateur</td></tr>
<tr><td>Tableau de bord</td><td>Nombre de clubs, d'événements, de salles et de membres ; événements récents ; clubs actifs</td></tr>
<tr><td>Clubs</td><td>Liste ; création d'un club avec le compte de son président ; suppression</td></tr>
<tr><td>Événements</td><td>Liste ; création pour son club (salle, date, nombre de participants) ; suppression</td></tr>
<tr><td>Salles et équipements</td><td>Liste avec capacité et type ; ajout par l'administration</td></tr>
<tr><td>Réservations</td><td>Demande d'un membre ; approbation ou rejet par l'administration</td></tr>
<tr><td>Compte</td><td>Profil, paramètres, notifications</td></tr></table>

<h1>3. Outil de gestion des tests : GitHub</h1>
<p>L'outil de gestion des tests (O.G.T.) retenu est <b>GitHub</b>, qui héberge déjà le code du projet. Il gère dans un même dépôt les exigences, les tests, les campagnes, les anomalies et leurs corrections, avec la traçabilité entre eux.</p>
<h2>3.1 Pourquoi GitHub</h2>
<ul><li>Le code, les tests et leur suivi sont au même endroit : une anomalie peut être reliée au test qui l'a détectée et à la modification de code qui la corrige.</li>
<li>Chaque test peut être <b>assigné</b> à son responsable, qui voit ses tâches dans son espace.</li>
<li>Gratuit, accessible à toute l'équipe et à l'encadrant, utilisable depuis le navigateur ou en ligne de commande (<code>gh</code>).</li></ul>
<h2>3.2 Organisation</h2>
<table><tr><th>Fonction d'un outil de gestion des tests</th><th>Réalisation dans GitHub</th></tr>
<tr><td>Référentiel des exigences</td><td>Une <b>issue</b> par exigence, titrée <code>[EF-xx]</code> ou <code>[ENF-xx]</code>, avec les libellés <code>exigence</code> et sa criticité (<code>critique</code>, <code>majeure</code>, <code>mineure</code>)</td></tr>
<tr><td>Tests</td><td>Une issue par test, titrée <code>[TF-xx]</code>, <code>[TNF-xx]</code> ou <code>[API-xx]</code>, avec le libellé de sa famille (<code>fonctionnel</code>, <code>non fonctionnel</code>, <code>api</code>), l'objet, le résultat attendu, la technique et les exigences vérifiées</td></tr>
<tr><td>Responsable d'un test</td><td>Le champ <b>Assignees</b> de l'issue</td></tr>
<tr><td>Traçabilité</td><td>Dans chaque test, la ligne « Vérifie #n » renvoie aux issues des exigences ; GitHub affiche le lien dans les deux sens</td></tr>
<tr><td>Campagne de test</td><td>Un <b>jalon</b> (milestone) par campagne : il regroupe les tests à exécuter sur une version et affiche leur avancement</td></tr>
<tr><td>Résultats d'exécution</td><td>Un commentaire de résultat sur l'issue du test, puis sa fermeture</td></tr>
<tr><td>Anomalies</td><td>Une issue <code>[ANO-xx]</code> par anomalie : gravité, étapes de reproduction, exigence concernée, test qui l'a détectée</td></tr>
<tr><td>Correction</td><td>Une <b>Pull Request</b> dont la description contient « Fixes #n » : sa fusion ferme automatiquement l'anomalie</td></tr>
<tr><td>Suivi visuel</td><td>Un tableau <b>GitHub Projects</b> avec les colonnes À faire → En cours → Corrigée → Re-testée → Fermée</td></tr></table>
<h2>3.3 Cycle de vie d'une anomalie dans l'outil</h2>
<table><tr><th>Étape</th><th>Dans GitHub</th><th>Qui</th></tr>
<tr><td>Détectée</td><td>Issue <code>[ANO-xx]</code> créée, liée au test et à l'exigence</td><td>Responsable du test</td></tr>
<tr><td>Confirmée</td><td>Reproduite, gravité fixée (libellé), colonne « À faire »</td><td>Chef d'équipe</td></tr>
<tr><td>Corrigée</td><td>Pull Request « Fixes #n », colonne « Corrigée »</td><td>Développeur</td></tr>
<tr><td>Re-testée</td><td>Le test est rejoué ; résultat en commentaire, colonne « Re-testée »</td><td>Responsable du test</td></tr>
<tr><td>Fermée</td><td>Fusion de la Pull Request ; colonne « Fermée »</td><td>Chef d'équipe</td></tr></table>
<section class="part"><div class="k">PARTIE 2 — COMPTE RENDU 2 (CR2)</div><div class="t">Plan de test</div><ul><li>4. Plan de test (document)</li><li>5. Outil de test : Playwright</li><li>6. Le plan de test dans l'outil de gestion</li></ul></section>
<h1>4. Plan de test (document)</h1>
<p>Ce plan suit la structure de la norme IEEE 829 / ISO/IEC/IEEE 29119-3. Il couvre les quatre niveaux de test et les types de test fonctionnels et non fonctionnels.</p>
<h2>4.1 Objet et périmètre</h2>
<table><tr><th>Dans le périmètre</th><th>Hors périmètre</th></tr><tr><td>Authentification, inscription, rôles · clubs · événements · salles · équipements · réservations · tableau de bord · profil, paramètres, notifications · sécurité de l'API · performance · robustesse · affichage mobile · compatibilité · maintenabilité · dépendances · persistance · portabilité de la base</td><td>Déploiement en production ; envoi d'e-mails (non prévu) ; accessibilité avancée (lecteurs d'écran)</td></tr></table>
<h2>4.2 Stratégie : approche basée sur les risques</h2>
<p>Le plan retient 14 tests : <b>5 tests fonctionnels</b>, <b>5 tests non fonctionnels</b> et <b>4 tests d'API</b>. Ils sont choisis en priorité sur les risques les plus élevés, de sorte que toutes les exigences critiques soient couvertes.</p>
<table><tr><th>Risque produit</th><th>Probabilité</th><th>Impact</th><th>Priorité</th><th>Tests prévus</th></tr>
<tr><td>Action d'administration par un utilisateur non autorisé</td><td>Élevée</td><td>Critique</td><td>P1</td><td>API-02, TF-05</td></tr>
<tr><td>Fuite des mots de passe</td><td>Moyenne</td><td>Critique</td><td>P1</td><td>TNF-02, API-01</td></tr>
<tr><td>Double réservation d'une salle</td><td>Moyenne</td><td>Majeur</td><td>P1</td><td>API-03, TF-04</td></tr>
<tr><td>Événement dépassant la capacité d'une salle</td><td>Moyenne</td><td>Majeur</td><td>P1</td><td>TF-03</td></tr>
<tr><td>Création d'un club avec un président déjà inscrit</td><td>Moyenne</td><td>Majeur</td><td>P1</td><td>API-04</td></tr>
<tr><td>Lenteur en période d'inscription</td><td>Faible</td><td>Majeur</td><td>P2</td><td>TNF-01</td></tr>
<tr><td>Mauvais affichage sur smartphone</td><td>Moyenne</td><td>Moyen</td><td>P2</td><td>TNF-03</td></tr>
<tr><td>Perte de données au redémarrage</td><td>Faible</td><td>Critique</td><td>P2</td><td>TNF-05</td></tr></table>

<h2>4.3 Niveaux de test (cycle en V)</h2>
${img("conception/cycleV.svg", "Correspondance entre phases de développement et niveaux de test", 62)}
<table><tr><th>Niveau</th><th>Objectif</th><th>Tests</th><th>Usage de Playwright</th></tr>
<tr><td>Intégration</td><td>Vérifier l'API avec la sécurité et la base de données réelles</td><td>${PLAN.filter((t) => t.niveau === "Intégration").map((t) => t.id).join(", ")}</td><td>Module <code>request</code></td></tr>
<tr><td>Système</td><td>Vérifier l'application complète dans un navigateur</td><td>${PLAN.filter((t) => t.niveau === "Système").map((t) => t.id).join(", ")}</td><td>Navigateur, émulation smartphone, projets Edge / Firefox</td></tr>
<tr><td>Acceptation</td><td>Valider le besoin du point de vue de chaque profil</td><td>${PLAN.filter((t) => t.niveau === "Acceptation").map((t) => t.id).join(", ")}</td><td>Navigateur, scénario multi-profils</td></tr>
<tr><td>Unitaire</td><td>Vérifier chaque composant isolément</td><td>—</td><td>Hors de ce plan : Playwright teste à travers l'interface et l'API (§ 5.5)</td></tr></table>

<h2>4.4 Tests fonctionnels (5)</h2>
<p>Ils vérifient <b>ce que fait</b> l'application : les règles métier des exigences fonctionnelles.</p>
<table><tr><th>Test</th><th>Objet</th><th>Résultat attendu</th><th>Niveau</th><th>Technique</th><th>Exigences</th><th>Responsable</th></tr>
${PLAN.filter((t) => t.famille === "Fonctionnel").map(row).join("")}</table>

<h2>4.5 Tests non fonctionnels (5)</h2>
<p>Ils vérifient <b>comment se comporte</b> l'application : performance, sécurité, utilisabilité, compatibilité et fiabilité.</p>
<table><tr><th>Test</th><th>Caractéristique</th><th>Objet</th><th>Résultat attendu</th><th>Outil</th><th>Exigences</th><th>Responsable</th></tr>
${PLAN.filter((t) => t.famille === "Non fonctionnel").map((t) => `<tr><td style="white-space:nowrap"><b>${t.id}</b></td><td>${t.carac}</td><td>${esc(t.titre)}</td><td>${esc(t.attendu)}</td><td>${esc(t.outil)}</td><td>${t.ex.join(", ")}</td><td>${short(t.resp)}</td></tr>`).join("")}</table>

<h2>4.6 Tests d'API (4)</h2>
<p>Ils interrogent directement l'API REST avec le module <code>request</code> de <b>Playwright</b>, sans passer par l'interface, et vérifient le code de réponse et le contenu.</p>
<table><tr><th>Test</th><th>Requête et objet</th><th>Résultat attendu</th><th>Technique</th><th>Exigences</th><th>Responsable</th></tr>
${PLAN.filter((t) => t.famille === "API").map((t) => `<tr><td style="white-space:nowrap"><b>${t.id}</b></td><td>${esc(t.titre)}</td><td>${esc(t.attendu)}</td><td>${esc(t.tech)}</td><td>${t.ex.join(", ")}</td><td>${short(t.resp)}</td></tr>`).join("")}</table>
<h2>4.7 Techniques de test</h2>
<table><tr><th>Famille</th><th>Technique</th><th>Tests</th></tr>
<tr><td>Statique</td><td>Revue des exigences et revue de code</td><td>Reformulation des besoins en critères mesurables ; revue du code de sécurité (TNF-02)</td></tr>
<tr><td rowspan="4">Boîte noire</td><td>Partitions d'équivalence</td><td>TF-01, TF-02, API-01, API-03, API-04</td></tr>
<tr><td>Valeurs limites</td><td>TF-02 (mot de passe 5 / 6 caractères), TF-03 (40 / 41 participants)</td></tr>
<tr><td>Table de décision</td><td>TF-05 (rôle × action), API-02 (sans jeton / falsifié / membre / administrateur)</td></tr>
<tr><td>Transitions d'états</td><td>TF-04 (réservation PENDING → APPROVED / REJECTED, § 9.5)</td></tr>
<tr><td>Expérience</td><td>Test exploratoire</td><td>TNF-05 (redémarrage du serveur)</td></tr>
<tr><td>Mesure</td><td>Charge et mise en page</td><td>TNF-01 (50 requêtes simultanées), TNF-03 (360 px), TNF-04 (deux navigateurs)</td></tr></table>

<h2>4.8 Répartition des tests dans l'équipe</h2>
<table><tr><th>Membre</th><th>Rôle</th><th>Fonctionnels</th><th>Non fonctionnels</th><th>API</th><th>Total</th></tr>
${SUIVI.equipe.map((m) => { const f = (fam) => PLAN.filter((t) => t.resp === m && t.famille === fam).map((t) => t.id).join(", ") || "—"; return `<tr><td><b>${m}</b></td><td>${m === SUIVI.chef ? "Chef d'équipe" : "Membre"}</td><td>${f("Fonctionnel")}</td><td>${f("Non fonctionnel")}</td><td>${f("API")}</td><td>${PLAN.filter((t) => t.resp === m).length}</td></tr>`; }).join("")}
<tr><td colspan="5"><b>Total</b></td><td><b>${PLAN.length}</b></td></tr></table>
<p>La répartition suit les familles de tests : un membre pour les tests fonctionnels, l'autre pour les tests non fonctionnels, et le chef d'équipe pour les tests d'API. Chaque responsable écrit ses tests, les exécute, enregistre les résultats et signale les anomalies sur GitHub. Le chef d'équipe relit les tests, suit l'avancement dans le tableau de suivi et valide les critères de sortie.</p>

<h2>4.9 Matrice de traçabilité exigences → tests</h2>
<table><tr><th>Exigence</th><th>Criticité</th><th>Tests qui la vérifieront</th></tr>
${EXIGENCES.map((e) => { const l = PLAN.filter((t) => t.ex.includes(e.id)).map((t) => t.id); return `<tr><td>${e.id} ${esc(e.titre)}</td><td>${e.crit}</td><td>${l.length ? l.join(", ") : "<i>hors périmètre de cette campagne</i>"}</td></tr>`; }).join("")}</table>
<div class="note">Toutes les exigences <b>critiques</b> sont couvertes. Au total, ${EXIGENCES.filter((e) => PLAN.some((t) => t.ex.includes(e.id))).length} exigences sur ${EXIGENCES.length} sont vérifiées par au moins un test. Les autres, de criticité majeure ou mineure (équipements, notifications, maintenabilité, dépendances, configuration, portabilité), sont hors périmètre de cette campagne et seront ajoutées si le temps le permet.</div>

<h2>4.10 Environnement et données de test</h2>
<ul>
<li><b>Intégration et système :</b> backend réel sur MySQL 8 (Docker) ; chaque test crée ses propres données pour pouvoir être rejoué.</li>
<li><b>Acceptation :</b> base réinitialisée ; comptes admin@enicar.tn et ahmed@enicar.tn.</li>
<li><b>Navigateurs :</b> Microsoft Edge et Firefox, en 1440 × 900 et en 360 × 800 (smartphone).</li></ul>
<h2>4.11 Critères d'entrée, de sortie et de suspension</h2>
<table><tr><th>Critère</th><th>Définition</th></tr>
<tr><td>Entrée</td><td>Application compilée et démarrée ; base de test accessible ; exigences et cas de test publiés sur GitHub</td></tr>
<tr><td>Sortie</td><td>100 % des cas exécutés ; aucune anomalie critique ou majeure ouverte ; 100 % des exigences critiques couvertes ; couverture des instructions ≥ 70 % ; p95 &lt; 500 ms</td></tr>
<tr><td>Suspension</td><td>Environnement indisponible ou anomalie bloquante empêchant plus de 30 % des tests</td></tr>
<tr><td>Reprise</td><td>Correctif livré ; re-test de confirmation puis non-régression complète</td></tr></table>
<h2>4.12 Gestion des anomalies et des tests</h2>
<p><b>Cycle de vie d'une anomalie :</b> Détectée → Confirmée → Corrigée → Re-testée → Fermée. <b>Gravité :</b> critique (sécurité, perte de données), majeure (fonction dégradée), mineure (gêne). Sur GitHub, chaque exigence, chaque cas de test et chaque anomalie est une issue ; une anomalie est liée à l'exigence concernée et au test qui l'a détectée, et la Pull Request qui la corrige la ferme. Les jalons représentent les campagnes de test.</p>

<h1>5. Outil de test : Playwright</h1>
<p>Les 14 tests du plan s'exécutent avec <b>un seul outil : Playwright</b> (version 1.65), déjà installé dans le projet. Playwright pilote un vrai navigateur, envoie des requêtes HTTP directement à l'API et simule différents écrans et navigateurs : il couvre donc les trois familles de tests.</p>
<h2>5.1 Les trois usages de Playwright dans le plan</h2>
<table><tr><th>Usage</th><th>Ce qu'il fait</th><th>Tests</th><th>Responsable</th></tr>
<tr><td><b>Navigateur</b></td><td>Ouvre l'application dans Microsoft Edge et rejoue un parcours d'utilisateur : saisir, cliquer, vérifier ce qui s'affiche</td><td>TF-01 à TF-05</td><td>${short(PLAN.find((t) => t.id === "TF-01").resp)}</td></tr>
<tr><td><b>Module <code>request</code></b></td><td>Envoie des requêtes HTTP à l'API REST, sans interface, et vérifie le code de réponse, le contenu et le temps de réponse</td><td>API-01 à API-04, TNF-01, TNF-02, TNF-05</td><td>${short(SUIVI.chef)} (API), ${short(PLAN.find((t) => t.id === "TNF-01").resp)} (TNF)</td></tr>
<tr><td><b>Émulation et projets</b></td><td>Simule un écran de smartphone (360 × 800) et rejoue les mêmes tests dans Edge et dans Firefox</td><td>TNF-03, TNF-04</td><td>${short(PLAN.find((t) => t.id === "TNF-03").resp)}</td></tr></table>
<h2>5.2 Interface graphique et rapports</h2>
<ul><li><b>UI Mode</b> (<code>npx playwright test --ui</code>) : application graphique qui affiche l'arborescence des tests, les lance d'un clic et montre pour chaque test la liste des actions, une chronologie avec des captures de la page avant et après chaque action, la console et les requêtes réseau.</li>
<li><b>Rapport HTML</b> (<code>npx playwright show-report</code>) : la liste des tests avec leur statut et leur durée, et pour un test en échec la capture d'écran et la trace de l'exécution.</li>
<li><b>Ligne de commande</b> (<code>npx playwright test</code>) : exécution de toute la suite, par exemple avant chaque version.</li></ul>
<h2>5.3 Configuration prévue</h2>
${code(`// playwright.config.js — deux navigateurs, application lancée automatiquement
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://localhost:5173", screenshot: "only-on-failure" },
  projects: [
    { name: "edge", use: { channel: "msedge" } },
    { name: "firefox", use: { browserName: "firefox" } },
  ],
  webServer: { command: "npm run dev", url: "http://localhost:5173" },
});`)}
<table><tr><th>Dossier</th><th>Contenu</th><th>Responsable</th></tr>
<tr><td><code>tests/fonctionnels/</code></td><td>TF-01 à TF-05</td><td>${short(PLAN.find((t) => t.id === "TF-01").resp)}</td></tr>
<tr><td><code>tests/non-fonctionnels/</code></td><td>TNF-01 à TNF-05</td><td>${short(PLAN.find((t) => t.id === "TNF-01").resp)}</td></tr>
<tr><td><code>tests/api/</code></td><td>API-01 à API-04</td><td>${short(SUIVI.chef)}</td></tr></table>
<h2>5.4 Exemples de tests prévus</h2>
<h3>Test fonctionnel — TF-03 (navigateur, valeurs limites)</h3>
${code(`test("TF-03 : 41 participants pour une salle de 40 places sont refusés", async ({ page }) => {
  await connecter(page, PRESIDENT);
  await page.getByRole("link", { name: "Événements" }).click();
  await page.getByRole("button", { name: /nouvel événement/i }).click();
  await remplirEvenement(page, { salle: "Salle 40 places", participants: "41" });
  await page.getByRole("button", { name: "Créer" }).click();
  await expect(page.getByRole("alert")).toContainText("entre 0 et 40");
});`)}
<h3>Test non fonctionnel — TNF-01 (performance, module request)</h3>
${code(`test("TNF-01 : 95 % de 50 requêtes simultanées en moins de 500 ms", async ({ request }) => {
  const mesures = await Promise.all(Array.from({ length: 50 }, async () => {
    const debut = Date.now();
    const reponse = await request.get(API + "/clubs");
    expect(reponse.status()).toBe(200);
    return Date.now() - debut;
  }));
  mesures.sort((a, b) => a - b);
  expect(mesures[Math.ceil(0.95 * mesures.length) - 1]).toBeLessThan(500);
});`)}
<h3>Test d'API — API-02 (contrôle d'accès, table de décision)</h3>
${code(`test("API-02 : un jeton falsifié est refusé (401)", async ({ request }) => {
  const reponse = await request.post(API + "/rooms", {
    headers: { Authorization: "Bearer jeton-falsifie" },
    data: { name: "Salle test", capacity: 10, type: "SALLE" },
  });
  expect(reponse.status()).toBe(401);
});`)}
<h2>5.5 Limites assumées</h2>
<ul><li><b>Tests unitaires :</b> Playwright teste l'application à travers l'interface et l'API ; les composants isolés ne font pas partie de ce plan.</li>
<li><b>Charge :</b> TNF-01 envoie 50 requêtes simultanées depuis un seul poste ; c'est une mesure de temps de réponse sous charge, plus légère qu'un outil de charge dédié.</li></ul>

<h1>6. Le plan de test dans l'outil de gestion</h1>
<p>Le plan de test est livré sous deux formes : ce document, et sa saisie dans l'outil de gestion des tests (GitHub). Chacun des 14 tests y devient une issue assignée à son responsable et rangée dans le jalon de la campagne.</p>
<table><tr><th>Élément GitHub</th><th>Contenu</th></tr>
<tr><td>Jalon</td><td>« CR2 — Plan de test » : regroupe les 14 tests de la campagne</td></tr>
<tr><td>Issues</td><td>${PLAN.length} issues : ${PLAN.filter((t) => t.famille === "Fonctionnel").length} <code>[TF-xx]</code>, ${PLAN.filter((t) => t.famille === "Non fonctionnel").length} <code>[TNF-xx]</code>, ${PLAN.filter((t) => t.famille === "API").length} <code>[API-xx]</code></td></tr>
<tr><td>Libellés</td><td><code>fonctionnel</code>, <code>non fonctionnel</code>, <code>api</code> ; niveau (<code>intégration</code>, <code>système</code>, <code>acceptation</code>)</td></tr>
<tr><td>Assignation</td><td>Tests fonctionnels : ${PLAN.find((t) => t.famille === "Fonctionnel").resp} · non fonctionnels : ${PLAN.find((t) => t.famille === "Non fonctionnel").resp} · API : ${SUIVI.chef}</td></tr>
<tr><td>Tableau Projects</td><td>Les 14 tests dans la colonne « À faire » au début de la campagne</td></tr></table>
<h3>Exemple de fiche de test dans l'outil : issue [API-03]</h3>
${code(`Titre : [API-03] POST /api/reservations : double réservation refusée
Libellés : api · intégration          Assignée à : ${SUIVI.chef}          Jalon : CR2 — Plan de test

| Niveau      | Technique                                                   | Outil                        |
|-------------|-------------------------------------------------------------|------------------------------|
| Intégration | Partitions (ressource libre / déjà réservée / inexistante)  | Playwright — module request  |

Vérifie : EF-09 (Réservation de ressources)
Résultat attendu : ressource libre → 200 et statut PENDING ; même salle à la même date → 409 ;
ressource inexistante → 400.
Fichier : tests/api/API-03.spec.js`)}

<section class="part"><div class="k">PARTIE 3 — COMPLÉMENTS DU RAPPORT</div><div class="t">Besoins, architecture, conception et revue</div><ul><li>7. Spécification des besoins</li><li>8. Architecture</li><li>9. Conception</li><li>10. Revue formelle du rapport</li></ul></section>
<h1>7. Spécification des besoins</h1>
<p>Chaque exigence a un identifiant unique, repris dans les cas de test pour assurer la traçabilité. La criticité (critique, majeure, mineure) oriente l'effort de test.</p>
<h2>7.1 Exigences fonctionnelles</h2>
<table><tr><th>Réf.</th><th>Exigence</th><th>Description</th><th>Criticité</th></tr>
${EF.map((e) => `<tr><td>${e.id}</td><td>${esc(e.titre)}</td><td>${esc(e.desc)}</td><td>${e.crit}</td></tr>`).join("")}</table>
<h2>7.2 Exigences non fonctionnelles</h2>
<table><tr><th>Réf.</th><th>Exigence</th><th>Catégorie</th><th>Description (mesurable)</th><th>Criticité</th></tr>
${ENF.map((e) => `<tr><td>${e.id}</td><td>${esc(e.titre)}</td><td>${e.cat}</td><td>${esc(e.desc)}</td><td>${e.crit}</td></tr>`).join("")}</table>
<h2>7.3 Règles de gestion</h2>
<table><tr><th>Règle</th><th>Exigence</th></tr>
<tr><td>Seules les adresses se terminant par @enicar.tn peuvent s'inscrire ; mot de passe d'au moins 6 caractères</td><td>EF-02</td></tr>
<tr><td>Un nouvel inscrit reçoit toujours le rôle CLUB_MEMBER, quel que soit le rôle envoyé</td><td>EF-02</td></tr>
<tr><td>L'e-mail du président d'un nouveau club ne doit pas déjà exister</td><td>EF-05</td></tr>
<tr><td>Un événement a lieu dans une salle existante, à une date future, avec 0 à N participants (N = capacité de la salle)</td><td>EF-06</td></tr>
<tr><td>La capacité d'une salle est strictement positive</td><td>EF-07</td></tr>
<tr><td>Une ressource ne peut être réservée qu'une fois par date (hors réservations rejetées)</td><td>EF-09</td></tr>
<tr><td>Toute réservation commence à PENDING ; seule l'administration la passe à APPROVED ou REJECTED</td><td>EF-09</td></tr></table>

<h1>8. Architecture</h1>
<h2>8.1 Architecture générale</h2>
<p>La plateforme suit une architecture en trois couches. Le navigateur exécute une application React (SPA) qui appelle une API REST Spring Boot. L'API applique la sécurité et les règles métier, puis lit et écrit les données dans MySQL par Spring Data JPA.</p>
${img("conception/architecture.svg", "Architecture générale en trois couches", 50)}
<h2>8.2 Technologies</h2>
<table><tr><th>Couche</th><th>Technologies</th><th>Rôle</th></tr>
<tr><td>Présentation</td><td>React 19, Vite 8, React Router 7, Axios, Tailwind CSS</td><td>Pages, navigation, appels à l'API, affichage responsive</td></tr>
<tr><td>Métier</td><td>Java 17, Spring Boot 4, Spring Web MVC, Spring Security, Lombok</td><td>API REST, authentification, contrôle d'accès, règles métier</td></tr>
<tr><td>Données</td><td>Spring Data JPA, Hibernate 7, MySQL 8 (ou XAMPP)</td><td>Persistance, schéma généré par Hibernate</td></tr>
<tr><td>Outillage</td><td>Maven, npm, Docker, Git / GitHub</td><td>Construction, dépendances, base de données de test, versionnement</td></tr></table>
<h2>8.3 Architecture du backend</h2>
${code(`backend/src/main/java/com/example/backend/
├── BackendApplication.java        démarrage de Spring Boot
├── DataLoader.java                données initiales (admin, président, club IEEE, salle, équipements)
├── security/   SecurityConfig, TokenService, TokenAuthenticationFilter   authentification et règles d'accès
├── controller/ AuthController, ClubController, EventController,          points d'entrée REST
│               RoomController, EquipmentController, ReservationController
├── repository/ UserRepository, ClubRepository, EventRepository, …       accès aux données (Spring Data JPA)
├── model/      User, Club, Event, Room, Equipment, Reservation          entités JPA
├── dto/        ClubCreationRequest                                      données reçues à la création d'un club
└── web/        ApiError, ApiExceptionHandler                            erreurs renvoyées au client (400, 404, 409)`)}
<p>Chaque requête traverse le filtre de jetons, puis les règles d'accès de <code>SecurityConfig</code>, avant d'atteindre le contrôleur. Les contrôleurs vérifient les règles métier et renvoient des erreurs explicites (400, 404, 409) plutôt qu'une erreur serveur.</p>
<h2>8.4 Architecture du frontend</h2>
${code(`frontend/src/
├── main.jsx, App.jsx        démarrage et routes (React Router)
├── api/        axios.js (client HTTP, jeton), errors.js (messages d'erreur)
├── context/    AuthContext.jsx, useAuth.js     session de l'utilisateur
├── components/ Layout, Sidebar, ProtectedRoute, ErrorAlert
└── pages/      Login, Register, Dashboard, Clubs, Events, Rooms, Equipment,
                Reservations, Profile, Settings, Notifications`)}
<p><code>ProtectedRoute</code> redirige vers la page de connexion toute personne non connectée. Les pages affichent ou masquent les actions selon le rôle de l'utilisateur ; l'API applique de nouveau ces règles côté serveur.</p>
<h2>8.5 API REST</h2>
<table><tr><th>Méthode</th><th>Chemin</th><th>Description</th><th>Accès</th></tr>
${API.map(([m, p, d, a]) => `<tr><td><code>${m}</code></td><td><code>${p}</code></td><td>${d}</td><td>${a}</td></tr>`).join("")}</table>
<h2>8.6 Sécurité</h2>
<ul><li><b>Mots de passe :</b> hachés avec BCrypt ; le hash n'est jamais renvoyé par l'API.</li>
<li><b>Authentification :</b> à la connexion, le serveur délivre un jeton aléatoire de 256 bits ; le client l'envoie dans l'en-tête <code>Authorization: Bearer</code>, et le filtre le vérifie à chaque requête.</li>
<li><b>Autorisation :</b> règles par rôle dans <code>SecurityConfig</code> ; une requête sans jeton reçoit 401, une requête d'un rôle non autorisé reçoit 403.</li>
<li><b>CORS :</b> seule l'origine du frontend est autorisée (configurable).</li>
<li><b>Configuration :</b> identifiants de la base lus dans des variables d'environnement.</li></ul>
<h2>8.7 Déploiement</h2>
${img("conception/deploiement.svg", "Diagramme de déploiement (environnement de développement et de test)", 85)}

<h1>9. Conception</h1>
<h2>9.1 Diagramme de cas d'utilisation</h2>
${img("conception/casUtilisation.svg", "Diagramme de cas d'utilisation", 72)}
<h3>Description textuelle : « Réserver une salle ou un équipement »</h3>
<table><tr><th style="width:24%">Élément</th><th>Description</th></tr>
<tr><td>Acteur principal</td><td>Membre de club (le président hérite de ce cas)</td></tr>
<tr><td>Préconditions</td><td>Le membre est connecté ; la ressource existe</td></tr>
<tr><td>Scénario nominal</td><td>1. Le membre ouvre « Réservations » et clique sur « Nouvelle réservation ». 2. Il choisit le type (salle ou équipement), la ressource et la date. 3. Le système vérifie que la ressource existe et qu'elle est libre à cette date. 4. Le système enregistre la réservation avec le statut PENDING et l'affiche.</td></tr>
<tr><td>Scénarios alternatifs</td><td>3a. Ressource déjà réservée à cette date : message « Ressource déjà réservée », rien n'est enregistré. 3b. Ressource inexistante : message d'erreur.</td></tr>
<tr><td>Postcondition</td><td>Une réservation PENDING attend la décision de l'administration</td></tr>
<tr><td>Exigences</td><td>EF-09, EF-03</td></tr></table>
<h2>9.2 Diagramme de classes</h2>
${img("conception/classes.svg", "Diagramme de classes du domaine", 92)}
<p>Les associations sont portées par des identifiants : un club référence son président (<code>presidentId</code>) et ses membres (<code>members</code>) ; un événement référence son club et sa salle ; une réservation référence son club et la ressource réservée (<code>resourceType</code> + <code>resourceId</code>).</p>
<h2>9.3 Modèle de données</h2>
${img("conception/donnees.svg", "Modèle physique des données (MySQL)", 80)}
<h2>9.4 Diagrammes de séquence</h2>
${img("conception/sequenceConnexion.svg", "Diagramme de séquence : connexion", 100)}
${img("conception/sequenceReservation.svg", "Diagramme de séquence : réservation par un membre et approbation par l'administration", 100)}
<h2>9.5 Diagramme d'états : réservation</h2>
${img("conception/etatsReservation.svg", "Cycle de vie d'une réservation", 80)}

<h1>10. Revue formelle du rapport</h1>
<p>Le rapport (CR1, CR2 et compléments) est soumis à une <b>revue formelle</b> : une technique de test statique, sans exécuter le code, qui examine un document selon un processus défini, avec des rôles, une liste de contrôle et un compte rendu écrit.</p>
<h2>10.1 Revue informelle et revue formelle</h2>
<table><tr><th>Critère</th><th>Revue informelle</th><th>Revue formelle</th></tr>
<tr><td>Processus</td><td>Libre, sans étapes fixées</td><td>Étapes définies : planification, lancement, préparation, réunion, correction, suivi</td></tr>
<tr><td>Rôles</td><td>Un collègue relit</td><td>Auteur, modérateur, relecteurs, secrétaire</td></tr>
<tr><td>Support</td><td>Remarques orales</td><td>Liste de contrôle et fiche d'anomalies de revue</td></tr>
<tr><td>Résultat</td><td>Non tracé</td><td>Compte rendu écrit, décision (accepté, accepté avec corrections, à revoir)</td></tr></table>
<h2>10.2 Rôles</h2>
<table><tr><th>Rôle</th><th>Personne</th><th>Responsabilité</th></tr>
<tr><td>Auteur</td><td>${SUIVI.chef}</td><td>Présente le rapport et corrige les anomalies relevées</td></tr>
<tr><td>Modérateur</td><td>${SUIVI.encadrant} (encadrant)</td><td>Conduit la réunion, veille au respect du processus, décide de l'issue de la revue</td></tr>
<tr><td>Relecteurs</td><td>${SUIVI.equipe.filter((m) => m !== SUIVI.chef).join(", ")}</td><td>Examinent le rapport avant la réunion avec la liste de contrôle</td></tr>
<tr><td>Secrétaire</td><td>${SUIVI.equipe[1]}</td><td>Consigne les anomalies et les décisions dans la fiche de revue</td></tr></table>
<h2>10.3 Étapes</h2>
<table><tr><th>Étape</th><th>Activité</th></tr>
<tr><td>1. Planification</td><td>Choix du document (version du rapport), des rôles, des critères d'entrée et de la date</td></tr>
<tr><td>2. Lancement</td><td>Présentation des objectifs, de la liste de contrôle et du rapport aux relecteurs</td></tr>
<tr><td>3. Préparation individuelle</td><td>Chaque relecteur examine le rapport et note ses anomalies</td></tr>
<tr><td>4. Réunion de revue</td><td>Les anomalies sont discutées, classées par gravité et consignées</td></tr>
<tr><td>5. Correction</td><td>L'auteur corrige le rapport</td></tr>
<tr><td>6. Suivi</td><td>Le modérateur vérifie les corrections et clôt la revue</td></tr></table>
<h2>10.4 Liste de contrôle</h2>
<table><tr><th>N°</th><th>Point de contrôle</th></tr>
<tr><td>1</td><td>Chaque exigence a un identifiant unique et un critère vérifiable</td></tr>
<tr><td>2</td><td>Chaque exigence critique est vérifiée par au moins un test (matrice de traçabilité)</td></tr>
<tr><td>3</td><td>Chaque test a un résultat attendu précis, une technique, un niveau et un responsable</td></tr>
<tr><td>4</td><td>Les diagrammes de conception sont cohérents entre eux et avec l'API décrite</td></tr>
<tr><td>5</td><td>Les critères d'entrée et de sortie sont mesurables</td></tr>
<tr><td>6</td><td>Le vocabulaire est le même dans tout le rapport (noms des profils, des statuts, des tests)</td></tr></table>
<h2>10.5 Fiche d'anomalies de revue</h2>
<table><tr><th>N°</th><th>Section</th><th>Description de l'anomalie</th><th>Gravité</th><th>Relevée par</th><th>Statut</th></tr>
<tr><td>R-01</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>R-02</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>R-03</td><td></td><td></td><td></td><td></td><td></td></tr></table>
<p class="note">La fiche est remplie pendant la réunion de revue. Décision finale : ☐ accepté · ☐ accepté avec corrections · ☐ à revoir.</p>
<h1>11. Conclusion</h1>
<p>Ce rapport réunit les deux premiers comptes rendus. Le CR1 décrit la plateforme de gestion des clubs (profils, fonctionnalités) et l'outil de gestion des tests, GitHub, qui relie exigences, tests, anomalies et corrections. Le CR2 fixe le plan de test : ${PLAN.length} tests exécutés avec un seul outil, Playwright, dont 5 fonctionnels confiés à ${PLAN.find((t) => t.famille === "Fonctionnel").resp}, 5 non fonctionnels confiés à ${PLAN.find((t) => t.famille === "Non fonctionnel").resp} et 4 tests d'API pris en charge par le chef d'équipe, ${SUIVI.chef}. Il est complété par les ${EXIGENCES.length} exigences, l'architecture en trois couches et la conception (cas d'utilisation, classes, données, séquences, états), et sera soumis à une revue formelle.</p>
</body></html>`;

writeFileSync(new URL("./Rapport_Conception_Plan_de_Test.html", import.meta.url), html);
console.log("figures:", fig, "| cas:", CAS.length, "| fonctionnels:", fonctionnels.length, "| non fonctionnels:", nonFonctionnels.length);
