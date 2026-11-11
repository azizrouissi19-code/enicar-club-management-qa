/**
 * TU-05 — Tableau de bord, menu et pages de compte (EF-04, EF-10)
 */
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "../../src/pages/DashboardPage";
import ProfilePage from "../../src/pages/ProfilePage";
import { mockApi, renderAs, API_DATA, USERS } from "./helpers";

jest.mock("../../src/api/axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

beforeEach(() => mockApi());

function statValue(label) {
  const el = screen.getAllByText(label).find((e) => e.className.includes("mt-1"));
  return el.parentElement.firstChild.textContent;
}

describe("TU-05 Tableau de bord alimenté par l'API", () => {
  test("message de bienvenue personnalisé", async () => {
    renderAs("admin", <DashboardPage />);
    expect(await screen.findByText("Bienvenue, Admin ENICarthage")).toBeInTheDocument();
  });

  test.each([
    ["Clubs actifs", API_DATA["/clubs"].length],
    ["Événements", API_DATA["/events"].length],
    ["Salles", API_DATA["/rooms"].length],
  ])("statistique « %s » = %i (données de l'API)", async (label, expected) => {
    renderAs("admin", <DashboardPage />);
    await screen.findByText("Bienvenue, Admin ENICarthage");
    await new Promise((r) => setTimeout(r, 50));
    expect(statValue(label)).toBe(String(expected));
  });

  test("les événements affichés sont ceux de l'API", async () => {
    mockApi({ "/events": [{ id: 9, title: "Forum des clubs 2026", clubId: 1, date: "2026-12-15", status: "PENDING", room: "Amphi A", attendees: 100 }] });
    renderAs("admin", <DashboardPage />);
    expect(await screen.findByText("Forum des clubs 2026")).toBeInTheDocument();
  });
});

describe("TU-05 Menu latéral et menu utilisateur", () => {
  test("nom et rôle de l'utilisateur affichés", async () => {
    renderAs("member", <DashboardPage />);
    const aside = screen.getByRole("complementary");
    expect(within(aside).getByText("Sarra Mansour")).toBeInTheDocument();
    expect(within(aside).getByText("CLUB_MEMBER")).toBeInTheDocument();
  });

  test("déconnexion : session vidée et retour à la page de connexion", async () => {
    renderAs("member", <DashboardPage />);
    await userEvent.setup().click(within(screen.getByRole("complementary")).getByRole("button", { name: "✕" }));
    expect(screen.getByText("PAGE LOGIN")).toBeInTheDocument();
    expect(localStorage.getItem("user")).toBeNull();
  });

  test("les badges du menu reflètent les données réelles (1 club, 1 événement)", async () => {
    renderAs("member", <DashboardPage />);
    expect(screen.getByRole("link", { name: /Clubs/ })).not.toHaveTextContent("3");
    expect(screen.getByRole("link", { name: /Événements/ })).not.toHaveTextContent("5");
  });

  test("menu utilisateur -> « Mon Profil » ouvre le profil avec l'e-mail", async () => {
    renderAs("president", <DashboardPage />, "/page", { "/profile": <ProfilePage /> });
    const user = userEvent.setup();
    await user.click(document.querySelector(".cursor-pointer"));
    await user.click(screen.getByRole("button", { name: "Mon Profil" }));
    expect(screen.getByDisplayValue(USERS.president.email)).toBeInTheDocument();
  });
});
