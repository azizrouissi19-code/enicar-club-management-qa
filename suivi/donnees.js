// Données du suivi hebdomadaire. Mettez ce fichier à jour (ou utilisez « Exporter » dans la page) puis commitez-le.
window.SUIVI = {
  "projet": "Plateforme de gestion des clubs de l'ENICarthage",
  "equipe": [
    "Mohamed Aziz Rouissi",
    "Mohamed Bouchahda",
    "Mohamed Hosni Missaoui"
  ],
  "semaines": [
    {
      "semaine": "2026-S46",
      "date_debut": "2026-11-09",
      "statut": "Dans les temps",
      "tests_reussis": 136,
      "tests_total": 138,
      "anomalies_detectees": 18,
      "anomalies_corrigees": 15,
      "anomalies_ouvertes": 3,
      "faits_marquants": "Campagne de test complète sur la version du Drive (v1.0.0) puis livraison de la v1.0.1 : 15 anomalies corrigées et re-testées, dont les 2 critiques (API sans authentification, hash du mot de passe exposé). Rapport d'atelier de 30 pages, référentiel GitHub (70 issues) et tableau de suivi publiés.",
      "difficultes": "Dépôt GitHub de l'équipe incomplet (backend absent) : version complète récupérée depuis le Drive. Une régression introduite par un correctif (ANO-18) a été détectée par la non-régression puis corrigée.",
      "prochaines_etapes": "Rejouer à la main les fiches d'acceptation, traiter les anomalies ouvertes (ANO-12, ANO-16, ANO-17), ajouter le nom de l'encadrant au rapport et préparer la présentation."
    }
  ],
  "taches": [
    {
      "semaine": "2026-S46",
      "tache": "Récupérer le projet complet (Drive) et installer l'environnement (Docker, MySQL)",
      "lot": "Infrastructure",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S46",
      "tache": "Rédiger les 20 exigences fonctionnelles et non fonctionnelles",
      "lot": "Analyse",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S46",
      "tache": "Plan de test et matrice de traçabilité",
      "lot": "Tests",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S46",
      "tache": "Tests unitaires et de composants Jest (71)",
      "lot": "Tests",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S46",
      "tache": "Tests d'intégration de l'API avec Jest (45)",
      "lot": "Tests",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S46",
      "tache": "Tests E2E Playwright sur Edge et Firefox (22)",
      "lot": "Tests",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S46",
      "tache": "Charge k6, couverture JaCoCo, analyse statique",
      "lot": "Tests",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S46",
      "tache": "Correctifs backend : authentification, rôles, validations",
      "lot": "Backend",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S46",
      "tache": "Correctifs frontend : tableau de bord, droits, mobile",
      "lot": "Frontend",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S46",
      "tache": "Tests d'acceptation TA-01 à TA-03",
      "lot": "Tests",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S46",
      "tache": "Référentiel GitHub : issues, jalons, tableau Projects",
      "lot": "Gestion",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S46",
      "tache": "Rapport d'atelier (PDF, 30 pages)",
      "lot": "Rapport",
      "membre": "Équipe",
      "statut": "Terminée"
    },
    {
      "semaine": "2026-S47",
      "tache": "Rejouer à la main les fiches d'acceptation",
      "lot": "Tests",
      "membre": "À attribuer",
      "statut": "À faire"
    },
    {
      "semaine": "2026-S47",
      "tache": "ANO-12 : rendre fonctionnels les paramètres et notifications",
      "lot": "Frontend",
      "membre": "À attribuer",
      "statut": "À faire"
    },
    {
      "semaine": "2026-S47",
      "tache": "ANO-16 : remplacer les jetons en mémoire par des JWT signés",
      "lot": "Backend",
      "membre": "À attribuer",
      "statut": "À faire"
    },
    {
      "semaine": "2026-S47",
      "tache": "ANO-17 : passer à MySQL 8 ou MariaDB 10.6+",
      "lot": "Infrastructure",
      "membre": "À attribuer",
      "statut": "À faire"
    },
    {
      "semaine": "2026-S47",
      "tache": "Ajouter l'encadrant au rapport et préparer la présentation",
      "lot": "Rapport",
      "membre": "À attribuer",
      "statut": "À faire"
    }
  ]
};
