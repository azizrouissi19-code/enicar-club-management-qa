# Fiches de tests d'acceptation — build v1.0.1

Exécution : pas à pas dans le navigateur (Edge), base de données réinitialisée (données initiales du DataLoader). Une capture est prise à chaque étape (qa/results/acceptance/TA-xx-n.png). Script d'aide à l'exécution : frontend/tests/acceptance/TA_acceptance.spec.js.

Comptes : admin@enicar.tn / admin123 · ahmed@enicar.tn / 123456 (président Club IEEE).

## TA-01 — Parcours administrateur (EF-05, EF-07, EF-09)

| # | Action | Résultat attendu | Résultat obtenu |
|---|---|---|---|
| 1 | Se connecter avec admin@enicar.tn / admin123 | Tableau de bord « Bienvenue, Admin ENICarthage » ; 1 club, 1 événement, 1 salle | Conforme |
| 2 | Salles → + Nouvelle Salle « Labo Robotique », capacité 0 | Message d'erreur : capacité strictement positive | Conforme |
| 3 | Recommencer avec une capacité de 24 | La salle « Labo Robotique — 24 places » apparaît | Conforme |
| 4 | Clubs → + Nouveau Club « Club Robotique », président Sami Ben Ali (sami@enicar.tn) | Le club apparaît dans la liste | Conforme |
| 5 | Créer « Club Théâtre » avec un président déjà inscrit (ahmed@enicar.tn) | Message : un compte existe déjà ; aucun club créé | Conforme |
| 6 | Réservations → approuver la réservation #2 (PENDING) | Le statut passe à APPROVED | Conforme |

## TA-02 — Parcours président de club (EF-04, EF-06)

| # | Action | Résultat attendu | Résultat obtenu |
|---|---|---|---|
| 1 | Se connecter avec sami@enicar.tn / secret1 (compte créé en TA-01) | Rôle CLUB_PRESIDENT affiché | Conforme |
| 2 | Événements → + Nouvel Événement « Atelier Arduino », Labo Robotique, 15/03/2027, 20 participants | Seul « Club Robotique » est proposé ; événement créé, statut PENDING, « Par Club Robotique » | Conforme |
| 3 | Créer « Compétition » dans Labo Robotique avec 25 participants (capacité 24) | Message : participants entre 0 et 24 | Conforme |
| 4 | Observer l'événement « Hackathon IEEE 2025 » d'un autre club | Aucun bouton de suppression | Conforme |
| 5 | Ouvrir le tableau de bord | Événements = 2 dont « 1 en attente » | Conforme |

## TA-03 — Parcours membre de club (EF-02, EF-03, EF-09)

| # | Action | Résultat attendu | Résultat obtenu |
|---|---|---|---|
| 1 | S'inscrire avec youssef@gmail.com | Refus : adresse institutionnelle @enicar.tn obligatoire | Conforme |
| 2 | S'inscrire avec youssef@enicar.tn / secret1 | Tableau de bord, rôle CLUB_MEMBER | Conforme |
| 3 | Ouvrir Clubs puis Événements | Aucun bouton de création ni de suppression | Conforme |
| 4 | Réservations → réserver la salle n°2 (Labo Robotique) le 20/03/2027 | Réservation créée avec le statut PENDING | Conforme |
| 5 | Réserver à nouveau la même salle à la même date | Message : ressource déjà réservée à cette date | Conforme |
| 6 | Test exploratoire : appeler directement l'API pour approuver sa propre réservation | Refus HTTP 403 | Conforme |
| 7 | Smartphone (360 px) : ouvrir le menu ☰ | Le menu s'ouvre en tiroir, le contenu reste lisible | Conforme |

## TNF-05 — Persistance après redémarrage (ENF-08)

| # | Action | Résultat attendu | Résultat obtenu |
|---|---|---|---|
| 1 | Compter les données (clubs, événements, salles, équipements, réservations) | — | {"clubs":12,"events":17,"rooms":35,"equipment":4,"reservations":19} |
| 2 | Redémarrer le backend puis recompter | Mêmes valeurs | {"clubs":12,"events":17,"rooms":35,"equipment":4,"reservations":19} — Conforme |
| 3 | Réutiliser le jeton obtenu avant le redémarrage | Session toujours valide | 401 : session perdue — Non conforme (ANO-16) |
