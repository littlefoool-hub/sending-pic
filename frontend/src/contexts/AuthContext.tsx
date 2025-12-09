import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, login, logout, register } from '../services/api';

export interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (username: string, password: string, role?: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // Если ошибка авторизации, очищаем пользователя
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginUser = async (username: string, password: string) => {
    const loggedInUser = await login(username, password);
    setUser(loggedInUser);
    // Перенаправление будет обработано в компонентах Login/Register
  };

  const registerUser = async (username: string, password: string, role: string = 'user') => {
    await register(username, password, role);
    // После регистрации автоматически логинимся
    await loginUser(username, password);
    // Перенаправление будет обработано в компонентах Login/Register
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading,
    loginUser,
    registerUser,
    logoutUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

