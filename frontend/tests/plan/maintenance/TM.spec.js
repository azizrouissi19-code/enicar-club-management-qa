// Tests de maintenance — Le système reste-t-il correct après une évolution ?
// Effectués sur le système existant lors de modifications, de migrations ou de mises à jour : tests des modifications puis tests de régression.
// Fichier généré par qa/plan-squelette.mjs : les tests sont planifiés (test.fixme), pas encore écrits.
import { test } from "@playwright/test";

test.describe("Tests de maintenance", () => {
  // Intégration · Test de migration puis régression de l'API
  // Usage de Playwright : Module request · Exigences : ENF-10, ENF-08
  // Résultat attendu : L'application démarre sur MariaDB et les tests de l'API réussissent sans modifier le code
  test.fixme("TM-01 : Migration de la base de données vers MariaDB (XAMPP)", {
    tag: ["@TM", "@intégration"],
    annotation: [
      { type: "responsable", description: "Mohamed Bouchahda" },
      { type: "exigences", description: "ENF-10, ENF-08" },
    ],
  }, async ({ request }) => {
    // À écrire par Mohamed Bouchahda
  });

  // Système · Test après mise à jour (npm), puis régression fonctionnelle
  // Usage de Playwright : Navigateur · Exigences : ENF-07
  // Résultat attendu : Après la mise à jour, TF-01 à TF-05 réussissent toujours
  test.fixme("TM-02 : Mise à jour des dépendances du frontend", {
    tag: ["@TM", "@système"],
    annotation: [
      { type: "responsable", description: "Mohamed Bouchahda" },
      { type: "exigences", description: "ENF-07" },
    ],
  }, async ({ page }) => {
    // À écrire par Mohamed Bouchahda
  });

  // Intégration · Test de l'environnement modifié, puis régression de l'API
  // Usage de Playwright : Module request · Exigences : ENF-10
  // Résultat attendu : Le backend démarre sur le JDK 21 et les tests de l'API réussissent
  test.fixme("TM-03 : Montée de version de Java (JDK 17 → 21)", {
    tag: ["@TM", "@intégration"],
    annotation: [
      { type: "responsable", description: "Mohamed Bouchahda" },
      { type: "exigences", description: "ENF-10" },
    ],
  }, async ({ request }) => {
    // À écrire par Mohamed Bouchahda
  });

  // Système · Test de la modification, puis régression des réservations (TF-04, TST-01)
  // Usage de Playwright : Navigateur + module request · Exigences : EF-09
  // Résultat attendu : Une réservation peut être annulée ; les transitions existantes PENDING → APPROVED / REJECTED fonctionnent toujours
  test.fixme("TM-04 : Ajout d'un statut CANCELLED aux réservations", {
    tag: ["@TM", "@système"],
    annotation: [
      { type: "responsable", description: "Mohamed Bouchahda" },
      { type: "exigences", description: "EF-09" },
    ],
  }, async ({ page }) => {
    // À écrire par Mohamed Bouchahda
  });

  // Système · Test de configuration, puis régression
  // Usage de Playwright : Navigateur + module request · Exigences : ENF-09
  // Résultat attendu : Avec la nouvelle configuration, l'application fonctionne et une origine non autorisée reste refusée
  test.fixme("TM-05 : Changement de configuration (port, origine CORS, base) par variables d'environnement", {
    tag: ["@TM", "@système"],
    annotation: [
      { type: "responsable", description: "Mohamed Bouchahda" },
      { type: "exigences", description: "ENF-09" },
    ],
  }, async ({ page }) => {
    // À écrire par Mohamed Bouchahda
  });
});
