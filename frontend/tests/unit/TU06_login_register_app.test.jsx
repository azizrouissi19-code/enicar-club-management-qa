/**
 * TU-06 — Pages de connexion / inscription, routage de l'application, pages de compte
 * (EF-01, EF-02, EF-10, ENF-04). Techniques : valeurs limites, partitions d'équivalence.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../../src/pages/LoginPage";
import RegisterPage from "../../src/pages/RegisterPage";
import SettingsPage from "../../src/pages/SettingsPage";
import NotificationsPage from "../../src/pages/NotificationsPage";
import App from "../../src/App";
import api from "../../src/api/axios";
import { mockApi, renderAs } from "./helpers";

jest.mock("../../src/api/axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

beforeEach(() => mockApi());

const user = { id: 9, fullName: "Nouvel Etudiant", email: "nouveau@enicar.tn", role: "CLUB_MEMBER" };

describe("TU-06 Page de connexion", () => {
  async function submit(email, password) {
    renderAs(null, <LoginPage />, "/login", { "/dashboard": <p>TABLEAU DE BORD</p> });
    const u = userEvent.setup();
    await u.type(screen.getByPlaceholderText("ton@enicar.tn"), email);
    await u.type(screen.getByPlaceholderText("••••••"), password);
    await u.click(screen.getByRole("button", { name: /se connecter/i }));
  }

  test("succès -> redirection vers le tableau de bord", async () => {
    api.post.mockResolvedValue({ data: { token: "t", user } });
    await submit("nouveau@enicar.tn", "secret1");
    expect(await screen.findByText("TABLEAU DE BORD")).toBeInTheDocument();
  });

  test("échec -> message d'erreur affiché", async () => {
    api.post.mockRejectedValue({ response: { status: 401 } });
    await submit("nouveau@enicar.tn", "faux");
    expect(await screen.findByText("Email ou mot de passe incorrect")).toBeInTheDocument();
  });
});

describe("TU-06 Page d'inscription — valeurs limites du mot de passe", () => {
  async function submit(password) {
    renderAs(null, <RegisterPage />, "/register", { "/dashboard": <p>TABLEAU DE BORD</p> });
    const u = userEvent.setup();
    await u.type(screen.getByPlaceholderText("Prénom Nom"), "Nouvel Etudiant");
    await u.type(screen.getByPlaceholderText("prenom@enicar.tn"), "nouveau@enicar.tn");
    await u.type(screen.getByPlaceholderText("min. 6 caractères"), password);
    await u.click(screen.getByRole("button", { name: /s'inscrire/i }));
  }

  test("5 caractères (limite - 1) : refusé sans appel à l'API", async () => {
    await submit("abcde");
    expect(screen.getByText("Mot de passe trop court (min. 6 caractères)")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  test("6 caractères (limite) : inscription envoyée, tableau de bord", async () => {
    api.post.mockResolvedValue({ data: { token: "t", user } });
    await submit("abcdef");
    expect(await screen.findByText("TABLEAU DE BORD")).toBeInTheDocument();
  });

  test("échec de l'API : message d'erreur", async () => {
    api.post.mockRejectedValue({ response: { status: 400 } });
    await submit("abcdef");
    expect(await screen.findByText(/déjà utilisé/)).toBeInTheDocument();
  });
});

describe("TU-06 Routage de l'application", () => {
  test("la racine redirige vers la connexion", () => {
    window.history.pushState({}, "", "/");
    render(<App />);
    expect(screen.getByRole("heading", { name: "Connexion" })).toBeInTheDocument();
  });

  test.each(["/clubs", "/events", "/rooms", "/equipment", "/reservations", "/profile", "/settings", "/notifications"])(
    "%s : page accessible une fois connecté",
    async (path) => {
      localStorage.setItem("user", JSON.stringify({ id: 1, fullName: "Admin ENICarthage", role: "ADMINISTRATOR" }));
      window.history.pushState({}, "", path);
      render(<App />);
      expect(await screen.findByRole("complementary")).toBeInTheDocument();
    }
  );
});

describe("TU-06 Pages de compte (EF-10)", () => {
  test("paramètres : le bouton « Désactiver mon compte » a un effet (appel API ou confirmation)", async () => {
    window.confirm = jest.fn(() => false);
    renderAs("member", <SettingsPage />);
    await userEvent.setup().click(screen.getByRole("button", { name: /désactiver mon compte/i }));
    expect(window.confirm.mock.calls.length + api.delete.mock.calls.length + api.put.mock.calls.length).toBeGreaterThan(0);
  });

  test("notifications : les notifications proviennent de l'API (pas de données fixes)", async () => {
    renderAs("member", <NotificationsPage />);
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("notification"));
  });
});
