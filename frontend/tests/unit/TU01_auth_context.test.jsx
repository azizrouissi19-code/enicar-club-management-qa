/**
 * TU-01 — Contexte d'authentification (EF-01, EF-02, ENF-01)
 * Composant isolé : l'API est simulée (jest.mock). Techniques : partitions d'équivalence.
 */
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../src/context/AuthContext";
import api from "../../src/api/axios";

jest.mock("../../src/api/axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
const setup = () => renderHook(() => useAuth(), { wrapper });

// réponse réelle du backend (v1.0.0) : l'objet user contient le hash du mot de passe
const serverUser = { id: 2, fullName: "Ahmed Ben Ali", email: "ahmed@enicar.tn", role: "CLUB_PRESIDENT", password: "$2a$10$hash" };

describe("TU-01 Connexion", () => {
  test("succès : utilisateur et jeton enregistrés, appel POST /auth/login", async () => {
    api.post.mockResolvedValue({ data: { token: "tok-2", user: serverUser } });
    const { result } = setup();
    await act(() => result.current.login("ahmed@enicar.tn", "123456"));
    expect(api.post).toHaveBeenCalledWith("/auth/login", { email: "ahmed@enicar.tn", password: "123456" });
    expect(result.current.user.role).toBe("CLUB_PRESIDENT");
    expect(localStorage.getItem("token")).toBe("tok-2");
  });

  test("le hash du mot de passe n'est jamais conservé dans le navigateur", async () => {
    api.post.mockResolvedValue({ data: { token: "tok-2", user: serverUser } });
    const { result } = setup();
    await act(() => result.current.login("ahmed@enicar.tn", "123456"));
    expect(result.current.user).not.toHaveProperty("password");
    expect(localStorage.getItem("user")).not.toContain("$2a$");
  });

  test.each([
    ["identifiants refusés (401)", "Email ou mot de passe incorrect", { response: { status: 401 } }],
    ["serveur injoignable", "Erreur de connexion au serveur", new Error("Network Error")],
    ["erreur serveur (500)", "Erreur de connexion au serveur", { response: { status: 500 } }],
  ])("échec (%s) : message « %s » et aucune session", async (_c, message, error) => {
    api.post.mockRejectedValue(error);
    const { result } = setup();
    await expect(result.current.login("x@enicar.tn", "y")).rejects.toThrow(message);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  test("déconnexion : session supprimée", async () => {
    api.post.mockResolvedValue({ data: { token: "tok-2", user: serverUser } });
    const { result } = setup();
    await act(() => result.current.login("ahmed@enicar.tn", "123456"));
    act(() => result.current.logout());
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  test("session restaurée depuis le stockage au rechargement de la page", () => {
    localStorage.setItem("user", JSON.stringify({ id: 1, fullName: "Admin", role: "ADMINISTRATOR" }));
    expect(setup().result.current.user.fullName).toBe("Admin");
  });
});

describe("TU-01 Inscription", () => {
  test("succès : POST /auth/register puis session ouverte", async () => {
    api.post.mockResolvedValue({ data: { token: "tok-9", user: { id: 9, fullName: "Amira", email: "amira@enicar.tn", role: "CLUB_MEMBER" } } });
    const { result } = setup();
    await act(() => result.current.register("Amira", "amira@enicar.tn", "secret1"));
    expect(api.post).toHaveBeenCalledWith("/auth/register", { fullName: "Amira", email: "amira@enicar.tn", password: "secret1" });
    expect(result.current.user.role).toBe("CLUB_MEMBER");
  });

  test("échec : message d'erreur générique", async () => {
    api.post.mockRejectedValue({ response: { status: 400 } });
    const { result } = setup();
    await expect(result.current.register("A", "admin@enicar.tn", "secret1")).rejects.toThrow(/déjà utilisé/);
  });
});
