'use client';

import { useEffect, useState, createContext, useContext, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/api/auth';
import type { UserRole } from '@/domain/types/database';

const roleRoutes: Record<UserRole, string> = {
  cliente: '/carrito',
  vendedor: '/vendedor',
  manager_admin: '/admin',
};

interface AuthContextType {
  user: { id: string; email: string; full_name: string | null; role: UserRole } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  getRedirectPath: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; full_name: string | null; role: UserRole } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initAuth = async () => {
      try {
        const userData = await authApi.getCurrentUser();
        if (userData?.user) {
          setUser({
            id: userData.user.id,
            email: userData.user.email,
            full_name: userData.user.full_name,
            role: userData.user.role,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const getRedirectPath = (role: UserRole): string => {
    return roleRoutes[role] ?? '/carrito';
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authApi.login(email, password);
      if (result.user) {
        const role = result.user.role as UserRole;
        router.push(roleRoutes[role] ?? '/carrito');
      }
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const result = await authApi.register(email, password, fullName);
      if (result.user) {
        const role = (result.user.role ?? 'cliente') as UserRole;
        router.push(roleRoutes[role] ?? '/carrito');
      }
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Registration failed' };
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
      setUser(null);
      router.push('/login');
    } catch {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, getRedirectPath }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
