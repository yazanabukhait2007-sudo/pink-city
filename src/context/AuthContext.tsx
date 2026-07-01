import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../utils/api';
import { useToast } from './ToastContext';

export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'admin' | 'employee' | 'customer';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email?: string; phone?: string; password: string }) => Promise<void>;
  register: (data: { name: string; email?: string; phone?: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('pink_city_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const data = await authApi.me();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.log("Error fetching current user (unauthenticated or token expired):", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials: { email?: string; phone?: string; password: string }) => {
    try {
      setLoading(true);
      const data = await authApi.login(credentials);
      if (data.success && data.token && data.user) {
        localStorage.setItem('pink_city_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(data.message || 'تم تسجيل الدخول بنجاح!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل الدخول، يرجى التحقق من البيانات.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (regData: { name: string; email?: string; phone?: string; password: string }) => {
    try {
      setLoading(true);
      const data = await authApi.register(regData);
      if (data.success && data.token && data.user) {
        localStorage.setItem('pink_city_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(data.message || 'تم إنشاء الحساب بنجاح!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء الحساب.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pink_city_token');
    setToken(null);
    setUser(null);
    showToast('تم تسجيل الخروج بنجاح.', 'success');
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
