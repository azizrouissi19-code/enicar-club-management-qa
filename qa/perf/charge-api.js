// TNF-01 — Test de charge de l'API (ENF-03 performance, ENF-04 fiabilité)
// Profil : montée à 50 utilisateurs virtuels en 15 s, palier 45 s, descente 10 s
import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.API_URL || "http://host.docker.internal:9090/api";

export const options = {
  stages: [
    { duration: "15s", target: 50 },
    { duration: "45s", target: 50 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // ENF-03
    http_req_failed: ["rate<0.01"], // ENF-04
  },
};

export default function () {
  const login = http.post(`${BASE}/auth/login`, JSON.stringify({ email: "ahmed@enicar.tn", password: "123456" }), {
    headers: { "Content-Type": "application/json" },
    tags: { name: "login" },
  });
  check(login, { "login 200": (r) => r.status === 200 });
  // depuis la v1.0.1, /reservations exige le jeton de session
  const auth = { Authorization: `Bearer ${login.json("token")}` };
  for (const res of ["clubs", "events", "rooms", "equipment", "reservations"]) {
    const r = http.get(`${BASE}/${res}`, { tags: { name: res }, headers: auth });
    check(r, { [`${res} 200`]: (x) => x.status === 200 });
  }
  sleep(1);
}
