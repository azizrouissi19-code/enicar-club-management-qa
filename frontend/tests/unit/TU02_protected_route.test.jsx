/**
 * TU-02 — Routes protégées (EF-03)
 * Technique : table de décision (connecté ? × rôles exigés × rôle de l'utilisateur).
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../src/context/AuthContext";
import ProtectedRoute from "../../src/components/ProtectedRoute";
import { USERS } from "./helpers";

jest.mock("../../src/api/axios", () => ({ __esModule: true, default: {} }));

function renderAt(user, roles) {
  if (user) localStorage.setItem("user", JSON.stringify(user));
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/zone"]}>
        <Routes>
          <Route path="/login" element={<p>PAGE LOGIN</p>} />
          <Route path="/dashboard" element={<p>PAGE DASHBOARD</p>} />
          <Route path="/zone" element={<ProtectedRoute roles={roles}><p>PAGE PROTEGEE</p></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("TU-02 ProtectedRoute — table de décision", () => {
  test.each([
    ["R1 non connecté, sans rôle exigé", "PAGE LOGIN", null, undefined],
    ["R2 non connecté, rôle exigé", "PAGE LOGIN", null, ["ADMINISTRATOR"]],
    ["R3 connecté, sans rôle exigé", "PAGE PROTEGEE", USERS.member, undefined],
    ["R4 connecté, rôle autorisé", "PAGE PROTEGEE", USERS.admin, ["ADMINISTRATOR"]],
    ["R5 connecté, rôle non autorisé", "PAGE DASHBOARD", USERS.member, ["ADMINISTRATOR"]],
    ["R6 connecté, un des rôles autorisés", "PAGE PROTEGEE", USERS.president, ["ADMINISTRATOR", "CLUB_PRESIDENT"]],
  ])("%s -> %s", (_r, expected, user, roles) => {
    renderAt(user, roles);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
