/**
 * Petit client HTTP pour les tests d'API (fetch natif de Node.js).
 * L'API testée est le backend Spring Boot réel (MySQL), par défaut http://localhost:9090/api
 */
export const BASE = process.env.API_URL || "http://localhost:9090/api";

/** Suffixe unique pour que chaque exécution crée ses propres données */
export const uid = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

export async function call(method, path, body, headers = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* corps non JSON */
  }
  return { status: res.status, data, text };
}

export const get = (p, h) => call("GET", p, undefined, h);
export const post = (p, b, h) => call("POST", p, b, h);
export const put = (p, b, h) => call("PUT", p, b, h);
export const del = (p, h) => call("DELETE", p, undefined, h);

export async function login(email, password) {
  const r = await post("/auth/login", { email, password });
  return r.data?.token ? { Authorization: `Bearer ${r.data.token}` } : {};
}

export const ADMIN = { email: "admin@enicar.tn", password: "admin123" };
export const PRESIDENT = { email: "ahmed@enicar.tn", password: "123456" };
