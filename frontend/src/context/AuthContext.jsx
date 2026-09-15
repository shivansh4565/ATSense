import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";

const AuthContext = createContext(null);

const USER_STORAGE_KEY = "arr_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.warn("Failed to restore saved user:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const queryClient = useQueryClient();

  // Save user in React state + localStorage
  const saveUser = useCallback((userData) => {
    setUser(userData);

    if (userData) {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(userData)
      );
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  // Check current authenticated user
  const refresh = useCallback(async () => {
    try {
      const response = await authApi.me();

      console.log("AUTH /me RESPONSE:", response);

      if (response?.user) {
        saveUser(response.user);
      }
    } catch (error) {
      console.error("AUTH /me ERROR:", error);

      /*
       * IMPORTANT:
       * Axios interceptor converts the error into:
       *
       * {
       *   status,
       *   message,
       *   details,
       *   original
       * }
       *
       * Therefore use error.status, NOT error.response.status.
       */
      const status = error?.status;

      // Only logout when backend explicitly says
      // that authentication is invalid/expired.
      if (status === 401) {
        console.warn("Session expired. Logging out.");
        saveUser(null);
      } else {
        // Keep existing user for temporary backend/network errors.
        console.warn(
          "Auth check failed, keeping existing session:",
          error?.message || error
        );
      }
    } finally {
      setLoading(false);
    }
  }, [saveUser]);

  // Restore authentication when application starts
  useEffect(() => {
    refresh();
  }, [refresh]);

  // LOGIN
  const login = useCallback(
    async (credentials) => {
      const response = await authApi.login(credentials);

      console.log("LOGIN RESPONSE:", response);

      if (response?.user) {
        saveUser(response.user);
      }

      return response?.user;
    },
    [saveUser]
  );

  // REGISTER
  const register = useCallback(
    async (payload) => {
      const response = await authApi.register(payload);

      if (response?.user) {
        saveUser(response.user);
      }

      return response?.user;
    },
    [saveUser]
  );

  // UPDATE PROFILE
  const updateProfile = useCallback(
    async (payload) => {
      const response = await authApi.updateProfile(payload);

      if (response?.user) {
        saveUser(response.user);
      }

      return response?.user;
    },
    [saveUser]
  );

  // LOGOUT
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn(
        "Logout API failed:",
        error?.message || error
      );
    } finally {
      // Clear local authentication state
      saveUser(null);

      // Clear React Query cache
      queryClient.clear();
    }
  }, [queryClient, saveUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return ctx;
}