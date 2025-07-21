"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const isAuth = localStorage.getItem("cheetah-auth") === "true";
    setAuthenticated(isAuth);
    setAuthLoading(false); // Set loading to false after check
  }, []);

  const login = ({ id, password }) => {
    if (id === "admin" && password === "admin") {
      localStorage.setItem("cheetah-auth", "true");
      setAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("cheetah-auth");
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ authenticated, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
