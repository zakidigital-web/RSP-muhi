'use client';

import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { initializeSeedData } from '@/lib/seed-data';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  useEffect(() => {
    // Initialize seed data on first load
    initializeSeedData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="min-h-screen p-4 pb-20 pt-20 lg:p-6 lg:pt-6 lg:pb-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
