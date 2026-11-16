// Génère la collection Postman de l'API : A — tests fonctionnels, B — tests non fonctionnels.
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
const fast = (ms) => `pm.test("Temps de réponse < ${ms} ms", () => pm.expect(pm.response.responseTime).to.be.below(${ms}));`;
const isJson = `pm.test("Réponse au format JSON", () => pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json"));`;
const futureDate = [
  "// date future aléatoire (2031 à 2040) pour que chaque exécution soit indépendante",
  "const y = 2031 + Math.floor(Math.random() * 10), m = 1 + Math.floor(Math.random() * 12), d = 1 + Math.floor(Math.random() * 28);",
  "pm.collectionVariables.set('dateFuture', `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);",
];
const uniqueEmail = (prefix, domain = "enicar.tn") => [`pm.variables.set('email', '${prefix}' + Date.now() + '@${domain}');`];

const preparation = {
  name: "00 — Préparation des données",
  description: "À exécuter en premier : connexions (administrateur, président) et création d'un compte membre. Les jetons sont gardés dans les variables de la collection.",
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
      pre: ["pm.collectionVariables.set('memberEmail', 'membre' + Date.now() + '@enicar.tn');"],
      body: { fullName: "Membre Postman", email: "{{memberEmail}}", password: "secret1" },
      tests: [status(200), "pm.collectionVariables.set('memberToken', pm.response.json().token);"],
    }),
  ],
};

const fonctionnels = {
  name: "A — Tests fonctionnels",
  description: "Ce que fait l'application : règles métier des exigences EF-01 à EF-09 (partitions d'équivalence, valeurs limites, transitions d'états).",
  item: [
    {
      name: "TI-01 — Connexion",
      description: "EF-01 — partitions d'équivalence.",
      item: [
        req("Identifiants valides → 200, jeton, rôle", "POST", "/auth/login", {
          body: { email: "{{adminEmail}}", password: "{{adminPassword}}" },
          tests: [status(200), `pm.test("Un jeton est renvoyé", () => pm.expect(pm.response.json().token).to.be.a("string").and.not.empty);`,
            `pm.test("Rôle ADMINISTRATOR", () => pm.expect(pm.response.json().user.role).to.eql("ADMINISTRATOR"));`],
        }),
        req("Mot de passe erroné → 401", "POST", "/auth/login", { body: { email: "{{adminEmail}}", password: "faux" }, tests: [status(401)] }),
        req("E-mail inconnu → 401", "POST", "/auth/login", { body: { email: "personne@enicar.tn", password: "admin123" }, tests: [status(401)] }),
      ],
    },
    {
      name: "TI-02 — Inscription",
      description: "EF-02 — partitions d'équivalence et valeurs limites du mot de passe (5 / 6 caractères).",
      item: [
        req("Inscription valide → 200, rôle CLUB_MEMBER", "POST", "/auth/register", {
          pre: uniqueEmail("etu"), body: { fullName: "Etudiant Postman", email: "{{email}}", password: "secret1" },
          tests: [status(200), `pm.test("Rôle CLUB_MEMBER", () => pm.expect(pm.response.json().user.role).to.eql("CLUB_MEMBER"));`],
        }),
        req("E-mail déjà utilisé → 400", "POST", "/auth/register", { body: { fullName: "Doublon", email: "{{adminEmail}}", password: "secret1" }, tests: [status(400)] }),
        req("Adresse non institutionnelle (@gmail.com) → 400", "POST", "/auth/register", {
          pre: uniqueEmail("a", "gmail.com"), body: { fullName: "A", email: "{{email}}", password: "secret1" }, tests: [status(400)],
        }),
        req("Mot de passe de 5 caractères (limite − 1) → 400", "POST", "/auth/register", {
          pre: uniqueEmail("b"), body: { fullName: "B", email: "{{email}}", password: "abcde" }, tests: [status(400)],
        }),
        req("Mot de passe de 6 caractères (limite) → 200", "POST", "/auth/register", {
          pre: uniqueEmail("c"), body: { fullName: "C", email: "{{email}}", password: "abcdef" }, tests: [status(200)],
        }),
      ],
    },
    {
      name: "TI-07 — Salles et équipements",
      description: "EF-07, EF-08 — valeurs limites de la capacité (40, 0, −10).",
      item: [
        req("Ajout d'une salle de 40 places → 200", "POST", "/rooms", {
          headers: auth("adminToken"),
          pre: ["pm.collectionVariables.set('roomName', 'Salle Postman ' + Date.now());"],
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
          pre: ["const n = Date.now();", "pm.collectionVariables.set('presidentEmail', 'pres' + n + '@enicar.tn');", "pm.variables.set('clubName', 'Club Postman ' + n);"],
          body: { name: "{{clubName}}", description: "Créé par Postman", presidentName: "Président Postman", presidentEmail: "{{presidentEmail}}", presidentPassword: "secret1" },
          tests: [status(200), `pm.test("Le club a un président", () => pm.expect(pm.response.json().presidentId).to.be.a("number"));`],
        }),
        req("Le président créé peut se connecter", "POST", "/auth/login", {
          body: { email: "{{presidentEmail}}", password: "secret1" },
          tests: [status(200), `pm.test("Rôle CLUB_PRESIDENT", () => pm.expect(pm.response.json().user.role).to.eql("CLUB_PRESIDENT"));`],
        }),
        req("Président déjà inscrit → 409", "POST", "/clubs", {
          headers: auth("adminToken"),
          body: { name: "Club doublon", description: "x", presidentName: "Ahmed", presidentEmail: "ahmed@enicar.tn", presidentPassword: "x" },
          tests: [status(409)],
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
      ],
    },
    {
      name: "TI-06 — Réservations",
      description: "EF-09 — transitions d'états PENDING → APPROVED, double réservation.",
      item: [
        req("Un membre réserve la salle → 200, PENDING", "POST", "/reservations", {
          headers: auth("memberToken"), pre: futureDate,
          body: { clubId: 1, resourceType: "ROOM", resourceId: "{{roomId}}", date: "{{dateFuture}}", status: "PENDING" },
          tests: [status(200), `pm.test("Statut PENDING", () => pm.expect(pm.response.json().status).to.eql("PENDING"));`,
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
      ],
    },
  ],
};

const nonFonctionnels = {
  name: "B — Tests non fonctionnels",
  description: "Comment l'application se comporte : performance (ENF-03), sécurité (ENF-01, ENF-02, ENF-09) et robustesse (ENF-02). La charge (plusieurs utilisateurs simultanés) se lance avec l'onglet « Performance » du Collection Runner sur le dossier NF-01.",
  item: [
    {
      name: "NF-01 — Performance (temps de réponse)",
      description: "ENF-03 — chaque consultation répond en moins de 500 ms (connexion : moins de 1 s, à cause du hachage BCrypt). Dossier à utiliser pour le test de charge de l'onglet Performance.",
      item: [
        req("Liste des clubs < 500 ms", "GET", "/clubs", { tests: [status(200), fast(500), isJson] }),
        req("Liste des événements < 500 ms", "GET", "/events", { tests: [status(200), fast(500), isJson] }),
        req("Liste des salles < 500 ms", "GET", "/rooms", { tests: [status(200), fast(500), isJson] }),
        req("Liste des équipements < 500 ms", "GET", "/equipment", { tests: [status(200), fast(500), isJson] }),
        req("Liste des réservations (membre connecté) < 500 ms", "GET", "/reservations", { headers: auth("memberToken"), tests: [status(200), fast(500), isJson] }),
        req("Connexion < 1 000 ms", "POST", "/auth/login", { body: { email: "ahmed@enicar.tn", password: "123456" }, tests: [status(200), fast(1000)] }),
      ],
    },
    {
      name: "NF-02 — Sécurité",
      description: "ENF-01, ENF-02, ENF-09 — contrôle d'accès (sans jeton / falsifié / membre), injection SQL, CORS, mot de passe jamais exposé.",
      item: [
        req("Création d'une salle sans jeton → 401", "POST", "/rooms", { body: { name: "Sans jeton", capacity: 10, type: "SALLE" }, tests: [status(401)] }),
        req("Jeton falsifié → 401", "POST", "/rooms", {
          headers: { Authorization: "Bearer dummy-jwt-token-1" },
          body: { name: "Faux jeton", capacity: 10, type: "SALLE" }, tests: [status(401)],
        }),
        req("Membre qui crée une salle → 403", "POST", "/rooms", { headers: auth("memberToken"), body: { name: "Salle membre", capacity: 10, type: "SALLE" }, tests: [status(403)] }),
        req("Membre qui approuve une réservation → 403", "PUT", "/reservations/{{reservationId}}/status", { headers: auth("memberToken"), body: { status: "APPROVED" }, tests: [status(403)] }),
        req("Membre qui crée un événement → 403", "POST", "/events", {
          headers: auth("memberToken"), pre: futureDate,
          body: { title: "Par un membre", clubId: 1, date: "{{dateFuture}}", room: "{{roomName}}", attendees: 10 }, tests: [status(403)],
        }),
        req("Réservations sans jeton → 401", "GET", "/reservations", { tests: [status(401)] }),
        req("Le hash du mot de passe n'est jamais renvoyé", "POST", "/auth/login", {
          body: { email: "{{adminEmail}}", password: "{{adminPassword}}" },
          tests: [status(200), `pm.test("Aucun champ password dans la réponse", () => pm.expect(pm.response.json().user).to.not.have.property("password"));`,
            `pm.test("Aucun hash BCrypt dans la réponse", () => pm.expect(pm.response.text()).to.not.include("$2a$"));`],
        }),
        req("Rôle forcé à l'inscription ignoré (pas d'auto-promotion)", "POST", "/auth/register", {
          pre: uniqueEmail("pirate"), body: { fullName: "Pirate", email: "{{email}}", password: "secret1", role: "ADMINISTRATOR" },
          tests: [status(200), `pm.test("Le rôle reste CLUB_MEMBER", () => pm.expect(pm.response.json().user.role).to.eql("CLUB_MEMBER"));`],
        }),
        req("Injection SQL dans la connexion → 401", "POST", "/auth/login", { body: { email: "' OR '1'='1", password: "' OR '1'='1" }, tests: [status(401)] }),
        req("Réservation auto-approuvée par le client → reste PENDING", "POST", "/reservations", {
          headers: auth("memberToken"), pre: futureDate,
          body: { clubId: 1, resourceType: "ROOM", resourceId: "{{roomId}}", date: "{{dateFuture}}", status: "APPROVED" },
          tests: [status(200), `pm.test("Le statut est forcé à PENDING", () => pm.expect(pm.response.json().status).to.eql("PENDING"));`],
        }),
        req("CORS : site non autorisé → refusé", "GET", "/clubs", {
          headers: { Origin: "http://site-pirate.com" },
          tests: [status(403), `pm.test("Aucune autorisation CORS accordée", () => pm.expect(pm.response.headers.has("Access-Control-Allow-Origin")).to.be.false);`],
        }),
        req("CORS : frontend autorisé (localhost:5173)", "GET", "/clubs", {
          headers: { Origin: "http://localhost:5173" },
          tests: [status(200), `pm.test("Origine autorisée", () => pm.expect(pm.response.headers.get("Access-Control-Allow-Origin")).to.eql("http://localhost:5173"));`],
        }),
      ],
    },
    {
      name: "NF-03 — Robustesse",
      description: "ENF-02 — une entrée invalide ou inattendue donne une erreur 4xx explicite, jamais une erreur serveur 500.",
      item: [
        req("JSON mal formé → 400", "POST", "/auth/login", { body: "{email:", tests: [status(400), no500] }),
        req("Corps vide → 400/401", "POST", "/auth/login", { body: {}, tests: [statusIn([400, 401], "Code 400 ou 401"), no500] }),
        req("Capacité au format texte → 400", "POST", "/rooms", { headers: auth("adminToken"), body: { name: "Salle texte", capacity: "beaucoup", type: "SALLE" }, tests: [status(400), no500] }),
        req("Nom de salle de 300 caractères → 400", "POST", "/rooms", {
          headers: auth("adminToken"), pre: ["pm.variables.set('longName', 'A'.repeat(300));"],
          body: { name: "{{longName}}", capacity: 10, type: "SALLE" }, tests: [status(400), no500],
        }),
        req("Réservation inexistante → 404", "PUT", "/reservations/999999/status", { headers: auth("adminToken"), body: { status: "APPROVED" }, tests: [status(404), no500] }),
        req("Méthode non prévue (PATCH /clubs) → 405", "PATCH", "/clubs", { headers: auth("adminToken"), tests: [status(405), no500] }),
      ],
    },
  ],
};

const folders = [preparation, fonctionnels, nonFonctionnels];
const count = (items) => items.reduce((n, i) => n + (i.item ? count(i.item) : 1), 0);

const collection = {
  info: {
    name: "ENICarthage Clubs — Tests fonctionnels et non fonctionnels de l'API",
    description: "Plateforme de gestion des clubs de l'ENICarthage (atelier de test logiciel). A — tests fonctionnels (TI-01 à TI-07), B — tests non fonctionnels (performance, sécurité, robustesse). Lancer le backend (http://localhost:9090), puis exécuter la collection avec le Collection Runner, dans l'ordre.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: folders,
  variable: [
    { key: "baseUrl", value: "http://localhost:9090/api" },
    { key: "adminEmail", value: "admin@enicar.tn" },
    { key: "adminPassword", value: "admin123" },
  ],
};

const out = new URL("./ENICarthage-Clubs-API.postman_collection.json", import.meta.url);
writeFileSync(out, JSON.stringify(collection, null, 2));
console.log(`${count(fonctionnels.item)} requêtes fonctionnelles, ${count(nonFonctionnels.item)} non fonctionnelles, ${count(folders)} au total`);
