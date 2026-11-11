import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user: safeUser } = response.data;
      localStorage.setItem("user", JSON.stringify(safeUser));
      localStorage.setItem("token", token);
      setUser(safeUser);
      return safeUser;
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
      const { token, user: newUser } = response.data;
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", token);
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw new Error("Cet email est peut-être déjà utilisé ou une erreur est survenue");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);