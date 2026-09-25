/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

const getPostAuthPath = (user) => {
  if (!user) {
    return "/login";
  }

  if (user.role === "admin") {
    return "/admin";
  }

  if (user.onboardingCompleted === false) {
    return "/onboarding";
  }

  if (user.role === "student") {
    return "/student";
  }

  if (user.role === "industry") {
    return "/industry";
  }

  if (user.role === "academician") {
    return "/academician/profile";
  }

  if (user.role === "institution") {
    return "/institution/profile";
  }

  return "/";
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("openCollabUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("openCollabToken");
  });

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("openCollabToken", token);
    localStorage.setItem("openCollabUser", JSON.stringify(user));

    setToken(token);
    setUser(user);

    return response.data;
  };

  const register = async (name, email, password, role) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });

    const { token, user } = response.data;

    localStorage.setItem("openCollabToken", token);
    localStorage.setItem("openCollabUser", JSON.stringify(user));

    setToken(token);
    setUser(user);

    return response.data;
  };

 const setOAuthSession = (oauthToken, oauthUser) => {
  localStorage.setItem("openCollabToken", oauthToken);
  localStorage.setItem(
    "openCollabUser",
    JSON.stringify(oauthUser)
  );

  setToken(oauthToken);
  setUser(oauthUser);
};
  const updateUser = (updatedUser) => {
  localStorage.setItem(
    "openCollabUser",
    JSON.stringify(updatedUser)
  );

  setUser(updatedUser);
};

  const logout = () => {
    localStorage.removeItem("openCollabToken");
    localStorage.removeItem("openCollabUser");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
  value={{
    user,
    token,
    login,
    register,
    setOAuthSession,
    logout,
    updateUser,
    isAuthenticated: Boolean(token),
    getPostAuthPath,
  }}
>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}