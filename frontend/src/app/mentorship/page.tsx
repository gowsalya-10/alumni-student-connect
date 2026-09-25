'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Target, MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { MentorshipRequest } from '@/types';

export default function StudentMentorshipPage() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/mentorship/my');
      setRequests(res.data);
    } catch (err) {
      setError('Failed to load mentorships.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorships();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    try {
      await api.delete(`/api/v1/mentorship/requests/${id}`);
      fetchMentorships();
    } catch (err) {
      alert('Failed to cancel request');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const pending = requests.filter(r => r.status === 'pending');
  const active = requests.filter(r => r.status === 'accepted');
  const completed = requests.filter(r => r.status === 'completed' || r.status === 'declined' || r.status === 'cancelled');

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            My Mentorships
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Track and manage your career guidance sessions.
          </p>
        </div>

        {error && <Alert variant="error" title="Error">{error}</Alert>}

        {requests.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-gray-300 dark:border-gray-700">
            <EmptyState
              icon={<MessageSquare className="h-12 w-12" />}
              title="No mentorships yet"
              description="Explore the Alumni Directory to find a mentor and send your first request."
              action={
                <Link href="/alumni">
                  <Button>Find Alumni</Button>
                </Link>
              }
              className="border-none bg-transparent"
            />
          </Card>
        ) : (
          <div className="space-y-8">
            
            {active.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Mentorships</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {active.map(req => (
                    <Card key={req.id} className="p-6 border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{req.alumni_name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{req.alumni_role} at {req.alumni_company}</p>
                        </div>
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-6 bg-white dark:bg-gray-800 p-3 rounded border border-gray-100 dark:border-gray-700">
                        {req.message}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <Link href={`/alumni/${req.alumni_id}`}>
                          <Button variant="outline" size="sm">View Profile</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {pending.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pending Requests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pending.map(req => (
                    <Card key={req.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{req.alumni_name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{req.alumni_role}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Pending
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-4">Requested on {new Date(req.requested_at).toLocaleDateString()}</p>
                      <Button variant="outline" size="sm" onClick={() => handleCancel(req.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                        Cancel Request
                      </Button>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Past & Cancelled</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completed.map(req => (
                    <Card key={req.id} className="p-4 flex flex-col justify-between opacity-75">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{req.alumni_name}</h3>
                          <p className="text-xs text-gray-500">{req.alumni_role}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                          req.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {req.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
