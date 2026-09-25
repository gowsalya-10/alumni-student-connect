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

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<MentorshipRequest | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

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

  const handleComplete = async (id: string) => {
    if (!confirm('Mark this mentorship as completed?')) return;
    try {
      await api.put(`/api/v1/mentorship/${id}/complete`);
      fetchMentorships();
      const req = requests.find(r => r.id === id);
      if (req) {
        setSelectedReq(req);
        setIsRatingOpen(true);
      }
    } catch (err) {
      alert('Failed to complete mentorship');
    }
  };

  const handleRate = async () => {
    if (!selectedReq) return;
    try {
      setSubmittingRating(true);
      await api.post(`/api/v1/mentorship/${selectedReq.id}/rating`, {
        rating,
        review
      });
      alert('Rating submitted successfully!');
      setIsRatingOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit rating. You may have already rated it.');
    } finally {
      setSubmittingRating(false);
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
                          <Button variant="outline" size="sm">Profile</Button>
                        </Link>
                        <Button size="sm" onClick={() => handleComplete(req.id)}>Mark Completed</Button>
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
                      {req.status === 'completed' && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setSelectedReq(req); setIsRatingOpen(true); }}>
                            Rate Mentorship
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

        {/* Rating Modal */}
        {isRatingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsRatingOpen(false)} />
            <div className="relative z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Rate your mentorship</h2>
              <p className="text-sm text-gray-500 mb-6">How was your experience with {selectedReq?.alumni_name}?</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-700'}`}
                  >
                    <svg className="w-10 h-10 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Review (Optional)
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 min-h-[100px]"
                  placeholder="Share a few words about your experience..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={() => setIsRatingOpen(false)} disabled={submittingRating}>Cancel</Button>
                <Button onClick={handleRate} disabled={submittingRating}>
                  {submittingRating ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
