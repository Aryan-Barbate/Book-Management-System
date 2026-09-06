import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { baseBookURL } from "../../axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("book_vault_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("book_vault_token") || null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");

  const saveAuthSession = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (newToken) {
      localStorage.setItem("book_vault_token", newToken);
    } else {
      localStorage.removeItem("book_vault_token");
    }
    if (newUser) {
      localStorage.setItem("book_vault_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("book_vault_user");
    }
  }, []);

  // Fetch current user details if token exists
  const fetchMe = useCallback(async () => {
    const savedToken = localStorage.getItem("book_vault_token");
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await baseBookURL.get("/auth/me");
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("book_vault_user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn("Could not verify auth token with backend:", err.message);
      // If 401 unauthorized, clear token
      if (err.response?.status === 401) {
        saveAuthSession(null, null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [saveAuthSession]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const openAuthModal = useCallback((mode = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await baseBookURL.post("/auth/login", { email, password });
      const { token: newToken, user: newUser } = res.data;
      saveAuthSession(newToken, newUser);
      closeAuthModal();
      return newUser;
    },
    [saveAuthSession, closeAuthModal]
  );

  const register = useCallback(
    async (name, email, password) => {
      const res = await baseBookURL.post("/auth/register", { name, email, password });
      const { token: newToken, user: newUser } = res.data;
      saveAuthSession(newToken, newUser);
      closeAuthModal();
      return newUser;
    },
    [saveAuthSession, closeAuthModal]
  );

  const loginWithGoogle = useCallback(
    async (credential) => {
      const res = await baseBookURL.post("/auth/google", { credential });
      const { token: newToken, user: newUser } = res.data;
      saveAuthSession(newToken, newUser);
      closeAuthModal();
      return newUser;
    },
    [saveAuthSession, closeAuthModal]
  );

  const loginAsDemo = useCallback(async () => {
    try {
      const res = await baseBookURL.post("/auth/demo");
      const { token: newToken, user: newUser } = res.data;
      saveAuthSession(newToken, newUser);
      closeAuthModal();
      return newUser;
    } catch (err) {
      // Offline fallback demo user
      const demoUser = {
        id: "demo-user-id",
        name: "Demo Reader",
        email: "demo@bookvault.io",
        customShelves: ["Want to Read", "Currently Reading", "Read", "Favorites", "Summer 2026"],
      };
      saveAuthSession("demo-token", demoUser);
      closeAuthModal();
      return demoUser;
    }
  }, [saveAuthSession, closeAuthModal]);

  const logout = useCallback(() => {
    saveAuthSession(null, null);
  }, [saveAuthSession]);

  const updateCustomShelves = useCallback(
    async (newShelves) => {
      try {
        const res = await baseBookURL.put("/auth/shelves", { customShelves: newShelves });
        const updated = res.data?.customShelves || newShelves;
        setUser((prev) => {
          const next = { ...prev, customShelves: updated };
          localStorage.setItem("book_vault_user", JSON.stringify(next));
          return next;
        });
        return updated;
      } catch (err) {
        // Fallback local update
        setUser((prev) => {
          const next = { ...prev, customShelves: newShelves };
          localStorage.setItem("book_vault_user", JSON.stringify(next));
          return next;
        });
        return newShelves;
      }
    },
    []
  );

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token && user),
    isGuest: !token || !user,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    login,
    register,
    loginWithGoogle,
    loginAsDemo,
    logout,
    updateCustomShelves,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
