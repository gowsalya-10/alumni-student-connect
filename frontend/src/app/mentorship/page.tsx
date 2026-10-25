'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { 
  MessageSquare, Clock, CheckCircle2, 
  Star, Briefcase, Users, Plus 
} from 'lucide-react';
import api from '@/lib/api';
import { MentorshipRequest } from '@/types';

export default function StudentMentorshipPage() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<MentorshipRequest | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const refreshMentorships = async () => {
    try {
      const res = await api.get('/api/v1/mentorship/my');
      setRequests(res.data);
    } catch {
      setError('Failed to load mentorships.');
    }
  };

  useEffect(() => {
    let ignore = false;
    const fetchInitial = async () => {
      try {
        const res = await api.get('/api/v1/mentorship/my');
        if (!ignore) setRequests(res.data);
      } catch {
        if (!ignore) setError('Failed to load mentorships.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchInitial();
    return () => { ignore = true; };
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this mentorship request?')) return;
    try {
      await api.delete(`/api/v1/mentorship/requests/${id}`);
      await refreshMentorships();
    } catch {
      alert('Failed to cancel request');
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Mark this mentorship as completed?')) return;
    try {
      await api.put(`/api/v1/mentorship/${id}/complete`);
      await refreshMentorships();
      const req = requests.find(r => r.id === id);
      if (req) {
        setSelectedReq(req);
        setIsRatingOpen(true);
      }
    } catch {
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
      alert('Rating and feedback submitted successfully!');
      setIsRatingOpen(false);
      await refreshMentorships();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert(detail || 'Failed to submit rating. You may have already rated this session.');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="h-5 w-5" />
              </div>
              My Mentorship Sessions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track your outgoing requests, ongoing mentorships, and session ratings.
            </p>
          </div>

          <Link href="/alumni">
            <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs">
              <Plus className="h-4 w-4" /> Request New Mentor
            </Button>
          </Link>
        </div>

        {error && <Alert variant="error" title="Notice">{error}</Alert>}

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {(['all', 'pending', 'accepted', 'completed'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'all' ? `All (${requests.length})` :
               tab === 'pending' ? `Pending (${pendingCount})` :
               tab === 'accepted' ? `Active (${acceptedCount})` : `Completed (${completedCount})`}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <EmptyState
              icon={<Users className="h-10 w-10 text-indigo-400" />}
              title="No mentorship records in this view"
              description="Explore the alumni directory or review Smart Matches to find your next career mentor."
              action={
                <Link href="/alumni">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Explore Alumni Directory
                  </Button>
                </Link>
              }
              className="border-none bg-transparent"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRequests.map(req => (
              <Card 
                key={req.id} 
                className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar alt={req.alumni_name} size="md" />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {req.alumni_name}
                        </h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold line-clamp-1">
                          {req.alumni_role || 'Alumni Mentor'}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      req.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : req.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : req.status === 'declined'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {req.alumni_company && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                      <Briefcase className="h-3.5 w-3.5" />
                      {req.alumni_company}
                    </p>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 mb-3">
                    <span className="font-bold text-slate-900 dark:text-white mr-1">Your message:</span>
                    &ldquo;{req.message}&rdquo;
                  </div>

                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Requested on {new Date(req.requested_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  {req.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleCancel(req.id)}
                      className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                    >
                      Cancel Request
                    </Button>
                  )}

                  {req.status === 'accepted' && (
                    <Button 
                      size="sm" 
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      onClick={() => handleComplete(req.id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed & Rate
                    </Button>
                  )}

                  {req.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                      onClick={() => {
                        setSelectedReq(req);
                        setIsRatingOpen(true);
                      }}
                    >
                      <Star className="h-3.5 w-3.5" /> Leave Review
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Rating Modal */}
        <Modal
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          title={`Rate Mentorship with ${selectedReq?.alumni_name || 'Mentor'}`}
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your rating directly impacts your mentor&apos;s Alumni Impact Score and platform ranking.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Star Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Written Feedback & Review
              </label>
              <textarea
                rows={3}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts on how helpful this mentorship session was..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsRatingOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" isLoading={submittingRating} onClick={handleRate}>
                Submit Rating
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
