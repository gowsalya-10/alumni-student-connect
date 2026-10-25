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
  Target, CheckCircle2, Clock, Users, 
  Award, Star, X, Check 
} from 'lucide-react';
import api from '@/lib/api';
import { MentorshipRequest } from '@/types';

export default function AlumniMentorshipPage() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'completed'>('pending');

  // Interaction Log Modal state
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<MentorshipRequest | null>(null);
  const [interactionType, setInteractionType] = useState('Career Guidance');
  const [duration, setDuration] = useState('45');
  const [notes, setNotes] = useState('');
  const [logging, setLogging] = useState(false);

  const refreshMentorships = async () => {
    try {
      const res = await api.get('/api/v1/mentorship/incoming');
      setRequests(res.data);
    } catch {
      setError('Failed to refresh mentorship requests.');
    }
  };

  useEffect(() => {
    let ignore = false;
    const fetchInitial = async () => {
      try {
        const res = await api.get('/api/v1/mentorship/incoming');
        if (!ignore) setRequests(res.data);
      } catch {
        if (!ignore) setError('Failed to load mentorship requests.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchInitial();
    return () => { ignore = true; };
  }, []);

  const handleStatus = async (id: string, status: 'accept' | 'decline') => {
    try {
      await api.put(`/api/v1/mentorship/${id}/${status}`);
      await refreshMentorships();
    } catch {
      alert(`Failed to ${status} request`);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Mark this mentorship as completed?')) return;
    try {
      await api.put(`/api/v1/mentorship/${id}/complete`);
      await refreshMentorships();
    } catch {
      alert('Failed to complete mentorship');
    }
  };

  const handleLogInteraction = async () => {
    if (!selectedReq) return;
    try {
      setLogging(true);
      await api.post(`/api/v1/mentorship/${selectedReq.id}/interactions`, {
        interaction_type: interactionType,
        duration_minutes: parseInt(duration),
        notes
      });
      setIsLogOpen(false);
      setNotes('');
      alert('Mentorship session logged successfully! Reward points updated.');
      await refreshMentorships();
    } catch {
      alert('Failed to log session interaction.');
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['alumni']}>
        <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  const pending = requests.filter(r => r.status === 'pending');
  const active = requests.filter(r => r.status === 'accepted');
  const completed = requests.filter(r => r.status === 'completed');

  const displayedList = 
    activeTab === 'pending' ? pending :
    activeTab === 'accepted' ? active : completed;

  return (
    <DashboardLayout allowedRoles={['alumni']}>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in font-sans">
        
        {/* Header with Title and Impact Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
                <Target className="h-5 w-5" />
              </div>
              Mentorship Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review incoming student requests, manage 1:1 sessions, and log interactions.
            </p>
          </div>

          <Link href="/alumni-impact">
            <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-xs border-indigo-200 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50">
              <Star className="h-4 w-4 text-amber-500" /> View Impact & Rewards
            </Button>
          </Link>
        </div>

        {error && <Alert variant="error" title="Notice">{error}</Alert>}

        {/* 3 Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pending Inquiries
              </span>
              <span className={`h-2.5 w-2.5 rounded-full ${pending.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {pending.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Awaiting your acceptance
            </p>
          </Card>

          <Card className="p-5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Mentees
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {active.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ongoing mentorship pairings
            </p>
          </Card>

          <Card className="p-5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Completed Sessions
              </span>
              <Award className="h-4 w-4 text-violet-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {completed.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Successful student milestones
            </p>
          </Card>
        </div>

        {/* Segmented Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Pending Requests</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'pending' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {pending.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accepted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'accepted'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Active Mentees</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'accepted' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {active.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Past / Completed</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'completed' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {completed.length}
            </span>
          </button>
        </div>

        {/* Requests List */}
        {displayedList.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <EmptyState
              icon={<Users className="h-10 w-10 text-indigo-400" />}
              title={`No ${activeTab} mentorship requests`}
              description={
                activeTab === 'pending'
                  ? 'You are all caught up! New student requests will appear here.'
                  : activeTab === 'accepted'
                  ? 'No active mentorship sessions currently in progress.'
                  : 'Completed mentorships and ratings will be recorded here.'
              }
              className="border-none bg-transparent"
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {displayedList.map(req => (
              <Card 
                key={req.id} 
                className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar alt={req.student_name} size="md" className="shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {req.student_name}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : req.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Year {req.student_year || 3} • {req.student_department || 'Computer Science'}
                      </p>

                      {req.student_goal && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1 flex items-center gap-1">
                          <Target className="h-3.5 w-3.5" /> Desired Role: {req.student_goal}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0">
                    Requested: {new Date(req.requested_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Message Quote */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white mr-1.5">Student Note:</span>
                  &ldquo;{req.message}&rdquo;
                </div>

                {/* Action Buttons depending on status */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
                  {req.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                        onClick={() => handleStatus(req.id, 'decline')}
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Decline
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleStatus(req.id, 'accept')}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Accept Mentorship
                      </Button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1.5"
                        onClick={() => {
                          setSelectedReq(req);
                          setIsLogOpen(true);
                        }}
                      >
                        <Clock className="h-3.5 w-3.5 text-indigo-600" /> Log Session Interaction
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
                        onClick={() => handleComplete(req.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                      </Button>
                    </>
                  )}

                  {req.status === 'completed' && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mentorship Completed
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Log Interaction Modal */}
        <Modal 
          isOpen={isLogOpen} 
          onClose={() => setIsLogOpen(false)}
          title="Log Mentorship Session"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Logging sessions updates your Alumni Impact Score and awards you 1 reward point per 10 minutes of coaching.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Type
              </label>
              <select
                value={interactionType}
                onChange={(e) => setInteractionType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="1:1 Architecture Discussion">1:1 Architecture Discussion</option>
                <option value="Career Guidance">Career Guidance</option>
                <option value="Mock Technical Interview">Mock Technical Interview</option>
                <option value="Resume & Portfolio Review">Resume & Portfolio Review</option>
                <option value="Code Review & Best Practices">Code Review & Best Practices</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration (Minutes)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['15', '30', '45', '60'].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      duration === mins
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {mins}m ({Math.floor(parseInt(mins) / 10)} pts)
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discussion Notes & Action Items
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key concepts covered, recommended resources, or action items for the student..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsLogOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" isLoading={logging} onClick={handleLogInteraction}>
                Save & Earn Points
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
