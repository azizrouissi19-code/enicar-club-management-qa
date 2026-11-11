/**
 * TI-04 — Clubs (EF-05)      TI-05 — Événements (EF-06)
 * TI-06 — Réservations (EF-09)  TI-07 — Salles et équipements (EF-07, EF-08)
 * Les tests s'authentifient en administrateur (ou président) pour ne mesurer que les règles métier.
 */
import { get, post, put, del, uid, login, ADMIN, PRESIDENT } from "./client";

let admin;
beforeAll(async () => {
  admin = await login(ADMIN.email, ADMIN.password);
});

const futureDate = () => `2031-${String((Math.floor(Math.random() * 12) + 1)).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`;

async function newRoom(capacity = 40) {
  const r = await post("/rooms", { name: `Salle-${uid()}`, capacity, type: "SALLE" }, admin);
  return r.data;
}

describe("TI-04 Clubs — /api/clubs", () => {
  test("création d'un club : le compte du président est créé et peut se connecter", async () => {
    const email = `pres${uid()}@enicar.tn`;
    const r = await post("/clubs", { name: `Club Robotique ${uid()}`, description: "Robots", presidentName: "Sami", presidentEmail: email, presidentPassword: "secret1" }, admin);
    expect(r.status).toBe(200);
    const l = await post("/auth/login", { email, password: "secret1" });
    expect(l.data.user.role).toBe("CLUB_PRESIDENT");
    expect(r.data.presidentId).toBe(l.data.user.id);
  });

  test("président déjà inscrit (e-mail existant) : 409/400, sans erreur 500", async () => {
    const r = await post("/clubs", { name: `Club ${uid()}`, description: "x", presidentName: "Ahmed", presidentEmail: PRESIDENT.email, presidentPassword: "x" }, admin);
    expect([400, 409]).toContain(r.status);
  });

  test("nom de club vide : 400", async () => {
    const r = await post("/clubs", { name: "", description: "x", presidentName: "P", presidentEmail: `p${uid()}@enicar.tn`, presidentPassword: "secret1" }, admin);
    expect(r.status).toBe(400);
  });

  test("suppression : le club disparaît de la liste", async () => {
    const c = await post("/clubs", { name: `Club Temp ${uid()}`, description: "x", presidentName: "T", presidentEmail: `t${uid()}@enicar.tn`, presidentPassword: "secret1" }, admin);
    await del(`/clubs/${c.data.id}`, admin);
    expect((await get("/clubs")).data.map((x) => x.id)).not.toContain(c.data.id);
  });
});

describe("TI-05 Événements — /api/events", () => {
  test("création valide : enregistrée avec le statut PENDING", async () => {
    const room = await newRoom(100);
    const r = await post("/events", { title: `Atelier ${uid()}`, clubId: 1, date: futureDate(), status: "PENDING", room: room.name, attendees: 50 }, admin);
    expect(r.status).toBe(200);
    expect((await get("/events")).data.find((e) => e.id === r.data.id).status).toBe("PENDING");
  });

  test.each([
    ["participants > capacité de la salle (41 pour 40)", 41],
    ["participants négatifs", -5],
  ])("refus : %s -> 400", async (_c, attendees) => {
    const room = await newRoom(40);
    const r = await post("/events", { title: `Evt ${uid()}`, clubId: 1, date: futureDate(), status: "PENDING", room: room.name, attendees }, admin);
    expect(r.status).toBe(400);
  });

  test("participants = capacité (40 pour 40, valeur limite) : accepté", async () => {
    const room = await newRoom(40);
    const r = await post("/events", { title: `Evt ${uid()}`, clubId: 1, date: futureDate(), status: "PENDING", room: room.name, attendees: 40 }, admin);
    expect(r.status).toBe(200);
  });

  test.each([
    ["salle inexistante", { room: "Salle fantôme", clubId: 1 }],
    ["club inexistant", { clubId: 999999 }],
    ["date passée", { date: "2020-01-01" }],
  ])("refus : %s -> 400", async (_c, override) => {
    const room = await newRoom(100);
    const r = await post("/events", { title: `Evt ${uid()}`, clubId: 1, date: futureDate(), status: "PENDING", room: room.name, attendees: 10, ...override }, admin);
    expect(r.status).toBe(400);
  });
});

describe("TI-06 Réservations — /api/reservations", () => {
  test("transition PENDING -> APPROVED par l'administrateur", async () => {
    const room = await newRoom();
    const r = await post("/reservations", { clubId: 1, resourceType: "ROOM", resourceId: room.id, date: futureDate(), status: "PENDING" }, admin);
    const u = await put(`/reservations/${r.data.id}/status`, { status: "APPROVED" }, admin);
    expect(u.status).toBe(200);
    expect(u.data.status).toBe("APPROVED");
  });

  test("double réservation de la même salle à la même date : 409", async () => {
    const room = await newRoom();
    const date = futureDate();
    await post("/reservations", { clubId: 1, resourceType: "ROOM", resourceId: room.id, date, status: "PENDING" }, admin);
    const second = await post("/reservations", { clubId: 1, resourceType: "ROOM", resourceId: room.id, date, status: "PENDING" }, admin);
    expect(second.status).toBe(409);
  });

  test("ressource inexistante : 400", async () => {
    const r = await post("/reservations", { clubId: 1, resourceType: "ROOM", resourceId: 999999, date: futureDate(), status: "PENDING" }, admin);
    expect(r.status).toBe(400);
  });

  test("statut inconnu (« FOO ») : 400", async () => {
    const room = await newRoom();
    const r = await post("/reservations", { clubId: 1, resourceType: "ROOM", resourceId: room.id, date: futureDate(), status: "PENDING" }, admin);
    expect((await put(`/reservations/${r.data.id}/status`, { status: "FOO" }, admin)).status).toBe(400);
  });

  test("réservation inexistante : 404, jamais 500", async () => {
    expect((await put("/reservations/999999/status", { status: "APPROVED" }, admin)).status).toBe(404);
  });
});

describe("TI-07 Salles et équipements", () => {
  test("ajout d'une salle valide puis consultation", async () => {
    const room = await newRoom(25);
    expect((await get("/rooms")).data.some((r) => r.id === room.id && r.capacity === 25)).toBe(true);
  });

  test.each([0, -10])("capacité %i : refusée (400)", async (capacity) => {
    const r = await post("/rooms", { name: `Salle-${uid()}`, capacity, type: "SALLE" }, admin);
    expect(r.status).toBe(400);
  });

  test("ajout d'un équipement : statut AVAILABLE", async () => {
    const r = await post("/equipment", { name: `Projecteur ${uid()}`, type: "VISUEL", status: "AVAILABLE" }, admin);
    expect(r.status).toBe(200);
    expect(r.data.status).toBe("AVAILABLE");
  });
});
