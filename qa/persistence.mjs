// TNF-05 — compte les données de chaque ressource (avec un jeton administrateur)
const API = process.env.API_URL || "http://localhost:9090/api";
const { token } = await (await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@enicar.tn", password: "admin123" }) })).json();
const out = {};
for (const r of ["clubs", "events", "rooms", "equipment", "reservations"]) {
  const list = await (await fetch(`${API}/${r}`, { headers: { Authorization: `Bearer ${token}` } })).json();
  out[r] = list.length;
}
console.log(JSON.stringify(out));
