'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Home, Compass, Target, FileText, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home /> },
    { name: 'Career Navigator', href: '/career-navigator', icon: <Compass /> },
    { name: 'Skill Gap', href: '/skills', icon: <Target /> },
    { name: 'Resume Vault', href: '/resume', icon: <FileText /> },
    { name: 'Mentors', href: '/mentors', icon: <Users /> },
  ].map(item => ({
    ...item,
    isActive: pathname === item.href,
  }));

  const mobileItems = navItems.slice(0, 4); // Only fit 4 on mobile easily

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar
          items={navItems}
          header={
            <div className="flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-500">
              <Compass className="h-6 w-6" />
              <span>Impact Hub</span>
            </div>
          }
          footer={
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md dark:text-red-500 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          }
        />
        
        <main className="flex-1 pb-16 md:pb-0 overflow-x-hidden">
          {children}
        </main>
        
        <MobileBottomNav items={mobileItems} />
      </div>
    </ProtectedRoute>
  );
}
