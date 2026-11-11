/**
 * TU-04 — Interface selon le rôle (EF-03, EF-05 à EF-09)
 * Technique : table de décision rôle × action visible.
 */
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClubsPage from "../../src/pages/ClubsPage";
import EventsPage from "../../src/pages/EventsPage";
import RoomsPage from "../../src/pages/RoomsPage";
import EquipmentPage from "../../src/pages/EquipmentPage";
import ReservationsPage from "../../src/pages/ReservationsPage";
import api from "../../src/api/axios";
import { mockApi, renderAs } from "./helpers";

jest.mock("../../src/api/axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

beforeEach(() => mockApi());

const PAGES = {
  clubs: [<ClubsPage key="c" />, "Club IEEE", /nouveau club/i],
  rooms: [<RoomsPage key="r" />, "Amphi A", /nouvelle salle/i],
  equipment: [<EquipmentPage key="e" />, "Projecteur Epson", /nouvel équipement/i],
  events: [<EventsPage key="v" />, "Hackathon IEEE 2025", /nouvel événement/i],
};

describe("TU-04 Bouton de création selon le rôle", () => {
  test.each([
    // page, rôle, bouton « créer » visible ?
    ["clubs", "admin", true], ["clubs", "president", false], ["clubs", "member", false],
    ["rooms", "admin", true], ["rooms", "member", false],
    ["equipment", "admin", true], ["equipment", "member", false],
    ["events", "president", true], ["events", "admin", true], ["events", "member", false],
  ])("%s / %s -> création visible = %s", async (page, role, visible) => {
    const [element, item, button] = PAGES[page];
    renderAs(role, element);
    await screen.findByText(item);
    expect(Boolean(screen.queryByRole("button", { name: button }))).toBe(visible);
  });
});

describe("TU-04 Suppression selon le rôle", () => {
  const deleteButtons = () => screen.queryAllByRole("button", { name: "✕" }).filter((b) => !b.closest("aside"));

  test.each([
    ["clubs", "admin", true], ["clubs", "member", false],
    ["events", "president", true], ["events", "member", false],
  ])("%s / %s -> suppression possible = %s", async (page, role, allowed) => {
    const [element, item] = PAGES[page];
    renderAs(role, element);
    await screen.findByText(item);
    expect(deleteButtons().length > 0).toBe(allowed);
  });

  test("administrateur : suppression d'un club -> DELETE /clubs/1 et retrait de la liste", async () => {
    renderAs("admin", <ClubsPage />);
    await screen.findByText("Club IEEE");
    await userEvent.setup().click(deleteButtons()[0]);
    expect(api.delete).toHaveBeenCalledWith("/clubs/1");
    expect(screen.queryByText("Club IEEE")).not.toBeInTheDocument();
  });
});

describe("TU-04 Réservations : validation par l'administrateur", () => {
  test("administrateur : boutons Approuver / Rejeter uniquement sur la réservation PENDING", async () => {
    renderAs("admin", <ReservationsPage />);
    await screen.findByText("#2");
    expect(screen.getAllByRole("button", { name: "Approuver" })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /nouvelle réservation/i })).not.toBeInTheDocument();
  });

  test("approuver : PUT /reservations/2/status et statut mis à jour", async () => {
    renderAs("admin", <ReservationsPage />);
    const row = (await screen.findByText("#2")).closest("tr");
    await userEvent.setup().click(within(row).getByRole("button", { name: "Approuver" }));
    expect(api.put).toHaveBeenCalledWith("/reservations/2/status", { status: "APPROVED" });
    expect(await within(row).findByText("APPROVED")).toBeInTheDocument();
  });

  test("membre : aucun bouton de validation", async () => {
    renderAs("member", <ReservationsPage />);
    await screen.findByText("#2");
    expect(screen.queryByRole("button", { name: "Approuver" })).not.toBeInTheDocument();
  });

  test("aucune réservation : message « Aucune réservation trouvée. »", async () => {
    mockApi({ "/reservations": [] });
    renderAs("member", <ReservationsPage />);
    expect(await screen.findByText("Aucune réservation trouvée.")).toBeInTheDocument();
  });
});
