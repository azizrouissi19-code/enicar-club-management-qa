import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9090/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // ANO-09 : un 401 sur /auth/* (mauvais mot de passe) doit rester sur la page pour afficher le message
    const isAuthRequest = err.config?.url?.startsWith("/auth/");
    if (err.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
