import { expect } from "@playwright/test";

export const ADMIN = { email: "admin@enicar.tn", password: "admin123" };
export const PRESIDENT = { email: "ahmed@enicar.tn", password: "123456" };
export const uid = () => `${Date.now()}${Math.floor(Math.random() * 100)}`;
export const API = "http://localhost:9090/api";

/** Capture d'écran nommée (preuve d'exécution), uniquement pour le navigateur Edge */
export async function shot(page, testInfo, name) {
  if (testInfo.project.name !== "edge") return;
  await page.screenshot({ path: `../qa/results/screenshots/${name}.png` });
}

export async function loginUI(page, { email, password }) {
  await page.goto("/login");
  await page.getByPlaceholder("ton@enicar.tn").fill(email);
  await page.getByPlaceholder("••••••").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

/** En-tête d'authentification administrateur (préparation des données ; nécessaire depuis la v1.0.1) */
export async function adminHeaders(request) {
  const r = await request.post(`${API}/auth/login`, { data: ADMIN });
  return { Authorization: `Bearer ${(await r.json()).token}` };
}

/** Ouvre une vraie session dans le navigateur sans passer par le formulaire */
export async function sessionAs(page, request, creds) {
  const r = await (await request.post(`${API}/auth/login`, { data: creds })).json();
  await page.goto("/login");
  await page.evaluate(([token, user]) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }, [r.token, r.user]);
}

/** Crée un compte membre directement par l'API (préparation des données de test) */
export async function newMember(request) {
  const email = `membre${uid()}@enicar.tn`;
  await request.post(`${API}/auth/register`, { data: { fullName: "Youssef Trabelsi", email, password: "secret1" } });
  return { email, password: "secret1" };
}
