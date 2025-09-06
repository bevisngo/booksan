"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  AuthContextType,
  User,
  LoginRequest,
  SignupRequest,
  AuthResponse,
} from "./types";
import { authService } from "./service";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a stored user and token
        const storedUser = authService.getStoredUser();
        const hasToken = authService.isAuthenticated();

        if (storedUser && hasToken) {
          // We have both user and token, set the user immediately
          setUser(storedUser);
          setIsLoading(false);

          // Optionally validate the token in the background
          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              // Token is still valid, update user data
              setUser(currentUser);
              authService.setStoredUser(currentUser);
            } else {
              // Token is invalid, clear everything
              authService.clearTokens();
              authService.clearStoredUser();
              setUser(null);
            }
          } catch (error) {
            // API call failed, but we'll keep the stored user for now
            console.error("Token validation failed:", error);
          }
        } else {
          // No stored user or token, clear everything
          authService.clearTokens();
          authService.clearStoredUser();
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        // Clear any invalid tokens
        authService.clearTokens();
        authService.clearStoredUser();
        setUser(null);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setUser(response.data.user);
      authService.setCookieAuthToken(response.data.accessToken);
      authService.setStoredUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.signup(userData);
      setUser(response.data.user);
      authService.setStoredUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      authService.clearStoredUser();
      authService.clearCookieAuthToken();
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if API call fails
      setUser(null);
      authService.clearStoredUser();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const success = await authService.refreshAccessToken();
      if (!success) {
        setUser(null);
        authService.clearStoredUser();
      }
      return success;
    } catch (error) {
      console.error("Token refresh failed:", error);
      setUser(null);
      authService.clearStoredUser();
      return false;
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        authService.setStoredUser(currentUser);
      } else {
        setUser(null);
        authService.clearStoredUser();
      }
      return currentUser;
    } catch (error) {
      console.error("Get current user failed:", error);
      setUser(null);
      authService.clearStoredUser();
      return null;
    }
  };

  // OAuth methods
  const getGoogleAuthUrl = async () => {
    return authService.getGoogleAuthUrl();
  };

  const handleGoogleCallback = async (code: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.handleGoogleCallback(code);
      setUser(response.data.user);
      authService.setStoredUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getFacebookAuthUrl = async () => {
    return authService.getFacebookAuthUrl();
  };

  const handleFacebookCallback = async (
    code: string
  ): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.handleFacebookCallback(code);
      setUser(response.data.user);
      authService.setStoredUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getZaloAuthUrl = async () => {
    return authService.getZaloAuthUrl();
  };

  const loginWithZalo = async (accessToken: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.loginWithZalo(accessToken);
      setUser(response.data.user);
      authService.setStoredUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshToken,
    getCurrentUser,
    getGoogleAuthUrl,
    handleGoogleCallback,
    getFacebookAuthUrl,
    handleFacebookCallback,
    getZaloAuthUrl,
    loginWithZalo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
