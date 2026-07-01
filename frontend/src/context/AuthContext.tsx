import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../utils/api';
import { useToast } from './ToastContext';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer' | 'employee';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email?: string; phone?: string; password?: string; loginMethod?: 'email' | 'phone' }) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password?: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('pink_city_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.me();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          // Clear invalid token
          localStorage.removeItem('pink_city_token');
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        // Clear invalid token only if it was a real auth failure and not just a server offline fallback
        if (localStorage.getItem('pink_city_mock_active') !== 'true') {
          localStorage.removeItem('pink_city_token');
        } else {
          // If mock is active, try to fetch mock user
          const mockUser = localStorage.getItem('pink_city_mock_user');
          if (mockUser) {
            setUser(JSON.parse(mockUser));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (credentials: { email?: string; phone?: string; password?: string; loginMethod?: 'email' | 'phone' }) => {
    try {
      const res = await authApi.login(credentials);
      if (res.success && res.user && res.token) {
        localStorage.setItem('pink_city_token', res.token);
        setUser(res.user);
        showSuccess(`مرحباً بك مجدداً، ${res.user.name}!`);
      } else {
        throw new Error('حدث خطأ في عملية تسجيل الدخول');
      }
    } catch (err: any) {
      showError(err.message || 'فشل تسجيل الدخول، يرجى التحقق من البيانات المدخلة');
      throw err;
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password?: string }) => {
    try {
      const res = await authApi.register(data);
      if (res.success && res.user && res.token) {
        localStorage.setItem('pink_city_token', res.token);
        setUser(res.user);
        showSuccess(`تم إنشاء الحساب بنجاح. مرحباً بك ${res.user.name}!`);
      } else {
        throw new Error('حدث خطأ في إنشاء الحساب');
      }
    } catch (err: any) {
      showError(err.message || 'فشل إنشاء الحساب، البريد الإلكتروني قد يكون مستخدماً بالفعل');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('pink_city_token');
    localStorage.removeItem('pink_city_mock_user');
    setUser(null);
    showSuccess('تم تسجيل الخروج بنجاح. نراك قريباً!');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
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
