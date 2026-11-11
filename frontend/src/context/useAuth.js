import { createContext, useContext } from "react";

// ANO-14 : le contexte et le hook sont séparés du composant AuthProvider (règle react-refresh)
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
