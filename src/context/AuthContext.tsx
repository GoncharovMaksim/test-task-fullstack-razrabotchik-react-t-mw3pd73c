'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import { DEMO_USERS } from '@/lib/constants';

interface AuthContextType {
  currentUser: UserProfile | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  switchUser: (userId: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'stroycrm_current_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const match = DEMO_USERS.find((u) => u.id === parsed.id);
        if (match) {
          const { password, ...profile } = match;
          setCurrentUser(profile);
        } else {
          setCurrentUser(parsed);
        }
      } else {
        // По умолчанию для демо устанавливаем руководителя
        const { password, ...defaultProfile } = DEMO_USERS[0];
        setCurrentUser(defaultProfile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultProfile));
      }
    } catch {
      const { password, ...defaultProfile } = DEMO_USERS[0];
      setCurrentUser(defaultProfile);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (!user) {
      return {
        success: false,
        error: 'Неверный email или пароль. Открытая регистрация отключена.',
      };
    }

    const { password: _, ...profile } = user;
    setCurrentUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    return { success: true };
  };

  const switchUser = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (user) {
      const { password, ...profile } = user;
      setCurrentUser(profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, switchUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
