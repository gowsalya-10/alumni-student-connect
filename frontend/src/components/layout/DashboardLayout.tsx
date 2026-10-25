'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { 
  Home, Compass, Target, FileText, Users, LogOut, MessageSquare, 
  Star, Bell, GraduationCap 
} from 'lucide-react';
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
      api.get('/api/v1/notifications')
        .then(res => {
          setUnreadCount(res.data.filter((n: { is_read: boolean }) => !n.is_read).length);
        })
        .catch(() => {});
    }
  }, [user]);

  const studentNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Mentorship', href: '/mentorship', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Career Roadmap', href: '/career-navigator', icon: <Compass className="h-5 w-5" /> },
    { name: 'Skills & Readiness', href: '/skills', icon: <Target className="h-5 w-5" /> },
    { name: 'Resume Vault', href: '/resume', icon: <FileText className="h-5 w-5" /> },
    { name: 'Alumni Directory', href: '/alumni', icon: <Users className="h-5 w-5" /> },
  ];

  const alumniNavItems = [
    { name: 'Mentorship Hub', href: '/alumni-mentorship', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Impact & Rewards', href: '/alumni-impact', icon: <Star className="h-5 w-5" /> },
    { name: 'Alumni Network', href: '/alumni', icon: <Users className="h-5 w-5" /> },
  ];

  const baseItems = user?.role === 'alumni' ? alumniNavItems : studentNavItems;

  const navItems = baseItems.map(item => ({
    ...item,
    isActive: pathname === item.href,
  }));

  const mobileItems = navItems.slice(0, 4);

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex min-h-screen bg-slate-50/60 dark:bg-gray-950">
        <Sidebar
          items={navItems}
          header={
            <div className="flex items-center justify-between w-full">
              <div 
                onClick={() => router.push(user?.role === 'alumni' ? '/alumni-mentorship' : '/dashboard')}
                className="flex items-center gap-2.5 font-bold text-base cursor-pointer text-gray-900 dark:text-white"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold tracking-tight leading-none text-gray-900 dark:text-white">AlumniConnect</span>
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">Mentorship Hub</span>
                </div>
              </div>
              <button 
                onClick={() => router.push('/notifications')} 
                title="Notifications"
                className="relative p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/80 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          }
          footer={
            <button
              onClick={logout}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/80 dark:text-rose-400 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          }
        />
        
        <main className="flex-1 pb-20 md:pb-8 overflow-x-hidden min-w-0">
          {children}
        </main>
        
        <MobileBottomNav items={mobileItems} />
      </div>
    </ProtectedRoute>
  );
}
