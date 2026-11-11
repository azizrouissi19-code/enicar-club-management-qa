/**
 * TU-03 — Validation des formulaires (EF-05 à EF-09, ENF-04)
 * Techniques : partitions d'équivalence et valeurs limites sur les champs obligatoires.
 */
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClubsPage from "../../src/pages/ClubsPage";
import EventsPage from "../../src/pages/EventsPage";
import RoomsPage from "../../src/pages/RoomsPage";
import ReservationsPage from "../../src/pages/ReservationsPage";
import api from "../../src/api/axios";
import { mockApi, renderAs } from "./helpers";

jest.mock("../../src/api/axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

beforeEach(() => mockApi());

describe("TU-03 Formulaire « Nouveau club » (administrateur)", () => {
  async function open() {
    renderAs("admin", <ClubsPage />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /nouveau club/i }));
    return user;
  }
  const fields = { nom: "Ex: Club Robotique", president: "Ex: Sami Ben Ali", email: "Ex: sami@enicar.tn", mdp: "••••••••" };

  test.each(Object.keys(fields))("champ obligatoire « %s » manquant : bouton Créer désactivé", async (missing) => {
    const user = await open();
    for (const [k, ph] of Object.entries(fields)) if (k !== missing) await user.type(screen.getByPlaceholderText(ph), "valeur");
    expect(screen.getByRole("button", { name: "Créer" })).toBeDisabled();
  });

  test("champ composé uniquement d'espaces : bouton désactivé", async () => {
    const user = await open();
    for (const [k, ph] of Object.entries(fields)) await user.type(screen.getByPlaceholderText(ph), k === "nom" ? "   " : "x");
    expect(screen.getByRole("button", { name: "Créer" })).toBeDisabled();
  });

  test("formulaire complet : POST /clubs avec les données du président, club affiché", async () => {
    const user = await open();
    await user.type(screen.getByPlaceholderText(fields.nom), "Club Robotique");
    await user.type(screen.getByPlaceholderText(fields.president), "Sami Ben Ali");
    await user.type(screen.getByPlaceholderText(fields.email), "sami@enicar.tn");
    await user.type(screen.getByPlaceholderText(fields.mdp), "secret1");
    await user.click(screen.getByRole("button", { name: "Créer" }));
    expect(api.post).toHaveBeenCalledWith("/clubs", expect.objectContaining({ name: "Club Robotique", presidentEmail: "sami@enicar.tn" }));
    expect(await screen.findByText("Club Robotique")).toBeInTheDocument();
  });

  test("échec de l'API (e-mail déjà utilisé) : un message d'erreur est affiché à l'utilisateur", async () => {
    api.post.mockRejectedValue({ response: { status: 500 } });
    jest.spyOn(console, "error").mockImplementation(() => {});
    const user = await open();
    await user.type(screen.getByPlaceholderText(fields.nom), "Club X");
    await user.type(screen.getByPlaceholderText(fields.president), "Ahmed");
    await user.type(screen.getByPlaceholderText(fields.email), "ahmed@enicar.tn");
    await user.type(screen.getByPlaceholderText(fields.mdp), "x");
    await user.click(screen.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});

describe("TU-03 Formulaire « Nouvel événement »", () => {
  async function open() {
    renderAs("president", <EventsPage />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /nouvel événement/i }));
    return user;
  }
  const inputs = () => document.querySelectorAll(".fixed input");

  test("titre, salle et date vides : bouton Créer désactivé", async () => {
    await open();
    expect(screen.getByRole("button", { name: "Créer" })).toBeDisabled();
  });

  test("participants non numériques -> 0 envoyé", async () => {
    const user = await open();
    const [title, room, date, attendees] = inputs();
    await user.type(title, "Atelier");
    await user.type(room, "Amphi A");
    await user.type(date, "2031-01-15");
    await user.type(attendees, "e");
    await user.click(screen.getByRole("button", { name: "Créer" }));
    expect(api.post).toHaveBeenCalledWith("/events", expect.objectContaining({ attendees: 0, status: "PENDING" }));
  });

  test("le club de l'événement est celui du président connecté (pas une valeur fixe)", async () => {
    // président (id 50) d'un club n°7 : l'événement ne doit pas être rattaché au club n°1
    mockApi({ "/clubs": [{ id: 7, name: "Club Robotique", presidentId: 50, members: [50] }] });
    localStorage.setItem("user", JSON.stringify({ id: 50, fullName: "Sami", role: "CLUB_PRESIDENT" }));
    renderAs(null, <EventsPage />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /nouvel événement/i }));
    const [title, room, date] = inputs();
    await user.type(title, "Atelier");
    await user.type(room, "Amphi A");
    await user.type(date, "2031-01-15");
    await user.click(screen.getByRole("button", { name: "Créer" }));
    expect(api.post).toHaveBeenCalledWith("/events", expect.objectContaining({ clubId: 7 }));
  });
});

describe("TU-03 Formulaires « Salle » et « Réservation »", () => {
  test("salle : nom et capacité obligatoires", async () => {
    renderAs("admin", <RoomsPage />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /nouvelle salle/i }));
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeDisabled();
    await user.type(screen.getByPlaceholderText("Ex: Amphi B"), "Labo 2");
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeDisabled();
    await user.type(screen.getByPlaceholderText("Ex: 50"), "30");
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeEnabled();
  });

  test("réservation : identifiant de ressource et date obligatoires", async () => {
    renderAs("member", <ReservationsPage />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /nouvelle réservation/i }));
    expect(screen.getByRole("button", { name: "Réserver" })).toBeDisabled();
    await user.type(screen.getByPlaceholderText("Ex: 1"), "1");
    expect(screen.getByRole("button", { name: "Réserver" })).toBeDisabled();
  });
});
