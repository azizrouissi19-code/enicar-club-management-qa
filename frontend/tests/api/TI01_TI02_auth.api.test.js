/**
 * TI-01 — API d'authentification (EF-01, ENF-01, ENF-02)
 * TI-02 — API d'inscription : validation des entrées (EF-02)
 * Techniques : partitions d'équivalence, valeurs limites, test de robustesse.
 */
import { post, uid, ADMIN, PRESIDENT } from "./client";

describe("TI-01 Connexion — POST /api/auth/login", () => {
  test.each([
    ["administrateur", ADMIN, "ADMINISTRATOR"],
    ["président", PRESIDENT, "CLUB_PRESIDENT"],
  ])("classe valide (%s) : 200, jeton et profil renvoyés", async (_p, cred, role) => {
    const r = await post("/auth/login", cred);
    expect(r.status).toBe(200);
    expect(r.data.token).toBeTruthy();
    expect(r.data.user.role).toBe(role);
  });

  test("le hash du mot de passe n'est jamais renvoyé au client", async () => {
    const r = await post("/auth/login", ADMIN);
    expect(r.status).toBe(200);
    expect(r.data.user).not.toHaveProperty("password");
  });

  test.each([
    ["mot de passe erroné", { email: ADMIN.email, password: "faux" }],
    ["e-mail inconnu", { email: "personne@enicar.tn", password: "admin123" }],
    ["mot de passe vide", { email: ADMIN.email, password: "" }],
  ])("classe invalide (%s) : 401", async (_c, body) => {
    expect((await post("/auth/login", body)).status).toBe(401);
  });

  test.each([
    ["corps vide {}", {}],
    ["mot de passe absent", { email: ADMIN.email }],
    ["e-mail absent", { password: "admin123" }],
  ])("requête incomplète (%s) : 400 ou 401, jamais 500", async (_c, body) => {
    const r = await post("/auth/login", body);
    expect([400, 401]).toContain(r.status);
  });

  test("JSON mal formé : 400, jamais 500", async () => {
    const r = await post("/auth/login", "{email:");
    expect(r.status).toBe(400);
  });
});

describe("TI-02 Inscription — POST /api/auth/register", () => {
  test("inscription valide : 200, rôle CLUB_MEMBER, puis connexion possible", async () => {
    const email = `etu${uid()}@enicar.tn`;
    const r = await post("/auth/register", { fullName: "Etudiant Test", email, password: "secret1" });
    expect(r.status).toBe(200);
    expect(r.data.user.role).toBe("CLUB_MEMBER");
    expect((await post("/auth/login", { email, password: "secret1" })).status).toBe(200);
  });

  test("e-mail déjà utilisé : 400", async () => {
    const r = await post("/auth/register", { fullName: "Doublon", email: ADMIN.email, password: "secret1" });
    expect(r.status).toBe(400);
  });

  test("le rôle envoyé par le client est ignoré (pas d'auto-promotion)", async () => {
    const email = `pirate${uid()}@enicar.tn`;
    const r = await post("/auth/register", { fullName: "P", email, password: "secret1", role: "ADMINISTRATOR" });
    expect(r.data.user.role).toBe("CLUB_MEMBER");
  });

  test.each([
    ["adresse non institutionnelle", { fullName: "A", email: `a${uid()}@gmail.com`, password: "secret1" }],
    ["mot de passe de 5 caractères (limite - 1)", { fullName: "A", email: `a${uid()}@enicar.tn`, password: "abcde" }],
    ["nom vide", { fullName: "", email: `a${uid()}@enicar.tn`, password: "secret1" }],
    ["e-mail mal formé", { fullName: "A", email: "pas-un-email", password: "secret1" }],
  ])("entrée invalide (%s) : 400", async (_c, body) => {
    expect((await post("/auth/register", body)).status).toBe(400);
  });

  test("mot de passe de 6 caractères (limite) : accepté", async () => {
    const r = await post("/auth/register", { fullName: "B", email: `b${uid()}@enicar.tn`, password: "abcdef" });
    expect(r.status).toBe(200);
  });

  test("corps vide : 400, jamais 500", async () => {
    expect((await post("/auth/register", {})).status).toBe(400);
  });
});
