'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { 
  Bell, Check, Clock, CheckCircle2, Star, Award, 
  User 
} from 'lucide-react';
import api from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    let ignore = false;
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/api/v1/notifications');
        if (!ignore) setNotifications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchNotifications();
    return () => { ignore = true; };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/v1/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/v1/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mentorship_accepted':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'reward_earned':
        return <Star className="h-5 w-5 text-amber-500 fill-amber-500" />;
      case 'new_rating':
        return <Award className="h-5 w-5 text-violet-600" />;
      case 'mentorship_request':
        return <User className="h-5 w-5 text-indigo-600" />;
      default:
        return <Bell className="h-5 w-5 text-indigo-600" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 space-y-4 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-48 rounded-xl" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayedNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.is_read);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bell className="h-5 w-5" />
              </div>
              In-App Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'all' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                    : 'text-slate-500'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'unread' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                    : 'text-slate-500'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs font-semibold border-indigo-200 text-indigo-700 dark:text-indigo-300"
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {displayedNotifications.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <EmptyState
              icon={<Bell className="h-10 w-10 text-indigo-400" />}
              title="All caught up!"
              description="No notifications to display in this view."
              className="border-none bg-transparent"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map(n => (
              <Card 
                key={n.id} 
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  !n.is_read 
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-sm ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </h3>
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!n.is_read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => markAsRead(n.id)} 
                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 shrink-0"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Mark read
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
