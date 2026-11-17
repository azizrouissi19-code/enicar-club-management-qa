// Données du suivi hebdomadaire. Fichier produit par l'espace chef d'équipe (chef.html) : commitez-le pour partager.
window.SUIVI = {
  "projet": "Plateforme de gestion des clubs de l'ENICarthage",
  "equipe": [
    "Mohamed Aziz Rouissi",
    "Mohamed Bouchahda",
    "Mohamed Hosni Missaoui"
  ],
  "chef": "Mohamed Aziz Rouissi",
  "encadrant": "M. Jaidi",
  "semaines": [
    {
      "semaine": "2026-S46",
      "date_debut": "2026-11-09",
      "phase": "CR1 — Plateforme, description du projet, outil de gestion des tests",
      "statut": "Dans les temps",
      "objectifs": [
        {
          "texte": "Trouver la plateforme à tester et la faire fonctionner en local",
          "atteint": true
        },
        {
          "texte": "Rédiger la description du projet",
          "atteint": true
        },
        {
          "texte": "Choisir et mettre en place l'outil de gestion des tests (GitHub)",
          "atteint": true
        }
      ],
      "faits_marquants": "Plateforme de gestion des clubs récupérée (backend Spring Boot + frontend React) et lancée en local. Description du projet rédigée. Outil de gestion des tests mis en place sur GitHub (issues, libellés, jalons, tableau Projects).",
      "difficultes": "Le dépôt GitHub de l'équipe était incomplet (backend absent) : la version complète a été récupérée depuis le Drive et versionnée.",
      "prochaines_etapes": "Plan de test (CR2) : document et saisie dans l'outil de gestion des tests ; installation de l'outil de test."
    },
    {
      "semaine": "2026-S47",
      "date_debut": "2026-11-16",
      "phase": "CR2 — Plan de test",
      "statut": "Dans les temps",
      "objectifs": [
        {
          "texte": "Plan de test : 5 tests pour chacun des 5 types de test du cours",
          "atteint": false
        },
        {
          "texte": "Plan de test saisi dans l'outil de gestion des tests (GitHub), chaque test assigné",
          "atteint": false
        },
        {
          "texte": "Outil de test (Playwright) installé sur le poste, avec captures de la configuration et de l'environnement",
          "atteint": true
        },
        {
          "texte": "Rapport CR3 : CR1 + CR2 + besoins, architecture, conception",
          "atteint": false
        }
      ],
      "faits_marquants": "",
      "difficultes": "",
      "prochaines_etapes": ""
    }
  ],
  "taches": [
    {
      "id": "t01",
      "semaine": "2026-S46",
      "tache": "Recherche et récupération de la plateforme (version complète depuis le Drive), installation en local",
      "lot": "Infrastructure",
      "membre": "Mohamed Aziz Rouissi",
      "statut": "Terminée",
      "priorite": "Haute",
      "echeance": "2026-11-10"
    },
    {
      "id": "t02",
      "semaine": "2026-S46",
      "tache": "Description du projet : contexte, profils (membre, président, administration) et fonctionnalités",
      "lot": "Analyse",
      "membre": "Mohamed Hosni Missaoui",
      "statut": "Terminée",
      "priorite": "Haute",
      "echeance": "2026-11-12"
    },
    {
      "id": "t03",
      "semaine": "2026-S46",
      "tache": "Description technique : technologies, architecture et démarrage de la plateforme",
      "lot": "Analyse",
      "membre": "Mohamed Bouchahda",
      "statut": "Terminée",
      "priorite": "Normale",
      "echeance": "2026-11-12"
    },
    {
      "id": "t04",
      "semaine": "2026-S46",
      "tache": "Outil de gestion des tests : dépôt GitHub, libellés, jalons et tableau Projects",
      "lot": "Gestion",
      "membre": "Mohamed Aziz Rouissi",
      "statut": "Terminée",
      "priorite": "Haute",
      "echeance": "2026-11-13"
    },
    {
      "id": "t05",
      "semaine": "2026-S46",
      "tache": "Compte rendu CR1 : description du projet et outil de gestion des tests",
      "lot": "Rapport",
      "membre": "Mohamed Aziz Rouissi",
      "statut": "Terminée",
      "priorite": "Haute",
      "echeance": "2026-11-14"
    },
    {
      "id": "t06",
      "semaine": "2026-S47",
      "tache": "Plan de test (document) : stratégie, niveaux, 5 types de test, critères, répartition",
      "lot": "Tests",
      "membre": "Mohamed Aziz Rouissi",
      "statut": "En cours",
      "priorite": "Haute",
      "echeance": "2026-11-19"
    },
    {
      "id": "t07",
      "semaine": "2026-S47",
      "tache": "Installation et configuration de Playwright sur le poste, captures de l'environnement",
      "lot": "Infrastructure",
      "membre": "Mohamed Aziz Rouissi",
      "statut": "Terminée",
      "priorite": "Haute",
      "echeance": "2026-11-17"
    },
    {
      "id": "t08",
      "semaine": "2026-S47",
      "tache": "Conception des tests fonctionnels TF-01 à TF-05 (résultat attendu, technique, exigences)",
      "lot": "Tests",
      "membre": "Mohamed Hosni Missaoui",
      "statut": "À faire",
      "priorite": "Haute",
      "echeance": "2026-11-20"
    },
    {
      "id": "t09",
      "semaine": "2026-S47",
      "tache": "Conception des tests liés aux changements TC-01 à TC-05 (confirmation, régression)",
      "lot": "Tests",
      "membre": "Mohamed Hosni Missaoui",
      "statut": "À faire",
      "priorite": "Normale",
      "echeance": "2026-11-20"
    },
    {
      "id": "t10",
      "semaine": "2026-S47",
      "tache": "Conception des tests non fonctionnels TNF-01 à TNF-05 (performance, sécurité, utilisabilité, compatibilité, fiabilité)",
      "lot": "Tests",
      "membre": "Mohamed Bouchahda",
      "statut": "À faire",
      "priorite": "Haute",
      "echeance": "2026-11-20"
    },
    {
      "id": "t20",
      "semaine": "2026-S47",
      "tache": "Conception des tests de maintenance TM-01 à TM-05",
      "lot": "Tests",
      "membre": "Mohamed Bouchahda",
      "statut": "À faire",
      "priorite": "Normale",
      "echeance": "2026-11-20"
    },
    {
      "id": "t21",
      "semaine": "2026-S47",
      "tache": "Conception des tests structurels TST-01 à TST-05 (boîte blanche)",
      "lot": "Tests",
      "membre": "Mohamed Aziz Rouissi",
      "statut": "À faire",
      "priorite": "Haute",
      "echeance": "2026-11-20"
    },
    {
      "id": "t22",
      "semaine": "2026-S47",
      "tache": "Saisie du plan de test dans GitHub : une issue par test, assignée à son responsable",
      "lot": "Gestion",
      "membre": "Mohamed Aziz Rouissi",
      "statut": "À faire",
      "priorite": "Normale",
      "echeance": "2026-11-21"
    },
    {
      "id": "t23",
      "semaine": "2026-S47",
      "tache": "Rapport CR3 (CR1 + CR2 + besoins, architecture, conception) et revue formelle",
      "lot": "Rapport",
      "membre": "Mohamed Aziz Rouissi",
      "statut": "En cours",
      "priorite": "Haute",
      "echeance": "2026-11-21"
    },
    {
      "id": "t11",
      "semaine": "2026-S48",
      "tache": "Exécution de TF-01 et TF-02 (Playwright)",
      "lot": "Tests",
      "membre": "Mohamed Hosni Missaoui",
      "statut": "À faire",
      "priorite": "Normale",
      "echeance": "2026-11-27"
    },
    {
      "id": "t12",
      "semaine": "2026-S48",
      "tache": "Exécution de TNF-01 (performance) et TNF-02 (sécurité) (Playwright)",
      "lot": "Tests",
      "membre": "Mohamed Bouchahda",
      "statut": "À faire",
      "priorite": "Normale",
      "echeance": "2026-11-27"
    },
    {
      "id": "t13",
      "semaine": "2026-S48",
      "tache": "Environnement de test et exécution des tests structurels TST-01 à TST-05 (Playwright)",
      "lot": "Infrastructure",
      "membre": "Mohamed Aziz Rouissi",
      "statut": "À faire",
      "priorite": "Normale",
      "echeance": "2026-11-25"
    },
    {
      "id": "t14",
      "semaine": "2026-S49",
      "tache": "Exécution de TF-03, TF-04 et TF-05 (Playwright)",
      "lot": "Tests",
      "membre": "Mohamed Hosni Missaoui",
      "statut": "À faire",
      "priorite": "Normale",
      "echeance": "2026-12-04"
    },
    {
      "id": "t15",
      "semaine": "2026-S49",
      "tache": "Exécution de TNF-03, TNF-04 et TNF-05 (Playwright : smartphone, navigateurs, redémarrage)",
      "lot": "Tests",
      "membre": "Mohamed Bouchahda",
      "statut": "À faire",
      "priorite": "Normale",
      "echeance": "2026-12-04"
    },
    {
      "id": "t16",
      "semaine": "2026-S49",
      "tache": "Suivi des anomalies sur GitHub et revue des résultats de l'équipe",
      "lot": "Gestion",
      "membre": "Mohamed Aziz Rouissi",
      "statut": "À faire",
      "priorite": "Normale",
      "echeance": "2026-12-05"
    },
    {
      "id": "t17",
      "semaine": "2026-S50",
      "tache": "Tests de maintenance TM-01 à TM-05 (Playwright)",
      "lot": "Backend",
      "membre": "Mohamed Bouchahda",
      "statut": "À faire",
      "priorite": "Normale",
      "echeance": "2026-12-10"
    },
    {
      "id": "t18",
      "semaine": "2026-S50",
      "tache": "Tests liés aux changements : confirmation TC-01, TC-02 et régression TC-03 à TC-05 (Playwright)",
      "lot": "Frontend",
      "membre": "Mohamed Hosni Missaoui",
      "statut": "À faire",
      "priorite": "Normale",
      "echeance": "2026-12-10"
    },
    {
      "id": "t19",
      "semaine": "2026-S50",
      "tache": "Bilan, verdict de recette et rapport final",
      "lot": "Rapport",
      "membre": "Mohamed Aziz Rouissi",
      "statut": "À faire",
      "priorite": "Haute",
      "echeance": "2026-12-12"
    }
  ],
  "phases": {
    "2026-S48": "Exécution : tests fonctionnels, non fonctionnels et structurels",
    "2026-S49": "Exécution (suite) et suivi des anomalies",
    "2026-S50": "Tests de maintenance, tests liés aux changements et rapport final"
  }
};
