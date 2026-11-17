// Plan de test présenté à l'évaluation : 5 tests pour chacun des 5 types de test du cours
// (chapitre 2 — Types de tests) : fonctionnels, non fonctionnels, structurels (boîte blanche),
// liés aux changements (confirmation, régression) et de maintenance.
// Un seul outil de test : Playwright (navigateur pour l'interface, module request pour l'API).
const A = "Mohamed Aziz Rouissi", B = "Mohamed Bouchahda", M = "Mohamed Hosni Missaoui";

export const TYPES = [
  { famille: "Fonctionnel", prefixe: "TF", titre: "Tests fonctionnels", question: "Que fait le système ?",
    def: "Ils évaluent les fonctionnalités que le système doit réaliser, à partir des spécifications (exigences, cas d'utilisation, règles de gestion)." },
  { famille: "Non fonctionnel", prefixe: "TNF", titre: "Tests non fonctionnels", question: "Comment le système fonctionne-t-il ?",
    def: "Ils évaluent les caractéristiques du système : performance, sécurité, utilisabilité, compatibilité, fiabilité." },
  { famille: "Structurel", prefixe: "TST", titre: "Tests structurels (boîte blanche)", question: "Comment le système est-il construit ?",
    def: "Ils sont conçus à partir de la structure interne du code (décisions, conditions, chemins) et mesurent la couverture atteinte. Ils sont exécutés au niveau de l'API (intégration)." },
  { famille: "Lié aux changements", prefixe: "TC", titre: "Tests liés aux changements", question: "La correction fonctionne-t-elle sans rien casser ?",
    def: "Tests de confirmation : rejouer les tests qui ont échoué après la correction. Tests de régression : rejouer les tests existants pour vérifier qu'une modification n'a pas introduit de défaut ailleurs." },
  { famille: "Maintenance", prefixe: "TM", titre: "Tests de maintenance", question: "Le système reste-t-il correct après une évolution ?",
    def: "Effectués sur le système existant lors de modifications, de migrations ou de mises à jour : tests des modifications puis tests de régression." },
];

export const PLAN = [
  // ---- Fonctionnels ----
  { id: "TF-01", famille: "Fonctionnel", titre: "Connexion avec des identifiants valides et invalides", niveau: "Système", tech: "Partitions d'équivalence", outil: "Navigateur", ex: ["EF-01"], resp: M,
    attendu: "Identifiants valides : accès au tableau de bord ; sinon message « Email ou mot de passe incorrect »" },
  { id: "TF-02", famille: "Fonctionnel", titre: "Inscription : adresse institutionnelle et longueur du mot de passe", niveau: "Système", tech: "Valeurs limites (5 / 6 caractères), partitions (@enicar.tn / @gmail.com)", outil: "Navigateur", ex: ["EF-02"], resp: M,
    attendu: "5 caractères ou adresse non institutionnelle refusés ; 6 caractères et @enicar.tn acceptés, rôle CLUB_MEMBER" },
  { id: "TF-03", famille: "Fonctionnel", titre: "Création d'un événement dans la limite de capacité de la salle", niveau: "Système", tech: "Valeurs limites (40 / 41 participants pour 40 places)", outil: "Navigateur", ex: ["EF-06"], resp: M,
    attendu: "40 participants : événement créé, statut PENDING ; 41 : refus avec message" },
  { id: "TF-04", famille: "Fonctionnel", titre: "Réservation d'une salle puis approbation par l'administration", niveau: "Acceptation", tech: "Transitions d'états (PENDING → APPROVED / REJECTED)", outil: "Navigateur (deux profils)", ex: ["EF-09"], resp: M,
    attendu: "La réservation passe de PENDING à APPROVED ; une seconde réservation de la même salle à la même date est refusée" },
  { id: "TF-05", famille: "Fonctionnel", titre: "Actions visibles selon le rôle (membre, président, administration)", niveau: "Système", tech: "Table de décision rôle × action", outil: "Navigateur", ex: ["EF-03", "EF-04", "EF-05", "EF-07"], resp: M,
    attendu: "Un membre ne voit ni création ni suppression ; le président gère les événements de son club ; l'administration gère clubs, salles et réservations" },
  // ---- Non fonctionnels ----
  { id: "TNF-01", famille: "Non fonctionnel", carac: "Performance", titre: "Temps de réponse sous 50 requêtes simultanées", niveau: "Système", tech: "Mesure sous charge", outil: "Module request", ex: ["ENF-03"], resp: B,
    attendu: "95 % des requêtes en moins de 500 ms, aucune erreur" },
  { id: "TNF-02", famille: "Non fonctionnel", carac: "Sécurité", titre: "Mot de passe haché et jamais renvoyé par l'API", niveau: "Intégration", tech: "Inspection des réponses", outil: "Module request", ex: ["ENF-01"], resp: B,
    attendu: "Aucun champ password ni hash BCrypt dans les réponses de connexion et d'inscription" },
  { id: "TNF-03", famille: "Non fonctionnel", carac: "Utilisabilité", titre: "Affichage sur smartphone (360 × 800)", niveau: "Système", tech: "Émulation d'écran, mesure de mise en page", outil: "Émulation smartphone", ex: ["ENF-04"], resp: B,
    attendu: "Pas de défilement horizontal ; contenu sur au moins 80 % de la largeur" },
  { id: "TNF-04", famille: "Non fonctionnel", carac: "Compatibilité", titre: "Mêmes parcours sous Microsoft Edge et Firefox", niveau: "Système", tech: "Exécution sur deux navigateurs", outil: "Projets Edge et Firefox", ex: ["ENF-05"], resp: B,
    attendu: "TF-03 et TF-05 donnent le même résultat dans les deux navigateurs" },
  { id: "TNF-05", famille: "Non fonctionnel", carac: "Fiabilité", titre: "Données conservées après un redémarrage du serveur", niveau: "Système", tech: "Comparaison avant / après redémarrage", outil: "Module request", ex: ["ENF-08"], resp: B,
    attendu: "Clubs, événements et réservations identiques avant et après le redémarrage" },
  // ---- Structurels (boîte blanche), au niveau de l'API ----
  { id: "TST-01", famille: "Structurel", titre: "Décisions de ReservationController.createReservation", niveau: "Intégration", tech: "Couverture des décisions : type ROOM / EQUIPMENT / inconnu, ressource existante ou non, déjà réservée ou non", outil: "Module request", ex: ["EF-09", "ENF-02"], resp: A,
    attendu: "Chaque décision prise au moins une fois vraie et une fois fausse : 200 PENDING, 400 ressource inexistante ou type inconnu, 409 double réservation" },
  { id: "TST-02", famille: "Structurel", titre: "Conditions de EventController.createEvent", niveau: "Intégration", tech: "Couverture des conditions : titre vide, club inexistant, salle inexistante, participants < 0 ou > capacité, date invalide ou passée", outil: "Module request", ex: ["EF-06"], resp: A,
    attendu: "Chaque condition de refus donne 400 avec son message ; le chemin nominal donne 200 et le statut PENDING" },
  { id: "TST-03", famille: "Structurel", titre: "Branches de AuthController.register", niveau: "Intégration", tech: "Couverture des branches : nom vide, e-mail non institutionnel, mot de passe < 6, e-mail déjà utilisé, chemin nominal", outil: "Module request", ex: ["EF-02"], resp: A,
    attendu: "Les 4 branches d'erreur renvoient 400 ; la branche nominale renvoie 200 avec le rôle CLUB_MEMBER" },
  { id: "TST-04", famille: "Structurel", titre: "Chemins du filtre TokenAuthenticationFilter", niveau: "Intégration", tech: "Couverture des chemins : sans en-tête, en-tête sans « Bearer », jeton inconnu, jeton valide", outil: "Module request", ex: ["EF-03", "ENF-02"], resp: A,
    attendu: "Les 3 premiers chemins laissent la requête non authentifiée (401 sur une ressource protégée) ; le jeton valide authentifie (200)" },
  { id: "TST-05", famille: "Structurel", titre: "Couverture des instructions du frontend pendant les scénarios", niveau: "Système", tech: "Mesure de couverture des instructions (page.coverage, navigateur Edge)", outil: "Navigateur + couverture", ex: ["ENF-06"], resp: A,
    attendu: "Au moins 70 % des instructions des pages testées exécutées ; les parties non couvertes sont listées" },
  // ---- Liés aux changements ----
  { id: "TC-01", famille: "Lié aux changements", sorte: "Confirmation", titre: "Confirmation d'une anomalie fonctionnelle corrigée", niveau: "Système", tech: "Ré-exécution du test fonctionnel qui a échoué, sans le modifier", outil: "Navigateur", ex: ["EF-01", "EF-02", "EF-03", "EF-06", "EF-09"], resp: M,
    attendu: "Le test qui avait échoué (TF-xx) réussit sur la version corrigée" },
  { id: "TC-02", famille: "Lié aux changements", sorte: "Confirmation", titre: "Confirmation d'une anomalie de l'API corrigée", niveau: "Intégration", tech: "Ré-exécution du test d'API qui a échoué", outil: "Module request", ex: ["ENF-02"], resp: M,
    attendu: "Le test de l'API qui avait échoué (TST-xx ou TNF-02) réussit sur la version corrigée" },
  { id: "TC-03", famille: "Lié aux changements", sorte: "Régression", titre: "Régression fonctionnelle après chaque correctif", niveau: "Système", tech: "Ré-exécution de TF-01 à TF-05", outil: "Navigateur", ex: ["EF-01", "EF-02", "EF-03", "EF-06", "EF-09"], resp: M,
    attendu: "TF-01 à TF-05 réussissent toujours après la correction" },
  { id: "TC-04", famille: "Lié aux changements", sorte: "Régression", titre: "Régression de l'API après une modification du backend", niveau: "Intégration", tech: "Ré-exécution de TST-01 à TST-04 et TNF-02", outil: "Module request", ex: ["EF-03", "EF-06", "EF-09", "ENF-01", "ENF-02"], resp: M,
    attendu: "Aucun test de l'API ne passe d'un succès à un échec" },
  { id: "TC-05", famille: "Lié aux changements", sorte: "Régression", titre: "Régression complète sur deux navigateurs avant une version", niveau: "Système", tech: "Ré-exécution de toute la suite sur Edge et Firefox", outil: "Projets Edge et Firefox", ex: ["ENF-05"], resp: M,
    attendu: "Toute la suite réussit sur les deux navigateurs avant de livrer la version" },
  // ---- Maintenance ----
  { id: "TM-01", famille: "Maintenance", sorte: "Migration", titre: "Migration de la base de données vers MariaDB (XAMPP)", niveau: "Intégration", tech: "Test de migration puis régression de l'API", outil: "Module request", ex: ["ENF-10", "ENF-08"], resp: B,
    attendu: "L'application démarre sur MariaDB et les tests de l'API réussissent sans modifier le code" },
  { id: "TM-02", famille: "Maintenance", sorte: "Mise à jour", titre: "Mise à jour des dépendances du frontend", niveau: "Système", tech: "Test après mise à jour (npm), puis régression fonctionnelle", outil: "Navigateur", ex: ["ENF-07"], resp: B,
    attendu: "Après la mise à jour, TF-01 à TF-05 réussissent toujours" },
  { id: "TM-03", famille: "Maintenance", sorte: "Mise à jour", titre: "Montée de version de Java (JDK 17 → 21)", niveau: "Intégration", tech: "Test de l'environnement modifié, puis régression de l'API", outil: "Module request", ex: ["ENF-10"], resp: B,
    attendu: "Le backend démarre sur le JDK 21 et les tests de l'API réussissent" },
  { id: "TM-04", famille: "Maintenance", sorte: "Modification", titre: "Ajout d'un statut CANCELLED aux réservations", niveau: "Système", tech: "Test de la modification, puis régression des réservations (TF-04, TST-01)", outil: "Navigateur + module request", ex: ["EF-09"], resp: B,
    attendu: "Une réservation peut être annulée ; les transitions existantes PENDING → APPROVED / REJECTED fonctionnent toujours" },
  { id: "TM-05", famille: "Maintenance", sorte: "Configuration", titre: "Changement de configuration (port, origine CORS, base) par variables d'environnement", niveau: "Système", tech: "Test de configuration, puis régression", outil: "Navigateur + module request", ex: ["ENF-09"], resp: B,
    attendu: "Avec la nouvelle configuration, l'application fonctionne et une origine non autorisée reste refusée" },
];
