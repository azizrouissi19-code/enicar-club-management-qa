/** Message d'erreur lisible renvoyé par l'API (ou message par défaut) */
export function apiMessage(error, fallback) {
  const data = error?.response?.data;
  return data?.message || (typeof data === "string" && data) || fallback;
}
