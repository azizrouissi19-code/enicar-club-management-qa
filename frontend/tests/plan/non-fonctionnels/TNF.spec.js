// Tests non fonctionnels — Comment le système fonctionne-t-il ?
// Ils évaluent les caractéristiques du système : performance, sécurité, utilisabilité, compatibilité, fiabilité.
// Fichier généré par qa/plan-squelette.mjs : les tests sont planifiés (test.fixme), pas encore écrits.
import { test } from "@playwright/test";

test.describe("Tests non fonctionnels", () => {
  // Système · Mesure sous charge
  // Usage de Playwright : Module request · Exigences : ENF-03
  // Résultat attendu : 95 % des requêtes en moins de 500 ms, aucune erreur
  test.fixme("TNF-01 : Temps de réponse sous 50 requêtes simultanées", {
    tag: ["@TNF", "@système"],
    annotation: [
      { type: "responsable", description: "Mohamed Bouchahda" },
      { type: "exigences", description: "ENF-03" },
    ],
  }, async ({ request }) => {
    // À écrire par Mohamed Bouchahda
  });

  // Intégration · Inspection des réponses
  // Usage de Playwright : Module request · Exigences : ENF-01
  // Résultat attendu : Aucun champ password ni hash BCrypt dans les réponses de connexion et d'inscription
  test.fixme("TNF-02 : Mot de passe haché et jamais renvoyé par l'API", {
    tag: ["@TNF", "@intégration"],
    annotation: [
      { type: "responsable", description: "Mohamed Bouchahda" },
      { type: "exigences", description: "ENF-01" },
    ],
  }, async ({ request }) => {
    // À écrire par Mohamed Bouchahda
  });

  // Système · Émulation d'écran, mesure de mise en page
  // Usage de Playwright : Émulation smartphone · Exigences : ENF-04
  // Résultat attendu : Pas de défilement horizontal ; contenu sur au moins 80 % de la largeur
  test.fixme("TNF-03 : Affichage sur smartphone (360 × 800)", {
    tag: ["@TNF", "@système"],
    annotation: [
      { type: "responsable", description: "Mohamed Bouchahda" },
      { type: "exigences", description: "ENF-04" },
    ],
  }, async ({ page }) => {
    // À écrire par Mohamed Bouchahda
  });

  // Système · Exécution sur deux navigateurs
  // Usage de Playwright : Projets Edge et Firefox · Exigences : ENF-05
  // Résultat attendu : TF-03 et TF-05 donnent le même résultat dans les deux navigateurs
  test.fixme("TNF-04 : Mêmes parcours sous Microsoft Edge et Firefox", {
    tag: ["@TNF", "@système"],
    annotation: [
      { type: "responsable", description: "Mohamed Bouchahda" },
      { type: "exigences", description: "ENF-05" },
    ],
  }, async ({ page }) => {
    // À écrire par Mohamed Bouchahda
  });

  // Système · Comparaison avant / après redémarrage
  // Usage de Playwright : Module request · Exigences : ENF-08
  // Résultat attendu : Clubs, événements et réservations identiques avant et après le redémarrage
  test.fixme("TNF-05 : Données conservées après un redémarrage du serveur", {
    tag: ["@TNF", "@système"],
    annotation: [
      { type: "responsable", description: "Mohamed Bouchahda" },
      { type: "exigences", description: "ENF-08" },
    ],
  }, async ({ request }) => {
    // À écrire par Mohamed Bouchahda
  });
});
