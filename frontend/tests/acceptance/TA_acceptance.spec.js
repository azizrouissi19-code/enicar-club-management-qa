/**
 * Tests d'acceptation TA-01 à TA-03 — fiches manuelles (qa/acceptance/TA-fiches.md)
 * exécutées pas à pas dans le navigateur. Ce script sert d'aide à l'exécution :
 * il réalise chaque action, capture l'écran (preuve) et note le résultat obtenu.
 */
import { test, expect } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "../qa/results/acceptance";
const API = "http://localhost:9090/api";
const journal = [];
mkdirSync(OUT, { recursive: true });

async function step(page, ta, n, action, attendu, fn) {
  let obtenu = "Conforme";
  try {
    await fn();
  } catch (e) {
    obtenu = "Non conforme — " + e.message.split("\n")[0].slice(0, 140);
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${ta}-${n}.png` });
  journal.push({ ta, n, action, attendu, obtenu });
}

async function login(page, email, password) {
  await page.goto("/login");
  await page.getByPlaceholder("ton@enicar.tn").fill(email);
  await page.getByPlaceholder("••••••").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/dashboard/);
}

const logout = (page) => page.locator("aside").getByRole("button", { name: "✕" }).click();

test.describe.configure({ mode: "serial" });
test.afterAll(() => writeFileSync(`${OUT}/TA-results.json`, JSON.stringify(journal, null, 2)));

test("TA-01 Parcours administrateur", async ({ page }) => {
  const T = "TA-01";
  await step(page, T, 1, "Se connecter avec admin@enicar.tn / admin123", "Tableau de bord « Bienvenue, Admin ENICarthage » ; 1 club, 1 événement, 1 salle", async () => {
    await login(page, "admin@enicar.tn", "admin123");
    await expect(page.getByText("Bienvenue, Admin ENICarthage")).toBeVisible();
    await expect(page.locator("div.grid > div", { hasText: "Clubs actifs" }).first()).toContainText("1");
  });
  await step(page, T, 2, "Salles → + Nouvelle Salle « Labo Robotique », capacité 0", "Message d'erreur : capacité strictement positive", async () => {
    await page.getByRole("link", { name: "Salles" }).click();
    await page.getByRole("button", { name: /nouvelle salle/i }).click();
    await page.getByPlaceholder("Ex: Amphi B").fill("Labo Robotique");
    await page.getByPlaceholder("Ex: 50").fill("0");
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByRole("alert")).toContainText("capacité strictement positive");
  });
  await step(page, T, 3, "Recommencer avec une capacité de 24", "La salle « Labo Robotique — 24 places » apparaît", async () => {
    await page.getByRole("button", { name: /nouvelle salle/i }).click();
    await page.getByPlaceholder("Ex: Amphi B").fill("Labo Robotique");
    await page.getByPlaceholder("Ex: 50").fill("24");
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText("Labo Robotique")).toBeVisible();
    await expect(page.getByText("24 places")).toBeVisible();
  });
  await step(page, T, 4, "Clubs → + Nouveau Club « Club Robotique », président Sami Ben Ali (sami@enicar.tn)", "Le club apparaît dans la liste", async () => {
    await page.getByRole("link", { name: "Clubs" }).click();
    await page.getByRole("button", { name: /nouveau club/i }).click();
    await page.getByPlaceholder("Ex: Club Robotique").fill("Club Robotique");
    await page.getByPlaceholder("Description du club...").fill("Conception et programmation de robots");
    await page.getByPlaceholder("Ex: Sami Ben Ali").fill("Sami Ben Ali");
    await page.getByPlaceholder("Ex: sami@enicar.tn").fill("sami@enicar.tn");
    await page.getByPlaceholder("••••••••").fill("secret1");
    await page.getByRole("button", { name: "Créer" }).click();
    await expect(page.getByText("Club Robotique")).toBeVisible();
  });
  await step(page, T, 5, "Créer « Club Théâtre » avec un président déjà inscrit (ahmed@enicar.tn)", "Message : un compte existe déjà ; aucun club créé", async () => {
    await page.getByRole("button", { name: /nouveau club/i }).click();
    await page.getByPlaceholder("Ex: Club Robotique").fill("Club Théâtre");
    await page.getByPlaceholder("Ex: Sami Ben Ali").fill("Ahmed");
    await page.getByPlaceholder("Ex: sami@enicar.tn").fill("ahmed@enicar.tn");
    await page.getByPlaceholder("••••••••").fill("x");
    await page.getByRole("button", { name: "Créer" }).click();
    await expect(page.getByRole("alert")).toContainText("existe déjà");
    await expect(page.getByText("Club Théâtre")).toHaveCount(0);
  });
  await step(page, T, 6, "Réservations → approuver la réservation #2 (PENDING)", "Le statut passe à APPROVED", async () => {
    await page.getByRole("link", { name: "Réservations" }).click();
    const row = page.locator("tr", { hasText: "#2" });
    await row.getByRole("button", { name: "Approuver" }).click();
    await expect(row.getByText("APPROVED")).toBeVisible();
  });
  expect(journal.filter((j) => j.ta === T && j.obtenu !== "Conforme")).toEqual([]);
});

test("TA-02 Parcours président de club", async ({ page }) => {
  const T = "TA-02";
  await step(page, T, 1, "Se connecter avec sami@enicar.tn / secret1 (compte créé en TA-01)", "Rôle CLUB_PRESIDENT affiché", async () => {
    await login(page, "sami@enicar.tn", "secret1");
    await expect(page.locator("aside").getByText("CLUB_PRESIDENT")).toBeVisible();
  });
  await step(page, T, 2, "Événements → + Nouvel Événement « Atelier Arduino », Labo Robotique, 15/03/2027, 20 participants", "Seul « Club Robotique » est proposé ; événement créé, statut PENDING, « Par Club Robotique »", async () => {
    await page.getByRole("link", { name: "Événements" }).click();
    await page.getByRole("button", { name: /nouvel événement/i }).click();
    await expect(page.getByLabel("Club").locator("option")).toHaveText(["Club Robotique"]);
    const inputs = page.locator(".fixed input");
    await inputs.nth(0).fill("Atelier Arduino");
    await inputs.nth(1).fill("Labo Robotique");
    await inputs.nth(2).fill("2027-03-15");
    await inputs.nth(3).fill("20");
    await page.getByRole("button", { name: "Créer" }).click();
    const card = page.locator("div.rounded-xl", { has: page.getByRole("heading", { name: "Atelier Arduino" }) });
    await expect(card.getByText("PENDING")).toBeVisible();
    await expect(card.getByText("Club Robotique")).toBeVisible();
  });
  await step(page, T, 3, "Créer « Compétition » dans Labo Robotique avec 25 participants (capacité 24)", "Message : participants entre 0 et 24", async () => {
    await page.getByRole("button", { name: /nouvel événement/i }).click();
    const inputs = page.locator(".fixed input");
    await inputs.nth(0).fill("Compétition");
    await inputs.nth(1).fill("Labo Robotique");
    await inputs.nth(2).fill("2027-04-10");
    await inputs.nth(3).fill("25");
    await page.getByRole("button", { name: "Créer" }).click();
    await expect(page.getByRole("alert")).toContainText("entre 0 et 24");
  });
  await step(page, T, 4, "Observer l'événement « Hackathon IEEE 2025 » d'un autre club", "Aucun bouton de suppression", async () => {
    const card = page.locator("div.rounded-xl", { has: page.getByRole("heading", { name: "Hackathon IEEE 2025" }) });
    await expect(card).toBeVisible();
    await expect(card.getByRole("button", { name: "✕" })).toHaveCount(0);
  });
  await step(page, T, 5, "Ouvrir le tableau de bord", "Événements = 2 dont « 1 en attente »", async () => {
    await page.getByRole("link", { name: "Dashboard" }).click();
    const card = page.locator("div.grid > div", { hasText: "Événements" }).first();
    await expect(card).toContainText("2");
    await expect(card).toContainText("1 en attente");
  });
  expect(journal.filter((j) => j.ta === T && j.obtenu !== "Conforme")).toEqual([]);
});

test("TA-03 Parcours membre de club", async ({ page, request }) => {
  const T = "TA-03";
  const rooms = await (await request.get(`${API}/rooms`)).json();
  const labo = rooms.find((r) => r.name === "Labo Robotique");
  const fill = async (email) => {
    await page.goto("/register");
    await page.getByPlaceholder("Prénom Nom").fill("Youssef Trabelsi");
    await page.getByPlaceholder("prenom@enicar.tn").fill(email);
    await page.getByPlaceholder("min. 6 caractères").fill("secret1");
    await page.getByRole("button", { name: /s'inscrire/i }).click();
  };
  await step(page, T, 1, "S'inscrire avec youssef@gmail.com", "Refus : adresse institutionnelle @enicar.tn obligatoire", async () => {
    await fill("youssef@gmail.com");
    await expect(page.getByText(/institutionnelle/)).toBeVisible();
  });
  await step(page, T, 2, "S'inscrire avec youssef@enicar.tn / secret1", "Tableau de bord, rôle CLUB_MEMBER", async () => {
    await fill("youssef@enicar.tn");
    await expect(page.locator("aside").getByText("CLUB_MEMBER")).toBeVisible();
  });
  await step(page, T, 3, "Ouvrir Clubs puis Événements", "Aucun bouton de création ni de suppression", async () => {
    await page.getByRole("link", { name: "Clubs" }).click();
    await expect(page.getByRole("button", { name: /nouveau club/i })).toHaveCount(0);
    await page.getByRole("link", { name: "Événements" }).click();
    await expect(page.getByRole("button", { name: /nouvel événement/i })).toHaveCount(0);
    await expect(page.locator("main").getByRole("button", { name: "✕" })).toHaveCount(0);
  });
  await step(page, T, 4, `Réservations → réserver la salle n°${labo?.id} (Labo Robotique) le 20/03/2027`, "Réservation créée avec le statut PENDING", async () => {
    await page.getByRole("link", { name: "Réservations" }).click();
    await page.getByRole("button", { name: /nouvelle réservation/i }).click();
    await page.getByPlaceholder("Ex: 1").fill(String(labo.id));
    await page.locator(".fixed input[type=date]").fill("2027-03-20");
    await page.getByRole("button", { name: "Réserver" }).click();
    await expect(page.locator("tr", { hasText: "2027-03-20" }).getByText("PENDING")).toBeVisible();
  });
  await step(page, T, 5, "Réserver à nouveau la même salle à la même date", "Message : ressource déjà réservée à cette date", async () => {
    await page.getByRole("button", { name: /nouvelle réservation/i }).click();
    await page.getByPlaceholder("Ex: 1").fill(String(labo.id));
    await page.locator(".fixed input[type=date]").fill("2027-03-20");
    await page.getByRole("button", { name: "Réserver" }).click();
    await expect(page.getByRole("alert")).toContainText("déjà réservée");
  });
  await step(page, T, 6, "Test exploratoire : appeler directement l'API pour approuver sa propre réservation", "Refus HTTP 403", async () => {
    const status = await page.evaluate(async (api) => {
      const r = await fetch(`${api}/reservations/1/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      return r.status;
    }, API);
    expect(status).toBe(403);
  });
  await step(page, T, 7, "Smartphone (360 px) : ouvrir le menu ☰", "Le menu s'ouvre en tiroir, le contenu reste lisible", async () => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await expect(page.locator("aside")).toBeVisible();
  });
  expect(journal.filter((j) => j.ta === T && j.obtenu !== "Conforme")).toEqual([]);
});
