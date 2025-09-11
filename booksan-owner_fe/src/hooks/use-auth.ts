'use client';

import { useState, useEffect } from 'react';
import { authServiceClient } from '@/lib/auth-client';
import type { User } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have a token
        const hasToken = authServiceClient.isAuthenticated();
        setIsAuthenticated(hasToken);

        if (hasToken) {
          // Try to get current user
          const currentUser = await authServiceClient.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token might be invalid, clear auth
            authServiceClient.clearAuth();
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        authServiceClient.clearAuth();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: {
    email?: string;
    phone?: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await authServiceClient.login(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authServiceClient.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authServiceClient.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      return currentUser;
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };
}
