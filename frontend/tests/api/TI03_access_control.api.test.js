/**
 * TI-03 — Contrôle d'accès de l'API (EF-03, ENF-02)
 * Technique : table de décision (sans jeton / jeton falsifié / membre / administrateur) × action réservée.
 * Chaque test crée sa propre ressource avant d'essayer de la supprimer.
 */
import { get, post, put, del, uid, login, ADMIN } from "./client";

async function newRoom() {
  const r = await post("/rooms", { name: `Salle-TI03-${uid()}`, capacity: 30, type: "SALLE" }, await login(ADMIN.email, ADMIN.password));
  return r.data.id;
}

async function memberHeaders() {
  const email = `membre${uid()}@enicar.tn`;
  await post("/auth/register", { fullName: "Membre TI03", email, password: "secret1" });
  return login(email, "secret1");
}

describe("TI-03 Contrôle d'accès de l'API", () => {
  test("la consultation des clubs est possible", async () => {
    expect((await get("/clubs")).status).toBe(200);
  });

  test("sans jeton : suppression d'une salle refusée (401)", async () => {
    const id = await newRoom();
    expect((await del(`/rooms/${id}`)).status).toBe(401);
  });

  test("jeton falsifié : création d'une salle refusée (401)", async () => {
    const r = await post("/rooms", { name: "Fausse", capacity: 10, type: "SALLE" }, { Authorization: "Bearer dummy-jwt-token-1" });
    expect(r.status).toBe(401);
  });

  test("membre : création d'une salle refusée (403)", async () => {
    const r = await post("/rooms", { name: `Salle-membre-${uid()}`, capacity: 10, type: "SALLE" }, await memberHeaders());
    expect(r.status).toBe(403);
  });

  test("membre : validation d'une réservation refusée (403)", async () => {
    const admin = await login(ADMIN.email, ADMIN.password);
    const res = await post("/reservations", { clubId: 1, resourceType: "ROOM", resourceId: 1, date: `2030-01-${String((Date.now() % 27) + 1).padStart(2, "0")}`, status: "PENDING" }, admin);
    const r = await put(`/reservations/${res.data.id}/status`, { status: "APPROVED" }, await memberHeaders());
    expect(r.status).toBe(403);
  });

  test("sans jeton : création d’un club (et d’un compte président) refusée (401)", async () => {
    const r = await post("/clubs", { name: `Club-${uid()}`, description: "x", presidentName: "P", presidentEmail: `p${uid()}@enicar.tn`, presidentPassword: "secret1" });
    expect(r.status).toBe(401);
  });
});
