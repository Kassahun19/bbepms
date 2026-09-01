import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { userId: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(storage.getUser());
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSession() {
      const storedToken = storage.getToken();
      if (storedToken) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          storage.setUser(profile);
        } catch {
          // Token expired
          storage.clearAuth();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    loadSession();
  }, []);

  const login = async (credentials: { userId: string; password: string }) => {
    const res = await authService.login(credentials);
    storage.setToken(res.token);
    storage.setUser(res.user);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    storage.clearAuth();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
