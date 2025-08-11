import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Global response interceptor that logs out on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  function login(userObj, authToken) {
    setUser(userObj);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("token", authToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    navigate("/dashboard");
  }

  function logout() {
    setUser(null);
    setToken(null);
    try { localStorage.removeItem("user"); localStorage.removeItem("token"); } catch {}
    delete api.defaults.headers.common["Authorization"];
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
