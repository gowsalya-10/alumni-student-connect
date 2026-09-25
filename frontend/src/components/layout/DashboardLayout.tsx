'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Home, Compass, Target, FileText, Users, LogOut, MessageSquare, Star, Gift, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function DashboardLayout({ children, allowedRoles = ['student', 'alumni'] }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/api/v1/notifications').then(res => {
        setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
      }).catch(() => {});
    }
  }, [user]);

  const studentNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home /> },
    { name: 'Mentorship', href: '/mentorship', icon: <MessageSquare /> },
    { name: 'Career Navigator', href: '/career-navigator', icon: <Compass /> },
    { name: 'Skill Gap', href: '/skills', icon: <Target /> },
    { name: 'Resume Vault', href: '/resume', icon: <FileText /> },
    { name: 'Alumni', href: '/alumni', icon: <Users /> },
  ];

  const alumniNavItems = [
    { name: 'Requests', href: '/alumni-mentorship', icon: <MessageSquare /> },
    { name: 'Impact & Rewards', href: '/alumni-impact', icon: <Star /> },
  ];

  const baseItems = user?.role === 'alumni' ? alumniNavItems : studentNavItems;

  const navItems = baseItems.map(item => ({
    ...item,
    isActive: pathname === item.href,
  }));

  const mobileItems = navItems.slice(0, 4);

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar
          items={navItems}
          header={
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-500">
                <Compass className="h-6 w-6" />
                <span>Impact Hub</span>
              </div>
              <button onClick={() => router.push('/notifications')} className="relative p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-gray-900"></span>
                )}
              </button>
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
