import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../src/context/AuthContext";
import api from "../../src/api/axios";

export const USERS = {
  admin: { id: 1, fullName: "Admin ENICarthage", email: "admin@enicar.tn", role: "ADMINISTRATOR" },
  president: { id: 2, fullName: "Ahmed Ben Ali", email: "ahmed@enicar.tn", role: "CLUB_PRESIDENT" },
  member: { id: 3, fullName: "Sarra Mansour", email: "sarra@enicar.tn", role: "CLUB_MEMBER" },
};

/** Données renvoyées par l'API simulée (mêmes valeurs que le DataLoader du backend) */
export const API_DATA = {
  "/clubs": [{ id: 1, name: "Club IEEE", description: "Électronique & informatique", presidentId: 2, members: [1, 2] }],
  "/events": [{ id: 1, title: "Hackathon IEEE 2025", clubId: 1, date: "2025-05-10", status: "APPROVED", room: "Amphi A", attendees: 80 }],
  "/rooms": [{ id: 1, name: "Amphi A", capacity: 200, type: "AMPHI" }],
  "/equipment": [
    { id: 1, name: "Projecteur Epson", type: "VISUEL", status: "AVAILABLE" },
    { id: 2, name: "Microphone Sans Fil", type: "AUDIO", status: "IN_USE" },
  ],
  "/reservations": [
    { id: 1, clubId: 1, resourceType: "ROOM", resourceId: 1, date: "2025-05-10", status: "APPROVED" },
    { id: 2, clubId: 1, resourceType: "EQUIPMENT", resourceId: 1, date: "2025-05-12", status: "PENDING" },
  ],
};

/** Configure l'API simulée : GET renvoie API_DATA, POST/PUT renvoient l'objet reçu avec un id */
export function mockApi(overrides = {}) {
  const data = { ...API_DATA, ...overrides };
  api.get.mockImplementation((url) => Promise.resolve({ data: JSON.parse(JSON.stringify(data[url] ?? [])) }));
  api.post.mockImplementation((url, body) => Promise.resolve({ data: { id: 100, ...body } }));
  api.put.mockImplementation((url, body) => Promise.resolve({ data: { id: Number(url.split("/")[2]), ...body } }));
  api.delete.mockResolvedValue({ data: null });
}

/** Affiche une page protégée avec un utilisateur connecté */
export function renderAs(role, element, path = "/page", extraRoutes = {}) {
  if (role) localStorage.setItem("user", JSON.stringify(USERS[role]));
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={element} />
          <Route path="/login" element={<p>PAGE LOGIN</p>} />
          {Object.entries(extraRoutes).map(([p, e]) => (
            <Route key={p} path={p} element={e} />
          ))}
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}
