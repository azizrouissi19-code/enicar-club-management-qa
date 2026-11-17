// Rapport d'évaluation : description du projet, architecture, conception et plan de test.
// Ne contient aucun résultat d'exécution (phase suivante du projet).
// Usage : node qa/report/build-conception.mjs  →  qa/report/Rapport_Conception_Plan_de_Test.html
import { writeFileSync, readFileSync } from "node:fs";
import { EXIGENCES, CAS, RESPONSABLE } from "../referentiel.mjs";

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
</style></head><body>

<section class="cover">
<div>
<div class="top">ÉCOLE NATIONALE D'INGÉNIEURS DE CARTHAGE · ATELIER TEST LOGICIEL</div>
<div class="t">Plateforme de gestion des clubs de l'ENICarthage</div>
<div class="s">Rapport d'évaluation — description du projet, architecture, conception et plan de test</div>
<div class="pills"><span>${EF.length} exigences fonctionnelles</span><span>${ENF.length} exigences non fonctionnelles</span><span>${CAS.length} cas de test planifiés</span><span>9 diagrammes</span></div>
</div>
<div class="band">
<div><b>Réalisé par :</b> ${SUIVI.equipe.join(" · ")}</div>
<div><b>Chef d'équipe :</b> ${SUIVI.chef}</div>
<div><b>Encadrement :</b> ${SUIVI.encadrant}</div>
<div><b>Outils de test :</b> Jest, Postman, Playwright, k6, JaCoCo · gestion des tests sur GitHub</div>
<div><b>Date :</b> 16 novembre 2026 · Année universitaire 2026 – 2027</div>
</div>
</section>

<section class="toc"><h1 style="page-break-before:always">Sommaire</h1>
<div>1. Introduction</div>
<div>2. Présentation du projet</div>
<div>3. Analyse des besoins</div>
<div>4. Architecture</div>
<div class="l2">4.1 Architecture générale · 4.2 Technologies · 4.3 Backend · 4.4 Frontend · 4.5 API REST · 4.6 Sécurité · 4.7 Déploiement</div>
<div>5. Conception</div>
<div class="l2">5.1 Cas d'utilisation · 5.2 Diagramme de classes · 5.3 Modèle de données · 5.4 Diagrammes de séquence · 5.5 Diagramme d'états</div>
<div>6. Plan de test</div>
<div class="l2">6.1 Objet et périmètre · 6.2 Stratégie · 6.3 Niveaux · 6.4 Types · 6.5 Techniques · 6.6 Cas de test · 6.7 Traçabilité · 6.8 Outils · 6.9 Environnement · 6.10 Critères · 6.11 Anomalies</div>
<div>7. Organisation de l'équipe et planning</div>
<div>8. Conclusion et prochaines étapes</div>
</section>

<h1>1. Introduction</h1>
<p>Ce rapport présente notre projet pour l'atelier de test logiciel : une plateforme web de gestion des clubs de l'ENICarthage. Il décrit le projet, ses besoins, son architecture et sa conception, puis le plan de test qui guidera la campagne de test des prochaines semaines.</p>
<table><tr><th>Objectif de l'atelier</th><th>Traitement dans ce rapport</th><th>Chap.</th></tr>
<tr><td>1. Choisir un projet</td><td>Plateforme de gestion des clubs (Spring Boot, React, MySQL)</td><td>2</td></tr>
<tr><td>2. Présenter les besoins fonctionnels et non fonctionnels</td><td>${EF.length} exigences fonctionnelles et ${ENF.length} non fonctionnelles, avec leur criticité</td><td>3</td></tr>
<tr><td>3. Utiliser un outil de gestion de test</td><td>GitHub : exigences, cas de test et anomalies sous forme d'issues liées ; tableau de suivi hebdomadaire</td><td>6.11, 7</td></tr>
<tr><td>4. Élaborer un plan de test</td><td>Plan IEEE 829 : niveaux, types (fonctionnels et non fonctionnels), techniques, outils, critères</td><td>6</td></tr>
<tr><td>5. Exécuter le plan de test</td><td>Planifié pour les semaines 48 à 50 (chapitre 7)</td><td>7</td></tr></table>

<h1>2. Présentation du projet</h1>
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

<h1>3. Analyse des besoins</h1>
<p>Chaque exigence a un identifiant unique, repris dans les cas de test pour assurer la traçabilité. La criticité (critique, majeure, mineure) oriente l'effort de test.</p>
<h2>3.1 Exigences fonctionnelles</h2>
<table><tr><th>Réf.</th><th>Exigence</th><th>Description</th><th>Criticité</th></tr>
${EF.map((e) => `<tr><td>${e.id}</td><td>${esc(e.titre)}</td><td>${esc(e.desc)}</td><td>${e.crit}</td></tr>`).join("")}</table>
<h2>3.2 Exigences non fonctionnelles</h2>
<table><tr><th>Réf.</th><th>Exigence</th><th>Catégorie</th><th>Description (mesurable)</th><th>Criticité</th></tr>
${ENF.map((e) => `<tr><td>${e.id}</td><td>${esc(e.titre)}</td><td>${e.cat}</td><td>${esc(e.desc)}</td><td>${e.crit}</td></tr>`).join("")}</table>
<h2>3.3 Règles de gestion</h2>
<table><tr><th>Règle</th><th>Exigence</th></tr>
<tr><td>Seules les adresses se terminant par @enicar.tn peuvent s'inscrire ; mot de passe d'au moins 6 caractères</td><td>EF-02</td></tr>
<tr><td>Un nouvel inscrit reçoit toujours le rôle CLUB_MEMBER, quel que soit le rôle envoyé</td><td>EF-02</td></tr>
<tr><td>L'e-mail du président d'un nouveau club ne doit pas déjà exister</td><td>EF-05</td></tr>
<tr><td>Un événement a lieu dans une salle existante, à une date future, avec 0 à N participants (N = capacité de la salle)</td><td>EF-06</td></tr>
<tr><td>La capacité d'une salle est strictement positive</td><td>EF-07</td></tr>
<tr><td>Une ressource ne peut être réservée qu'une fois par date (hors réservations rejetées)</td><td>EF-09</td></tr>
<tr><td>Toute réservation commence à PENDING ; seule l'administration la passe à APPROVED ou REJECTED</td><td>EF-09</td></tr></table>

<h1>4. Architecture</h1>
<h2>4.1 Architecture générale</h2>
<p>La plateforme suit une architecture en trois couches. Le navigateur exécute une application React (SPA) qui appelle une API REST Spring Boot. L'API applique la sécurité et les règles métier, puis lit et écrit les données dans MySQL par Spring Data JPA.</p>
${img("conception/architecture.svg", "Architecture générale en trois couches", 50)}
<h2>4.2 Technologies</h2>
<table><tr><th>Couche</th><th>Technologies</th><th>Rôle</th></tr>
<tr><td>Présentation</td><td>React 19, Vite 8, React Router 7, Axios, Tailwind CSS</td><td>Pages, navigation, appels à l'API, affichage responsive</td></tr>
<tr><td>Métier</td><td>Java 17, Spring Boot 4, Spring Web MVC, Spring Security, Lombok</td><td>API REST, authentification, contrôle d'accès, règles métier</td></tr>
<tr><td>Données</td><td>Spring Data JPA, Hibernate 7, MySQL 8 (ou XAMPP)</td><td>Persistance, schéma généré par Hibernate</td></tr>
<tr><td>Outillage</td><td>Maven, npm, Docker, Git / GitHub</td><td>Construction, dépendances, base de données de test, versionnement</td></tr></table>
<h2>4.3 Architecture du backend</h2>
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
<h2>4.4 Architecture du frontend</h2>
${code(`frontend/src/
├── main.jsx, App.jsx        démarrage et routes (React Router)
├── api/        axios.js (client HTTP, jeton), errors.js (messages d'erreur)
├── context/    AuthContext.jsx, useAuth.js     session de l'utilisateur
├── components/ Layout, Sidebar, ProtectedRoute, ErrorAlert
└── pages/      Login, Register, Dashboard, Clubs, Events, Rooms, Equipment,
                Reservations, Profile, Settings, Notifications`)}
<p><code>ProtectedRoute</code> redirige vers la page de connexion toute personne non connectée. Les pages affichent ou masquent les actions selon le rôle de l'utilisateur ; l'API applique de nouveau ces règles côté serveur.</p>
<h2>4.5 API REST</h2>
<table><tr><th>Méthode</th><th>Chemin</th><th>Description</th><th>Accès</th></tr>
${API.map(([m, p, d, a]) => `<tr><td><code>${m}</code></td><td><code>${p}</code></td><td>${d}</td><td>${a}</td></tr>`).join("")}</table>
<h2>4.6 Sécurité</h2>
<ul><li><b>Mots de passe :</b> hachés avec BCrypt ; le hash n'est jamais renvoyé par l'API.</li>
<li><b>Authentification :</b> à la connexion, le serveur délivre un jeton aléatoire de 256 bits ; le client l'envoie dans l'en-tête <code>Authorization: Bearer</code>, et le filtre le vérifie à chaque requête.</li>
<li><b>Autorisation :</b> règles par rôle dans <code>SecurityConfig</code> ; une requête sans jeton reçoit 401, une requête d'un rôle non autorisé reçoit 403.</li>
<li><b>CORS :</b> seule l'origine du frontend est autorisée (configurable).</li>
<li><b>Configuration :</b> identifiants de la base lus dans des variables d'environnement.</li></ul>
<h2>4.7 Déploiement</h2>
${img("conception/deploiement.svg", "Diagramme de déploiement (environnement de développement et de test)", 85)}

<h1>5. Conception</h1>
<h2>5.1 Diagramme de cas d'utilisation</h2>
${img("conception/casUtilisation.svg", "Diagramme de cas d'utilisation", 72)}
<h3>Description textuelle : « Réserver une salle ou un équipement »</h3>
<table><tr><th style="width:24%">Élément</th><th>Description</th></tr>
<tr><td>Acteur principal</td><td>Membre de club (le président hérite de ce cas)</td></tr>
<tr><td>Préconditions</td><td>Le membre est connecté ; la ressource existe</td></tr>
<tr><td>Scénario nominal</td><td>1. Le membre ouvre « Réservations » et clique sur « Nouvelle réservation ». 2. Il choisit le type (salle ou équipement), la ressource et la date. 3. Le système vérifie que la ressource existe et qu'elle est libre à cette date. 4. Le système enregistre la réservation avec le statut PENDING et l'affiche.</td></tr>
<tr><td>Scénarios alternatifs</td><td>3a. Ressource déjà réservée à cette date : message « Ressource déjà réservée », rien n'est enregistré. 3b. Ressource inexistante : message d'erreur.</td></tr>
<tr><td>Postcondition</td><td>Une réservation PENDING attend la décision de l'administration</td></tr>
<tr><td>Exigences</td><td>EF-09, EF-03</td></tr></table>
<h2>5.2 Diagramme de classes</h2>
${img("conception/classes.svg", "Diagramme de classes du domaine", 92)}
<p>Les associations sont portées par des identifiants : un club référence son président (<code>presidentId</code>) et ses membres (<code>members</code>) ; un événement référence son club et sa salle ; une réservation référence son club et la ressource réservée (<code>resourceType</code> + <code>resourceId</code>).</p>
<h2>5.3 Modèle de données</h2>
${img("conception/donnees.svg", "Modèle physique des données (MySQL)", 80)}
<h2>5.4 Diagrammes de séquence</h2>
${img("conception/sequenceConnexion.svg", "Diagramme de séquence : connexion", 100)}
${img("conception/sequenceReservation.svg", "Diagramme de séquence : réservation par un membre et approbation par l'administration", 100)}
<h2>5.5 Diagramme d'états : réservation</h2>
${img("conception/etatsReservation.svg", "Cycle de vie d'une réservation", 80)}

<h1>6. Plan de test</h1>
<p>Ce plan suit la structure de la norme IEEE 829 / ISO/IEC/IEEE 29119-3. Il couvre les quatre niveaux de test et les types de test fonctionnels et non fonctionnels.</p>
<h2>6.1 Objet et périmètre</h2>
<table><tr><th>Dans le périmètre</th><th>Hors périmètre</th></tr><tr><td>Authentification, inscription, rôles · clubs · événements · salles · équipements · réservations · tableau de bord · profil, paramètres, notifications · sécurité de l'API · performance · robustesse · affichage mobile · compatibilité · maintenabilité · dépendances · persistance · portabilité de la base</td><td>Déploiement en production ; envoi d'e-mails (non prévu) ; accessibilité avancée (lecteurs d'écran)</td></tr></table>
<h2>6.2 Stratégie : approche basée sur les risques</h2>
<table><tr><th>Risque produit</th><th>Probabilité</th><th>Impact</th><th>Priorité</th><th>Tests prévus</th></tr>
<tr><td>Action d'administration par un utilisateur non autorisé</td><td>Élevée</td><td>Critique</td><td>P1</td><td>TI-03, TU-02, TU-04, TNF-06</td></tr>
<tr><td>Fuite des mots de passe</td><td>Moyenne</td><td>Critique</td><td>P1</td><td>TI-01, TU-01, TNF-06</td></tr>
<tr><td>Double réservation d'une salle</td><td>Moyenne</td><td>Majeur</td><td>P1</td><td>TI-06, TS-05, TA-03</td></tr>
<tr><td>Événement dépassant la capacité d'une salle</td><td>Moyenne</td><td>Majeur</td><td>P1</td><td>TI-05, TA-02</td></tr>
<tr><td>Erreur serveur sur une saisie invalide</td><td>Moyenne</td><td>Moyen</td><td>P2</td><td>TI-01 à TI-07, TNF-06</td></tr>
<tr><td>Lenteur en période d'inscription</td><td>Faible</td><td>Majeur</td><td>P2</td><td>TNF-01, TNF-06</td></tr>
<tr><td>Mauvais affichage sur smartphone</td><td>Moyenne</td><td>Moyen</td><td>P2</td><td>TS-07</td></tr>
<tr><td>Dépendances vulnérables</td><td>Élevée</td><td>Majeur</td><td>P2</td><td>TNF-02</td></tr>
<tr><td>Perte de données au redémarrage</td><td>Faible</td><td>Critique</td><td>P2</td><td>TNF-05</td></tr></table>
<h2>6.3 Niveaux de test (cycle en V)</h2>
${img("conception/cycleV.svg", "Correspondance entre phases de développement et niveaux de test", 62)}
<table><tr><th>Niveau</th><th>Objectif</th><th>Cas</th><th>Outil</th></tr>
<tr><td>Unitaire / composant</td><td>Vérifier chaque composant isolément (API simulée)</td><td>TU-01 … TU-06</td><td>Jest + React Testing Library</td></tr>
<tr><td>Intégration</td><td>Vérifier l'API avec la sécurité et la base de données réelles</td><td>TI-01 … TI-07, TNF-06</td><td>Postman, Jest</td></tr>
<tr><td>Système</td><td>Vérifier l'application complète dans un navigateur</td><td>TS-01 … TS-08, TNF-01</td><td>Playwright, k6</td></tr>
<tr><td>Acceptation</td><td>Valider le besoin du point de vue de chaque profil</td><td>TA-01 … TA-03</td><td>Navigateur, fiches de test</td></tr></table>
<h2>6.4 Types de test</h2>
<h3>Tests fonctionnels — ce que fait l'application</h3>
<table><tr><th>Cas</th><th>Objet</th><th>Niveau</th><th>Exigences</th><th>Responsable</th></tr>
${fonctionnels.map((c) => `<tr><td>${c.id}</td><td>${esc(c.titre)}</td><td>${c.niveau}</td><td>${c.ex.join(", ")}</td><td>${RESPONSABLE[c.id]}</td></tr>`).join("")}</table>
<h3>Tests non fonctionnels — comment elle se comporte</h3>
<table><tr><th>Cas</th><th>Objet</th><th>Caractéristique</th><th>Exigences</th><th>Responsable</th></tr>
${nonFonctionnels.map((c) => `<tr><td>${c.id}</td><td>${esc(c.titre)}</td><td>${esc(c.type.replace(/^Non fonctionnel \\(|\\)$/g, ""))}</td><td>${c.ex.join(", ")}</td><td>${RESPONSABLE[c.id]}</td></tr>`).join("")}</table>
<h3>Autres types</h3>
<table><tr><th>Type</th><th>Cas</th><th>Description</th><th>Responsable</th></tr>
<tr><td>Statique</td><td>TNF-03</td><td>Revue de code et analyse statique (ESLint, PMD/CPD), sans exécuter le code</td><td>${RESPONSABLE["TNF-03"]}</td></tr>
<tr><td>Structurel (boîte blanche)</td><td>TNF-04</td><td>Couverture des instructions et des branches (objectif ≥ 70 %)</td><td>${RESPONSABLE["TNF-04"]}</td></tr>
<tr><td>Lié aux changements</td><td>TR-01, TR-02</td><td>Re-test de confirmation après chaque correctif, puis non-régression complète</td><td>${RESPONSABLE["TR-01"]}</td></tr>
<tr><td>Maintenance</td><td>TM-01</td><td>Portage vers MariaDB (XAMPP) sans modification du code</td><td>${RESPONSABLE["TM-01"]}</td></tr></table>
<h2>6.5 Techniques de test</h2>
<table><tr><th>Famille</th><th>Technique</th><th>Application prévue</th></tr>
<tr><td rowspan="3">Statique</td><td>Revue des exigences</td><td>Reformuler chaque besoin en critère mesurable (ex. ENF-03 : p95 &lt; 500 ms à 50 utilisateurs)</td></tr>
<tr><td>Revue de code</td><td>Contrôleurs, sécurité et configuration relus avant toute exécution</td></tr>
<tr><td>Analyse outillée</td><td>ESLint, PMD/CPD, npm audit</td></tr>
<tr><td rowspan="5">Boîte noire</td><td>Partitions d'équivalence</td><td>Identifiants valides ou invalides, adresses @enicar.tn ou non</td></tr>
<tr><td>Valeurs limites</td><td>Mot de passe de 5 / 6 caractères ; 40 / 41 participants pour une salle de 40 places ; capacité 0 et −10</td></tr>
<tr><td>Table de décision</td><td>Routes protégées (6 règles) ; rôle × action (sans jeton, jeton falsifié, membre, administrateur)</td></tr>
<tr><td>Transitions d'états</td><td>Réservation PENDING → APPROVED / REJECTED (§ 5.5)</td></tr>
<tr><td>Cas d'utilisation</td><td>Scénarios système et d'acceptation construits à partir des cas d'utilisation (§ 5.1)</td></tr>
<tr><td>Boîte blanche</td><td>Couverture</td><td>Instructions et branches (Jest, JaCoCo)</td></tr>
<tr><td>Expérience</td><td>Tests exploratoires</td><td>Appels directs à l'API, redémarrage du serveur, affichage sur smartphone</td></tr></table>
<h2>6.6 Catalogue des cas de test</h2>
<table><tr><th>Cas</th><th>Titre</th><th>Niveau</th><th>Type</th><th>Technique</th><th>Mode</th><th>Outil</th><th>Responsable</th></tr>
${CAS.map((c) => `<tr><td style="white-space:nowrap">${c.id}</td><td>${esc(c.titre)}</td><td>${c.niveau}</td><td><span class="badge ${/^Fonctionnel/.test(c.type) ? "b-f" : /Non fonctionnel|Sécurité/.test(c.type) ? "b-nf" : ""}">${esc(c.type)}</span></td><td>${esc(c.tech)}</td><td>${c.mode === "auto" ? "automatisé" : "manuel"}</td><td>${esc(c.outil)}</td><td>${RESPONSABLE[c.id].replace(/^Mohamed /, "M. ")}</td></tr>`).join("")}</table>
<h3>Répartition des cas de test dans l'équipe</h3>
<table><tr><th>Membre</th><th>Rôle</th><th>Domaine de test</th><th>Cas de test</th><th>Nombre</th></tr>
${SUIVI.equipe.map((m) => { const l = CAS.filter((c) => RESPONSABLE[c.id] === m).map((c) => c.id); const dom = m === SUIVI.chef ? "Acceptation, analyse statique, couverture, fiabilité, changements et maintenance" : l.some((x) => x.startsWith("TI")) ? "API : intégration, performance, sécurité, robustesse (Postman, Jest, k6)" : "Interface : composants (Jest) et parcours dans le navigateur (Playwright)"; return `<tr><td><b>${m}</b></td><td>${m === SUIVI.chef ? "Chef d'équipe" : "Membre"}</td><td>${dom}</td><td>${l.join(", ")}</td><td>${l.length}</td></tr>`; }).join("")}
<tr><td colspan="4"><b>Total</b></td><td><b>${CAS.length}</b></td></tr></table>
<p>Chaque responsable écrit ses cas de test, les exécute, enregistre les résultats et signale les anomalies sur GitHub. Le chef d'équipe relit les cas, suit l'avancement dans le tableau de suivi et valide les critères de sortie.</p>
<h2>6.7 Matrice de traçabilité exigences → cas de test</h2>
<table><tr><th>Exigence</th><th>Criticité</th><th>Cas de test qui la vérifieront</th></tr>
${EXIGENCES.map((e) => `<tr><td>${e.id} ${esc(e.titre)}</td><td>${e.crit}</td><td>${casOf(e.id).join(", ")}</td></tr>`).join("")}</table>
<div class="note">Chaque exigence est couverte par au moins un cas de test : ${EXIGENCES.filter((e) => casOf(e.id).length).length}/${EXIGENCES.length}.</div>
<h2>6.8 Outils de test</h2>
<table><tr><th>Outil</th><th>Utilisation prévue</th><th>Niveau</th><th>Type</th></tr>
${OUTILS.map((o) => `<tr><td><b>${o[0]}</b></td><td>${o[1]}</td><td>${o[2]}</td><td>${o[3]}</td></tr>`).join("")}</table>
<p><b>Postman</b> est le logiciel de test retenu pour l'API. Sa collection sera organisée en deux parties : <b>A — tests fonctionnels</b> (un dossier par cas TI-01 à TI-07) et <b>B — tests non fonctionnels</b> (NF-01 performance : temps de réponse &lt; 500 ms ; NF-02 sécurité : accès, jetons, injection SQL, CORS ; NF-03 robustesse : entrées invalides sans erreur 500). Chaque requête porte ses vérifications (<code>pm.test</code>) :</p>
${code(`pm.test("Code HTTP 200", () => pm.response.to.have.status(200));
pm.test("Temps de réponse < 500 ms", () => pm.expect(pm.response.responseTime).to.be.below(500));
pm.test("Le hash du mot de passe n'est pas renvoyé", () => pm.expect(pm.response.json().user).to.not.have.property("password"));`)}
<h2>6.9 Environnement et données de test</h2>
<ul><li><b>Unitaires :</b> jsdom, API simulée avec les données initiales du projet.</li>
<li><b>Intégration et système :</b> backend réel sur MySQL 8 (Docker) ; chaque test crée ses propres données pour pouvoir être rejoué.</li>
<li><b>Acceptation :</b> base réinitialisée ; comptes admin@enicar.tn et ahmed@enicar.tn.</li>
<li><b>Navigateurs :</b> Microsoft Edge et Firefox, en 1440 × 900 et en 360 × 800 (smartphone).</li></ul>
<h2>6.10 Critères d'entrée, de sortie et de suspension</h2>
<table><tr><th>Critère</th><th>Définition</th></tr>
<tr><td>Entrée</td><td>Application compilée et démarrée ; base de test accessible ; exigences et cas de test publiés sur GitHub</td></tr>
<tr><td>Sortie</td><td>100 % des cas exécutés ; aucune anomalie critique ou majeure ouverte ; 100 % des exigences couvertes ; couverture des instructions ≥ 70 % ; p95 &lt; 500 ms</td></tr>
<tr><td>Suspension</td><td>Environnement indisponible ou anomalie bloquante empêchant plus de 30 % des tests</td></tr>
<tr><td>Reprise</td><td>Correctif livré ; re-test de confirmation puis non-régression complète</td></tr></table>
<h2>6.11 Gestion des anomalies et des tests</h2>
<p><b>Cycle de vie d'une anomalie :</b> Détectée → Confirmée → Corrigée → Re-testée → Fermée. <b>Gravité :</b> critique (sécurité, perte de données), majeure (fonction dégradée), mineure (gêne). Sur GitHub, chaque exigence, chaque cas de test et chaque anomalie est une issue ; une anomalie est liée à l'exigence concernée et au test qui l'a détectée, et la Pull Request qui la corrige la ferme. Les jalons représentent les campagnes de test.</p>

<h1>7. Organisation de l'équipe et planning</h1>
<h2>7.1 Rôles</h2>
<table><tr><th>Membre</th><th>Rôle</th><th>Domaine principal</th></tr>
<tr><td>${SUIVI.equipe[0]}</td><td>Chef d'équipe</td><td>Exigences, architecture, plan de test, coordination, rapport</td></tr>
<tr><td>${SUIVI.equipe[1]}</td><td>Membre</td><td>Backend et API : diagramme de classes, séquences, tests d'API (Postman), tests non fonctionnels</td></tr>
<tr><td>${SUIVI.equipe[2]}</td><td>Membre</td><td>Frontend : cas d'utilisation, diagramme d'états, tests unitaires (Jest), tests système (Playwright)</td></tr></table>
<h2>7.2 Répartition des tâches et planning</h2>
<table><tr><th>Semaine</th><th>Phase</th><th>Tâche</th><th>Responsable</th><th>Échéance</th><th>Statut</th></tr>
${weeks.map((w) => { const l = SUIVI.taches.filter((t) => t.semaine === w).sort((a, b) => (a.echeance < b.echeance ? -1 : 1)); return l.map((t, i) => `<tr>${i === 0 ? `<td rowspan="${l.length}"><b>${w.replace(/^\d{4}-/, "")}</b><br><span style="font-size:8pt;color:#555">${startOf(w) ? "à partir du " + fmt(startOf(w)) : ""}</span></td><td rowspan="${l.length}">${esc(phaseOf(w))}</td>` : ""}<td>${esc(t.tache)}</td><td>${esc(t.membre)}</td><td>${fmt(t.echeance)}</td><td>${t.statut}</td></tr>`).join(""); }).join("")}</table>
<h2>7.3 Suivi hebdomadaire</h2>
<p>L'avancement est suivi chaque semaine dans un tableau de bord tenu dans le dépôt (<code>suivi/index.html</code>). Il affiche les objectifs fixés par l'encadrant, les tâches de chaque membre (priorité, échéance, statut) et le planning complet. Le chef d'équipe met à jour la semaine depuis son espace (<code>suivi/chef.html</code>).</p>
${img("img/suivi-planning.png", "Tableau de suivi hebdomadaire : objectifs de l'encadrant et tâches de chaque membre (semaine 47)", 96)}

<h1>8. Conclusion et prochaines étapes</h1>
<p>Ce rapport décrit la plateforme de gestion des clubs de l'ENICarthage : ses profils et ses fonctionnalités, ses ${EXIGENCES.length} exigences, son architecture en trois couches et sa conception (cas d'utilisation, classes, données, séquences, états). Il fixe le plan de test qui guidera la suite : ${CAS.length} cas de test répartis sur les quatre niveaux, tests fonctionnels et non fonctionnels, techniques de conception des tests, outils (Jest, Postman, Playwright, k6) et critères de sortie.</p>
<p><b>Prochaines étapes :</b> semaine 48, tests unitaires (Jest) et tests d'intégration de l'API (Postman) ; semaine 49, tests système (Playwright), tests non fonctionnels et tests d'acceptation ; semaine 50, correctifs, non-régression et rapport final avec le verdict de recette.</p>
</body></html>`;

writeFileSync(new URL("./Rapport_Conception_Plan_de_Test.html", import.meta.url), html);
console.log("figures:", fig, "| cas:", CAS.length, "| fonctionnels:", fonctionnels.length, "| non fonctionnels:", nonFonctionnels.length);
