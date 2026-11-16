// Génère la collection Postman des tests d'intégration de l'API (TI-01 à TI-07).
// Usage : node qa/postman/build-collection.mjs  →  qa/postman/ENICarthage-Clubs-API.postman_collection.json
import { writeFileSync } from "node:fs";

const json = { "Content-Type": "application/json" };
const auth = (v) => ({ Authorization: `Bearer {{${v}}}` });

/** Une requête Postman : méthode, chemin, corps, en-têtes, scripts de test et de préparation */
function req(name, method, path, { body, headers = {}, tests = [], pre = [], description } = {}) {
  const hdr = { ...(body !== undefined ? json : {}), ...headers };
  const item = {
    name,
    request: {
      method,
      header: Object.entries(hdr).map(([key, value]) => ({ key, value })),
      url: { raw: `{{baseUrl}}${path}`, host: ["{{baseUrl}}"], path: path.split("/").filter(Boolean) },
      description,
    },
    event: [],
  };
  if (body !== undefined) item.request.body = { mode: "raw", raw: typeof body === "string" ? body : JSON.stringify(body, null, 2), options: { raw: { language: "json" } } };
  if (pre.length) item.event.push({ listen: "prerequest", script: { type: "text/javascript", exec: pre } });
  if (tests.length) item.event.push({ listen: "test", script: { type: "text/javascript", exec: tests } });
  return item;
}
const status = (code, label) => `pm.test("${label || "Code HTTP " + code}", () => pm.response.to.have.status(${code}));`;
const statusIn = (codes, label) => `pm.test("${label}", () => pm.expect(pm.response.code).to.be.oneOf([${codes.join(", ")}]));`;
const no500 = `pm.test("Jamais d'erreur serveur (5xx)", () => pm.expect(pm.response.code).to.be.below(500));`;
const futureDate = [
  "// date future aléatoire (2031 à 2040) pour que chaque exécution soit indépendante",
  "const y = 2031 + Math.floor(Math.random() * 10), m = 1 + Math.floor(Math.random() * 12), d = 1 + Math.floor(Math.random() * 28);",
  "pm.collectionVariables.set('dateFuture', `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);",
];

const folders = [
  {
    name: "00 — Préparation des données",
    description: "Connexions (administrateur, président) et création d'un compte membre. Les jetons sont gardés dans les variables de la collection.",
    item: [
      req("Connexion administrateur", "POST", "/auth/login", {
        body: { email: "{{adminEmail}}", password: "{{adminPassword}}" },
        tests: [status(200), "pm.collectionVariables.set('adminToken', pm.response.json().token);"],
      }),
      req("Connexion président (Club IEEE)", "POST", "/auth/login", {
        body: { email: "ahmed@enicar.tn", password: "123456" },
        tests: [status(200), "pm.collectionVariables.set('presidentToken', pm.response.json().token);"],
      }),
      req("Inscription d'un membre de test", "POST", "/auth/register", {
        pre: ["pm.collectionVariables.set('memberEmail', `membre${Date.now()}@enicar.tn`);"],
        body: { fullName: "Membre Postman", email: "{{memberEmail}}", password: "secret1" },
        tests: [status(200), "pm.collectionVariables.set('memberToken', pm.response.json().token);"],
      }),
    ],
  },
  {
    name: "TI-01 — Connexion",
    description: "EF-01, ENF-01, ENF-02 — partitions d'équivalence et robustesse.",
    item: [
      req("Identifiants valides → 200, jeton, rôle", "POST", "/auth/login", {
        body: { email: "{{adminEmail}}", password: "{{adminPassword}}" },
        tests: [status(200), `pm.test("Un jeton est renvoyé", () => pm.expect(pm.response.json().token).to.be.a("string").and.not.empty);`,
          `pm.test("Rôle ADMINISTRATOR", () => pm.expect(pm.response.json().user.role).to.eql("ADMINISTRATOR"));`,
          `pm.test("Le hash du mot de passe n'est pas renvoyé (ANO-02)", () => pm.expect(pm.response.json().user).to.not.have.property("password"));`],
      }),
      req("Mot de passe erroné → 401", "POST", "/auth/login", { body: { email: "{{adminEmail}}", password: "faux" }, tests: [status(401)] }),
      req("E-mail inconnu → 401", "POST", "/auth/login", { body: { email: "personne@enicar.tn", password: "admin123" }, tests: [status(401)] }),
      req("Corps vide → 400/401, jamais 500", "POST", "/auth/login", { body: {}, tests: [statusIn([400, 401], "Code 400 ou 401"), no500] }),
      req("JSON mal formé → 400", "POST", "/auth/login", { body: "{email:", tests: [status(400), no500] }),
    ],
  },
  {
    name: "TI-02 — Inscription",
    description: "EF-02 — partitions d'équivalence et valeurs limites du mot de passe (5 / 6 caractères).",
    item: [
      req("Inscription valide → 200, rôle CLUB_MEMBER", "POST", "/auth/register", {
        pre: ["pm.variables.set('email', `etu${Date.now()}@enicar.tn`);"],
        body: { fullName: "Etudiant Postman", email: "{{email}}", password: "secret1" },
        tests: [status(200), `pm.test("Rôle CLUB_MEMBER", () => pm.expect(pm.response.json().user.role).to.eql("CLUB_MEMBER"));`],
      }),
      req("E-mail déjà utilisé → 400", "POST", "/auth/register", { body: { fullName: "Doublon", email: "{{adminEmail}}", password: "secret1" }, tests: [status(400)] }),
      req("Rôle envoyé par le client ignoré", "POST", "/auth/register", {
        pre: ["pm.variables.set('email', `pirate${Date.now()}@enicar.tn`);"],
        body: { fullName: "Pirate", email: "{{email}}", password: "secret1", role: "ADMINISTRATOR" },
        tests: [status(200), `pm.test("Le rôle reste CLUB_MEMBER", () => pm.expect(pm.response.json().user.role).to.eql("CLUB_MEMBER"));`],
      }),
      req("Adresse non institutionnelle (@gmail.com) → 400", "POST", "/auth/register", {
        pre: ["pm.variables.set('email', `a${Date.now()}@gmail.com`);"],
        body: { fullName: "A", email: "{{email}}", password: "secret1" }, tests: [status(400)],
      }),
      req("Mot de passe de 5 caractères (limite − 1) → 400", "POST", "/auth/register", {
        pre: ["pm.variables.set('email', `b${Date.now()}@enicar.tn`);"],
        body: { fullName: "B", email: "{{email}}", password: "abcde" }, tests: [status(400)],
      }),
      req("Mot de passe de 6 caractères (limite) → 200", "POST", "/auth/register", {
        pre: ["pm.variables.set('email', `c${Date.now()}@enicar.tn`);"],
        body: { fullName: "C", email: "{{email}}", password: "abcdef" }, tests: [status(200)],
      }),
    ],
  },
  {
    name: "TI-03 — Contrôle d'accès",
    description: "EF-03, ENF-02 — table de décision : sans jeton / jeton falsifié / membre / administrateur.",
    item: [
      req("Consultation des clubs sans jeton → 200", "GET", "/clubs", { tests: [status(200)] }),
      req("Création d'une salle sans jeton → 401", "POST", "/rooms", { body: { name: "Sans jeton", capacity: 10, type: "SALLE" }, tests: [status(401)] }),
      req("Jeton falsifié → 401", "POST", "/rooms", {
        headers: { Authorization: "Bearer dummy-jwt-token-1" },
        body: { name: "Faux jeton", capacity: 10, type: "SALLE" }, tests: [status(401)],
      }),
      req("Membre qui crée une salle → 403", "POST", "/rooms", { headers: auth("memberToken"), body: { name: "Salle membre", capacity: 10, type: "SALLE" }, tests: [status(403)] }),
      req("Membre qui approuve une réservation → 403", "PUT", "/reservations/1/status", { headers: auth("memberToken"), body: { status: "APPROVED" }, tests: [status(403)] }),
    ],
  },
  {
    name: "TI-07 — Salles et équipements",
    description: "EF-07, EF-08 — valeurs limites de la capacité (40, 0, −10).",
    item: [
      req("Ajout d'une salle de 40 places → 200", "POST", "/rooms", {
        headers: auth("adminToken"),
        pre: ["pm.collectionVariables.set('roomName', `Salle Postman ${Date.now()}`);"],
        body: { name: "{{roomName}}", capacity: 40, type: "SALLE" },
        tests: [status(200), `pm.test("Capacité enregistrée : 40", () => pm.expect(pm.response.json().capacity).to.eql(40));`,
          "pm.collectionVariables.set('roomId', pm.response.json().id);"],
      }),
      req("Capacité 0 → 400", "POST", "/rooms", { headers: auth("adminToken"), body: { name: "Salle vide", capacity: 0, type: "SALLE" }, tests: [status(400)] }),
      req("Capacité −10 → 400", "POST", "/rooms", { headers: auth("adminToken"), body: { name: "Salle négative", capacity: -10, type: "SALLE" }, tests: [status(400)] }),
      req("Ajout d'un équipement → 200, statut AVAILABLE", "POST", "/equipment", {
        headers: auth("adminToken"), body: { name: "Projecteur Postman", type: "VISUEL", status: "AVAILABLE" },
        tests: [status(200), `pm.test("Statut AVAILABLE", () => pm.expect(pm.response.json().status).to.eql("AVAILABLE"));`],
      }),
    ],
  },
  {
    name: "TI-04 — Clubs",
    description: "EF-05 — création d'un club et du compte de son président.",
    item: [
      req("Création d'un club et de son président → 200", "POST", "/clubs", {
        headers: auth("adminToken"),
        pre: ["const n = Date.now();", "pm.collectionVariables.set('presidentEmail', `pres${n}@enicar.tn`);", "pm.variables.set('clubName', `Club Postman ${n}`);"],
        body: { name: "{{clubName}}", description: "Créé par Postman", presidentName: "Président Postman", presidentEmail: "{{presidentEmail}}", presidentPassword: "secret1" },
        tests: [status(200), `pm.test("Le club a un président", () => pm.expect(pm.response.json().presidentId).to.be.a("number"));`],
      }),
      req("Le président créé peut se connecter", "POST", "/auth/login", {
        body: { email: "{{presidentEmail}}", password: "secret1" },
        tests: [status(200), `pm.test("Rôle CLUB_PRESIDENT", () => pm.expect(pm.response.json().user.role).to.eql("CLUB_PRESIDENT"));`],
      }),
      req("Président déjà inscrit → 409 (ANO-06)", "POST", "/clubs", {
        headers: auth("adminToken"),
        body: { name: "Club doublon", description: "x", presidentName: "Ahmed", presidentEmail: "ahmed@enicar.tn", presidentPassword: "x" },
        tests: [status(409), no500],
      }),
      req("Nom de club vide → 400", "POST", "/clubs", {
        headers: auth("adminToken"),
        body: { name: "", description: "x", presidentName: "P", presidentEmail: "vide@enicar.tn", presidentPassword: "secret1" },
        tests: [status(400)],
      }),
    ],
  },
  {
    name: "TI-05 — Événements",
    description: "EF-06 — valeurs limites de la capacité (40 / 41 pour une salle de 40 places), salle et date.",
    item: [
      req("Événement valide (40 participants = capacité) → 200, PENDING", "POST", "/events", {
        headers: auth("presidentToken"), pre: futureDate,
        body: { title: "Atelier Postman", clubId: 1, date: "{{dateFuture}}", room: "{{roomName}}", attendees: 40 },
        tests: [status(200), `pm.test("Statut initial PENDING", () => pm.expect(pm.response.json().status).to.eql("PENDING"));`],
      }),
      req("41 participants (capacité + 1) → 400", "POST", "/events", {
        headers: auth("presidentToken"), pre: futureDate,
        body: { title: "Trop de monde", clubId: 1, date: "{{dateFuture}}", room: "{{roomName}}", attendees: 41 }, tests: [status(400)],
      }),
      req("Participants négatifs → 400", "POST", "/events", {
        headers: auth("presidentToken"), pre: futureDate,
        body: { title: "Négatif", clubId: 1, date: "{{dateFuture}}", room: "{{roomName}}", attendees: -5 }, tests: [status(400)],
      }),
      req("Salle inexistante → 400", "POST", "/events", {
        headers: auth("presidentToken"), pre: futureDate,
        body: { title: "Salle fantôme", clubId: 1, date: "{{dateFuture}}", room: "Salle fantôme", attendees: 10 }, tests: [status(400)],
      }),
      req("Date passée → 400", "POST", "/events", {
        headers: auth("presidentToken"),
        body: { title: "Dans le passé", clubId: 1, date: "2020-01-01", room: "{{roomName}}", attendees: 10 }, tests: [status(400)],
      }),
      req("Un membre crée un événement → 403", "POST", "/events", {
        headers: auth("memberToken"), pre: futureDate,
        body: { title: "Par un membre", clubId: 1, date: "{{dateFuture}}", room: "{{roomName}}", attendees: 10 }, tests: [status(403)],
      }),
    ],
  },
  {
    name: "TI-06 — Réservations",
    description: "EF-09 — transitions d'états PENDING → APPROVED, double réservation, statuts.",
    item: [
      req("Un membre réserve la salle → 200, PENDING", "POST", "/reservations", {
        headers: auth("memberToken"), pre: futureDate,
        body: { clubId: 1, resourceType: "ROOM", resourceId: "{{roomId}}", date: "{{dateFuture}}", status: "APPROVED" },
        tests: [status(200), `pm.test("Statut forcé à PENDING (le client ne peut pas s'auto-approuver)", () => pm.expect(pm.response.json().status).to.eql("PENDING"));`,
          "pm.collectionVariables.set('reservationId', pm.response.json().id);", "pm.collectionVariables.set('reservationDate', pm.response.json().date);"],
      }),
      req("Même salle, même date → 409", "POST", "/reservations", {
        headers: auth("memberToken"),
        body: { clubId: 1, resourceType: "ROOM", resourceId: "{{roomId}}", date: "{{reservationDate}}", status: "PENDING" }, tests: [status(409)],
      }),
      req("Ressource inexistante → 400", "POST", "/reservations", {
        headers: auth("memberToken"), pre: futureDate,
        body: { clubId: 1, resourceType: "ROOM", resourceId: 999999, date: "{{dateFuture}}", status: "PENDING" }, tests: [status(400)],
      }),
      req("L'administrateur approuve → 200, APPROVED", "PUT", "/reservations/{{reservationId}}/status", {
        headers: auth("adminToken"), body: { status: "APPROVED" },
        tests: [status(200), `pm.test("Statut APPROVED", () => pm.expect(pm.response.json().status).to.eql("APPROVED"));`],
      }),
      req("Statut inconnu (FOO) → 400", "PUT", "/reservations/{{reservationId}}/status", { headers: auth("adminToken"), body: { status: "FOO" }, tests: [status(400)] }),
      req("Réservation inexistante → 404, jamais 500", "PUT", "/reservations/999999/status", { headers: auth("adminToken"), body: { status: "APPROVED" }, tests: [status(404), no500] }),
    ],
  },
];

const collection = {
  info: {
    name: "ENICarthage Clubs — Tests d'API (TI-01 à TI-07)",
    description: "Tests d'intégration de l'API de la plateforme de gestion des clubs de l'ENICarthage (atelier de test logiciel). Lancer le backend (http://localhost:9090), puis exécuter la collection avec le Collection Runner, dans l'ordre.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: folders.map((f) => ({ name: f.name, description: f.description, item: f.item })),
  variable: [
    { key: "baseUrl", value: "http://localhost:9090/api" },
    { key: "adminEmail", value: "admin@enicar.tn" },
    { key: "adminPassword", value: "admin123" },
  ],
};

const out = new URL("./ENICarthage-Clubs-API.postman_collection.json", import.meta.url);
writeFileSync(out, JSON.stringify(collection, null, 2));
const n = folders.reduce((a, f) => a + f.item.length, 0);
console.log(`${folders.length} dossiers, ${n} requêtes`);
