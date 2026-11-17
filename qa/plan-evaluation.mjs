// Plan de test présenté à l'évaluation : 5 tests fonctionnels, 5 tests non fonctionnels, 4 tests d'API.
// Chaque test a un responsable (chef d'équipe ou l'un des deux membres).
const A = "Mohamed Aziz Rouissi", B = "Mohamed Bouchahda", M = "Mohamed Hosni Missaoui";

export const PLAN = [
  // ---- Tests fonctionnels : ce que fait l'application ----
  { id: "TF-01", famille: "Fonctionnel", titre: "Connexion avec des identifiants valides et invalides", niveau: "Unitaire", tech: "Partitions d'équivalence (identifiants valides / mot de passe erroné / e-mail inconnu)", outil: "Jest + React Testing Library", mode: "automatisé", ex: ["EF-01"], resp: M,
    attendu: "Identifiants valides : accès au tableau de bord ; sinon message « Email ou mot de passe incorrect »" },
  { id: "TF-02", famille: "Fonctionnel", titre: "Inscription : adresse institutionnelle et longueur du mot de passe", niveau: "Unitaire", tech: "Valeurs limites (mot de passe de 5 / 6 caractères), partitions (@enicar.tn / @gmail.com)", outil: "Jest + React Testing Library", mode: "automatisé", ex: ["EF-02"], resp: M,
    attendu: "5 caractères ou adresse non institutionnelle refusés ; 6 caractères et @enicar.tn acceptés, rôle CLUB_MEMBER" },
  { id: "TF-03", famille: "Fonctionnel", titre: "Création d'un événement par le président dans la limite de capacité", niveau: "Système", tech: "Valeurs limites (40 / 41 participants pour une salle de 40 places)", outil: "Playwright", mode: "automatisé", ex: ["EF-06"], resp: M,
    attendu: "40 participants : événement créé avec le statut PENDING ; 41 : refus avec message" },
  { id: "TF-04", famille: "Fonctionnel", titre: "Réservation d'une salle par un membre puis approbation par l'administration", niveau: "Acceptation", tech: "Transitions d'états (PENDING → APPROVED / REJECTED)", outil: "Navigateur + fiche de test", mode: "manuel", ex: ["EF-09"], resp: A,
    attendu: "La réservation passe de PENDING à APPROVED ; une seconde réservation de la même salle à la même date est refusée" },
  { id: "TF-05", famille: "Fonctionnel", titre: "Actions visibles selon le rôle (membre, président, administration)", niveau: "Système", tech: "Table de décision rôle × action", outil: "Playwright", mode: "automatisé", ex: ["EF-03", "EF-04"], resp: A,
    attendu: "Un membre ne voit ni création ni suppression ; le président gère les événements de son club ; l'administration gère clubs, salles et réservations" },
  // ---- Tests non fonctionnels : comment elle se comporte ----
  { id: "TNF-01", famille: "Non fonctionnel", carac: "Performance", titre: "Temps de réponse de l'API sous 50 utilisateurs simultanés", niveau: "Système", tech: "Test de charge", outil: "k6, Postman (onglet Performance)", mode: "automatisé", ex: ["ENF-03"], resp: B,
    attendu: "95 % des requêtes en moins de 500 ms, moins de 1 % d'erreurs" },
  { id: "TNF-02", famille: "Non fonctionnel", carac: "Sécurité", titre: "Mot de passe haché et jamais renvoyé par l'API", niveau: "Intégration", tech: "Inspection des réponses, revue de code", outil: "Postman", mode: "automatisé", ex: ["ENF-01"], resp: B,
    attendu: "Aucun champ password ni hash BCrypt dans les réponses ; mot de passe stocké haché" },
  { id: "TNF-03", famille: "Non fonctionnel", carac: "Utilisabilité", titre: "Affichage sur smartphone (360 × 800)", niveau: "Système", tech: "Mesure de mise en page", outil: "Playwright", mode: "automatisé", ex: ["ENF-04"], resp: M,
    attendu: "Pas de défilement horizontal ; contenu sur au moins 80 % de la largeur" },
  { id: "TNF-04", famille: "Non fonctionnel", carac: "Compatibilité", titre: "Mêmes parcours sous Microsoft Edge et Firefox", niveau: "Système", tech: "Exécution sur deux navigateurs", outil: "Playwright", mode: "automatisé", ex: ["ENF-05"], resp: A,
    attendu: "Les scénarios TF-03 et TF-05 donnent le même résultat dans les deux navigateurs" },
  { id: "TNF-05", famille: "Non fonctionnel", carac: "Fiabilité", titre: "Données conservées après un redémarrage du serveur", niveau: "Acceptation", tech: "Test exploratoire", outil: "Navigateur, API", mode: "manuel", ex: ["ENF-08"], resp: A,
    attendu: "Clubs, événements et réservations identiques avant et après le redémarrage" },
  // ---- Tests d'API ----
  { id: "API-01", famille: "API", titre: "POST /api/auth/login : jeton si valide, 401 sinon", niveau: "Intégration", tech: "Partitions d'équivalence", outil: "Postman", mode: "automatisé", ex: ["EF-01", "ENF-02"], resp: B,
    attendu: "200 avec jeton et profil ; 401 pour un mauvais mot de passe ; jamais 500" },
  { id: "API-02", famille: "API", titre: "Contrôle d'accès : sans jeton, jeton falsifié, mauvais rôle", niveau: "Intégration", tech: "Table de décision (sans jeton / falsifié / membre / administrateur)", outil: "Postman", mode: "automatisé", ex: ["EF-03", "ENF-02"], resp: B,
    attendu: "Sans jeton ou jeton falsifié : 401 ; membre sur une action d'administration : 403 ; administrateur : 200" },
  { id: "API-03", famille: "API", titre: "POST /api/reservations : double réservation refusée", niveau: "Intégration", tech: "Partitions (ressource libre / déjà réservée / inexistante)", outil: "Postman", mode: "automatisé", ex: ["EF-09"], resp: B,
    attendu: "Ressource libre : 200 et statut PENDING ; même salle à la même date : 409 ; ressource inexistante : 400" },
  { id: "API-04", famille: "API", titre: "POST /api/clubs : création d'un club et de son président", niveau: "Intégration", tech: "Partitions (données valides / e-mail déjà utilisé / nom vide)", outil: "Postman", mode: "automatisé", ex: ["EF-05"], resp: A,
    attendu: "Données valides : 200 et compte président créé ; e-mail déjà utilisé : 409 ; nom vide : 400" },
];
