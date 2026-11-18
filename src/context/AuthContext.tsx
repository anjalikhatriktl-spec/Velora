import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AdminModulePermission, AuthUser, EmployeeDepartment } from '../types';

export interface EmployeeAuthSummary {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  department: EmployeeDepartment;
  permissions: AdminModulePermission[];
}

interface AuthContextValue {
  loading: boolean;
  adminInitialized: boolean;
  user: AuthUser | null;
  employeeProfile: EmployeeAuthSummary | null;
  refreshAuth: () => Promise<void>;
  setupAdmin: (payload: { name: string; email: string; password: string }) => Promise<AuthUser>;
  login: (payload: {
    email: string;
    password: string;
    rememberMe: boolean;
    portal: 'admin' | 'employee';
  }) => Promise<AuthUser>;
  activateEmployee: (payload: {
    email: string;
    inviteCode: string;
    password: string;
  }) => Promise<AuthUser>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (payload: {
    email: string;
    code: string;
    newPassword: string;
  }) => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [adminInitialized, setAdminInitialized] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeAuthSummary | null>(null);

  const refreshAuth = useCallback(async () => {
    try {
      const data = await apiJson<{
        adminInitialized: boolean;
        user: AuthUser | null;
        employeeProfile: EmployeeAuthSummary | null;
      }>('/api/auth/status');
      setAdminInitialized(data.adminInitialized);
      setUser(data.user);
      setEmployeeProfile(data.employeeProfile);
    } catch {
      setUser(null);
      setEmployeeProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const setupAdmin: AuthContextValue['setupAdmin'] = async (payload) => {
    const data = await apiJson<{ user: AuthUser }>('/api/auth/setup-admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAdminInitialized(true);
    setUser(data.user);
    await refreshAuth();
    return data.user;
  };

  const login: AuthContextValue['login'] = async (payload) => {
    const data = await apiJson<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    await refreshAuth();
    return data.user;
  };

  const activateEmployee: AuthContextValue['activateEmployee'] = async (payload) => {
    const data = await apiJson<{ user: AuthUser }>('/api/auth/activate-employee', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    await refreshAuth();
    return data.user;
  };

  const forgotPassword: AuthContextValue['forgotPassword'] = async (email) => {
    const data = await apiJson<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data.message;
  };

  const resetPassword: AuthContextValue['resetPassword'] = async (payload) => {
    const data = await apiJson<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.message;
  };

  const changePassword: AuthContextValue['changePassword'] = async (
    currentPassword,
    newPassword
  ) => {
    await apiJson('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  const logout = async () => {
    await apiJson('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setEmployeeProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        adminInitialized,
        user,
        employeeProfile,
        refreshAuth,
        setupAdmin,
        login,
        activateEmployee,
        forgotPassword,
        resetPassword,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
