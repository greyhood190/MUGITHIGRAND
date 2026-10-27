import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchRoleForDemo: (role: UserRole) => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mgh_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mgh_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user);
        localStorage.setItem('mgh_auth_user', JSON.stringify(data.user));
      } catch (err) {
        console.warn('Session verification note:', err);
        const saved = localStorage.getItem('mgh_auth_user');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            localStorage.removeItem('mgh_auth_token');
            localStorage.removeItem('mgh_auth_user');
            setToken(null);
            setUser(null);
          }
        } else {
          localStorage.removeItem('mgh_auth_token');
          localStorage.removeItem('mgh_auth_user');
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const data = await api.login(email, pass);
    localStorage.setItem('mgh_auth_token', data.token);
    localStorage.setItem('mgh_auth_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('mgh_auth_token');
    localStorage.removeItem('mgh_auth_user');
    setToken(null);
    setUser(null);
  };

  const switchRoleForDemo = async (role: UserRole) => {
    const roleEmails: Record<UserRole, string> = {
      'Administrator': 'stevomunyue2020@gmail.com',
      'Manager': 'manager@mugithigrand.co.ke',
      'Front Office Staff': 'reception@mugithigrand.co.ke',
      'Housekeeping Staff': 'housekeeping@mugithigrand.co.ke',
      'Finance Officer': 'finance@mugithigrand.co.ke'
    };
    await login(roleEmails[role], 'Demo@2026!');
  };

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'Administrator') return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchRoleForDemo, hasPermission }}>
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
