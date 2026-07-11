'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface AdminInfo {
  id: number;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  adminInfo: AdminInfo | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authStatus = localStorage.getItem('spp_admin_auth');
    const storedAdminInfo = localStorage.getItem('spp_admin_info');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      if (storedAdminInfo) {
        try {
          setAdminInfo(JSON.parse(storedAdminInfo));
        } catch {}
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = async (password: string) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        const info: AdminInfo = { id: data.adminId, name: data.adminName };
        localStorage.setItem('spp_admin_auth', 'true');
        localStorage.setItem('spp_admin_info', JSON.stringify(info));
        setIsAuthenticated(true);
        setAdminInfo(info);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('spp_admin_auth');
    localStorage.removeItem('spp_admin_info');
    setIsAuthenticated(false);
    setAdminInfo(null);
    toast.success('Anda telah keluar dari aplikasi.');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
