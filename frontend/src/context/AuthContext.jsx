import { useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./useAuth";

// ANO-02 : ne jamais conserver le mot de passe (ni son hash) dans le navigateur
function withoutPassword(user) {
  if (!user) return user;
  const { password: _ignored, ...safeUser } = user;
  return safeUser;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? withoutPassword(JSON.parse(saved)) : null;
  });

  const openSession = (token, serverUser) => {
    const safeUser = withoutPassword(serverUser);
    localStorage.setItem("user", JSON.stringify(safeUser));
    localStorage.setItem("token", token);
    setUser(safeUser);
    return safeUser;
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return openSession(response.data.token, response.data.user);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error("Email ou mot de passe incorrect");
      }
      throw new Error("Erreur de connexion au serveur");
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await api.post("/auth/register", { fullName, email, password });
      return openSession(response.data.token, response.data.user);
    } catch (error) {
      const message = error.response?.data?.message;
      throw new Error(message || "Cet email est peut-être déjà utilisé ou une erreur est survenue");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}
