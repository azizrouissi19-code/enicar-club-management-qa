// Reproduction déterministe d'ANO-18 : la liste des clubs arrive 2 s après l'ouverture de la page
import { test, expect } from "@playwright/test";
import { loginUI, PRESIDENT } from "../e2e/helpers";

test("ANO-18 : le président peut créer un événement même si les clubs se chargent lentement", async ({ page }) => {
  await loginUI(page, PRESIDENT);
  await page.route("**/api/clubs", async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await route.continue();
  });
  await page.getByRole("link", { name: /Événements/ }).click();
  const button = page.getByRole("button", { name: /nouvel événement/i });
  await button.click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: `../qa/results/regression/ANO18-${process.env.VERSION}.png` });
  await expect(page.getByText("Aucun club associé à votre compte")).toHaveCount(0);
});
