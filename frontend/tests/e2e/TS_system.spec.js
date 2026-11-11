/**
 * Tests système (E2E) — scénarios complets dans un vrai navigateur.
 * Chaque scénario traverse : interface React -> API Spring Boot -> base MySQL.
 */
import { test, expect } from "@playwright/test";
import { ADMIN, PRESIDENT, API, uid, shot, loginUI, newMember, adminHeaders, sessionAs } from "./helpers";

test.describe("TS-01 Authentification", () => {
  test("connexion administrateur -> tableau de bord personnalisé", async ({ page }, ti) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await shot(page, ti, "TS01-1-login");
    await loginUI(page, ADMIN);
    await expect(page.getByText("Bienvenue, Admin ENICarthage")).toBeVisible();
    await shot(page, ti, "TS01-2-dashboard-admin");
  });

  test("mot de passe erroné -> message d'erreur visible sur la page de connexion", async ({ page }, ti) => {
    await page.goto("/login");
    await page.getByPlaceholder("ton@enicar.tn").fill(ADMIN.email);
    await page.getByPlaceholder("••••••").fill("mauvais");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await page.waitForTimeout(1500);
    await shot(page, ti, "TS01-3-mauvais-mdp");
    await expect(page.getByText("Email ou mot de passe incorrect")).toBeVisible();
  });

  test("accès direct à /reservations sans session -> redirection vers /login", async ({ page }) => {
    await page.goto("/reservations");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("TS-02 Inscription", () => {
  test("inscription -> tableau de bord -> déconnexion -> reconnexion", async ({ page }, ti) => {
    const email = `amira${uid()}@enicar.tn`;
    await page.goto("/register");
    await page.getByPlaceholder("Prénom Nom").fill("Amira Ben Salah");
    await page.getByPlaceholder("prenom@enicar.tn").fill(email);
    await page.getByPlaceholder("min. 6 caractères").fill("secret1");
    await shot(page, ti, "TS02-1-inscription");
    await page.getByRole("button", { name: /s'inscrire/i }).click();
    await expect(page.getByText("Bienvenue, Amira Ben Salah")).toBeVisible();
    await page.locator("aside").getByRole("button", { name: "✕" }).click();
    await expect(page).toHaveURL(/\/login/);
    await loginUI(page, { email, password: "secret1" });
    await expect(page.locator("aside").getByText("CLUB_MEMBER")).toBeVisible();
  });
});

test.describe("TS-03 Clubs", () => {
  test("l'administrateur crée un club -> le président créé peut se connecter", async ({ page }, ti) => {
    const name = `Club Robotique ${uid()}`;
    const email = `sami${uid()}@enicar.tn`;
    await loginUI(page, ADMIN);
    await page.getByRole("link", { name: /Clubs/ }).click();
    await page.getByRole("button", { name: /nouveau club/i }).click();
    await page.getByPlaceholder("Ex: Club Robotique").fill(name);
    await page.getByPlaceholder("Description du club...").fill("Conception de robots");
    await page.getByPlaceholder("Ex: Sami Ben Ali").fill("Sami Ben Ali");
    await page.getByPlaceholder("Ex: sami@enicar.tn").fill(email);
    await page.getByPlaceholder("••••••••").fill("secret1");
    await shot(page, ti, "TS03-1-nouveau-club");
    await page.getByRole("button", { name: "Créer" }).click();
    await expect(page.getByText(name)).toBeVisible();
    await shot(page, ti, "TS03-2-club-cree");
    await page.locator("aside").getByRole("button", { name: "✕" }).click();
    await loginUI(page, { email, password: "secret1" });
    await expect(page.locator("aside").getByText("CLUB_PRESIDENT")).toBeVisible();
  });
});

test.describe("TS-04 Événements", () => {
  test("le président crée un événement -> visible avec le statut PENDING", async ({ page }, ti) => {
    const title = `Atelier Arduino ${uid()}`;
    await loginUI(page, PRESIDENT);
    await page.getByRole("link", { name: /Événements/ }).click();
    await page.getByRole("button", { name: /nouvel événement/i }).click();
    const inputs = page.locator(".fixed input");
    await inputs.nth(0).fill(title);
    await inputs.nth(1).fill("Amphi A");
    await inputs.nth(2).fill("2031-03-15");
    await inputs.nth(3).fill("60");
    await shot(page, ti, "TS04-1-nouvel-evenement");
    await page.getByRole("button", { name: "Créer" }).click();
    const card = page.locator("div", { has: page.getByRole("heading", { name: title }) }).last();
    await expect(card).toBeVisible();
    await expect(card.getByText("PENDING")).toBeVisible();
    await shot(page, ti, "TS04-2-evenement-cree");
  });
});

test.describe("TS-05 Réservations", () => {
  test("un membre réserve une salle -> l'administrateur l'approuve", async ({ page, request }, ti) => {
    const room = await (await request.post(`${API}/rooms`, { data: { name: `Salle TS05 ${uid()}`, capacity: 30, type: "SALLE" }, headers: await adminHeaders(request) })).json();
    const member = await newMember(request);
    await loginUI(page, member);
    await page.getByRole("link", { name: /Réservations/ }).click();
    await page.getByRole("button", { name: /nouvelle réservation/i }).click();
    await page.getByPlaceholder("Ex: 1").fill(String(room.id));
    await page.locator(".fixed input[type=date]").fill("2031-04-20");
    await shot(page, ti, "TS05-1-nouvelle-reservation");
    await page.getByRole("button", { name: "Réserver" }).click();
    const row = page.locator("tr", { hasText: `ID: ${room.id}` }).last();
    await expect(row.getByText("PENDING")).toBeVisible();
    await page.locator("aside").getByRole("button", { name: "✕" }).click();
    await loginUI(page, ADMIN);
    await page.getByRole("link", { name: /Réservations/ }).click();
    const adminRow = page.locator("tr", { hasText: `ID: ${room.id}` }).last();
    await adminRow.getByRole("button", { name: "Approuver" }).click();
    await expect(adminRow.getByText("APPROVED")).toBeVisible();
    await shot(page, ti, "TS05-2-reservation-approuvee");
  });
});

test.describe("TS-06 Tableau de bord", () => {
  test("le nombre de clubs affiché est celui de la base de données", async ({ page, request }, ti) => {
    const clubs = await (await request.get(`${API}/clubs`)).json();
    await loginUI(page, ADMIN);
    await shot(page, ti, "TS06-dashboard");
    const card = page.locator("div.grid > div", { hasText: "Clubs actifs" }).first();
    await expect(card).toContainText(String(clubs.length));
  });
});

test.describe("TS-07 Affichage sur smartphone (360 × 800)", () => {
  test.use({ viewport: { width: 360, height: 800 } });
  for (const path of ["/login", "/dashboard", "/reservations"]) {
    test(`${path} : pas de défilement horizontal et contenu lisible (≥ 80 % de la largeur)`, async ({ page, request }, ti) => {
      if (path !== "/login") await sessionAs(page, request, ADMIN);
      await page.goto(path);
      await page.waitForTimeout(800);
      await shot(page, ti, `TS07-mobile${path.replace("/", "-")}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      // critère renforcé après revue des captures : la zone de contenu doit rester lisible
      const content = path === "/login" ? page.locator("form") : page.locator("main");
      const box = await content.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(360 * 0.8 - 32);
    });
  }
});
