import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "../types/auth";
import { api } from "../services/api";

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("@cinepass:token");
    const storedUser = localStorage.getItem("@cinepass:user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
    }
  }, []);

  function login(newUser: User, newToken: string) {
    setUser(newUser);
    setToken(newToken);

    localStorage.setItem("@cinepass:token", newToken);
    localStorage.setItem("@cinepass:user", JSON.stringify(newUser));

    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  }

  function logout() {
    setUser(null);
    setToken(null);

    localStorage.removeItem("@cinepass:token");
    localStorage.removeItem("@cinepass:user");

    delete api.defaults.headers.common.Authorization;
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}