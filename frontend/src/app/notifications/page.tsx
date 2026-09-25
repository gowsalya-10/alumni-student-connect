'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Bell, Check, Clock } from 'lucide-react';
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

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/v1/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 space-y-4">
          <Skeleton className="h-10 w-48 mb-6" />
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </DashboardLayout>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              Notifications
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <EmptyState
              icon={<Bell className="h-12 w-12" />}
              title="All caught up!"
              description="You have no notifications at the moment."
              className="border-none bg-transparent"
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map(n => (
              <Card 
                key={n.id} 
                className={`p-5 flex justify-between items-start ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'opacity-80'}`}
              >
                <div>
                  <h3 className={`font-semibold ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {n.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)} className="text-blue-600">
                    <Check className="h-4 w-4 mr-1" /> Read
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
