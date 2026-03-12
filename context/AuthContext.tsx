import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData, removeStoredData } from '@/src/utils/localJsonStorage';
import type { OwnerUser } from '@/types';

const AUTH_KEY = '@owner_auth';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  owner: OwnerUser | null;
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  owner: null,
  login: async () => ({ success: false, message: '' }),
  logout: async () => {},
});

const DEMO_OWNER: OwnerUser = {
  id: 'owner_001',
  name: 'Soruban Admin',
  phone: '9999999999',
  email: 'admin@soruban.com',
  role: 'owner',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [owner, setOwner] = useState<OwnerUser | null>(null);

  useEffect(() => {
    getStoredData<OwnerUser | null>(AUTH_KEY, null).then((stored) => {
      if (stored) {
        setOwner(stored);
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (phone: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Demo authentication: accept specific credentials or always authenticate
    if (phone === '9999999999' && password === 'owner123') {
      const user: OwnerUser = { ...DEMO_OWNER, phone };
      await setStoredData(AUTH_KEY, user);
      setOwner(user);
      return { success: true, message: 'Login successful' };
    }

    // For demo purposes, accept any non-empty credentials
    if (phone.length >= 10 && password.length >= 4) {
      const user: OwnerUser = {
        id: `owner_${Date.now()}`,
        name: 'Store Owner',
        phone,
        role: 'owner',
      };
      await setStoredData(AUTH_KEY, user);
      setOwner(user);
      return { success: true, message: 'Login successful' };
    }

    return { success: false, message: 'Invalid phone number or password. Phone must be 10+ digits and password 4+ characters.' };
  }, []);

  const logout = useCallback(async () => {
    await removeStoredData(AUTH_KEY);
    setOwner(null);
  }, []);

  const isAuthenticated = owner !== null;

  const value = useMemo(
    () => ({ isLoading, isAuthenticated, owner, login, logout }),
    [isLoading, isAuthenticated, owner, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
