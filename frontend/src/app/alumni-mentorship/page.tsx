'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Target, CheckCircle2, XCircle, Clock, MessageSquarePlus } from 'lucide-react';
import api from '@/lib/api';
import { MentorshipRequest } from '@/types';

export default function AlumniMentorshipPage() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interaction Log Modal state
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<MentorshipRequest | null>(null);
  const [interactionType, setInteractionType] = useState('Career Guidance');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [logging, setLogging] = useState(false);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/mentorship/incoming');
      setRequests(res.data);
    } catch (err) {
      setError('Failed to load mentorship requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorships();
  }, []);

  const handleStatus = async (id: string, status: 'accept' | 'decline') => {
    try {
      await api.put(`/api/v1/mentorship/${id}/${status}`);
      fetchMentorships();
    } catch (err) {
      alert(`Failed to ${status} request`);
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
      alert('Interaction logged successfully!');
    } catch (err) {
      alert('Failed to log interaction');
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['alumni']}>
        <div className="p-4 sm:p-8 space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const pending = requests.filter(r => r.status === 'pending');
  const active = requests.filter(r => r.status === 'accepted');

  return (
    <DashboardLayout allowedRoles={['alumni']}>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            Mentorship Requests
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your incoming requests and active mentorship sessions.
          </p>
        </div>

        {error && <Alert variant="error" title="Error">{error}</Alert>}

        {requests.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-gray-300 dark:border-gray-700">
            <EmptyState
              icon={<MessageSquarePlus className="h-12 w-12" />}
              title="No requests yet"
              description="When students request your guidance, they will appear here."
              className="border-none bg-transparent"
            />
          </Card>
        ) : (
          <div className="space-y-8">
            
            {pending.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" /> Action Required ({pending.length})
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {pending.map(req => (
                    <Card key={req.id} className="p-6 border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/10 dark:bg-yellow-900/10">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{req.student_name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {req.student_department} {req.student_year ? `• Year ${req.student_year}` : ''}
                          </p>
                          {req.student_goal && (
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
                              Goal: {req.student_goal}
                            </p>
                          )}
                          <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                            "{req.message}"
                          </div>
                          <p className="text-xs text-gray-400 mt-3">Requested on {new Date(req.requested_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20" onClick={() => handleStatus(req.id, 'decline')}>
                            Decline
                          </Button>
                          <Button onClick={() => handleStatus(req.id, 'accept')} className="bg-green-600 hover:bg-green-700 text-white">
                            Accept Request
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {active.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Mentorships</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {active.map(req => (
                    <Card key={req.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{req.student_name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{req.student_goal}</p>
                        </div>
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
                        </span>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          onClick={() => { setSelectedReq(req); setIsLogOpen(true); }}
                          className="w-full justify-center"
                        >
                          Log Interaction
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

        {/* Log Interaction Modal */}
        <Modal 
          isOpen={isLogOpen} 
          onClose={() => !logging && setIsLogOpen(false)}
          title="Log Interaction"
          description={`Record a mentorship session with ${selectedReq?.student_name}`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsLogOpen(false)} disabled={logging}>Cancel</Button>
              <Button onClick={handleLogInteraction} disabled={logging || !notes.trim()}>
                {logging ? 'Saving...' : 'Save Interaction'}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Interaction Type
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                value={interactionType}
                onChange={(e) => setInteractionType(e.target.value)}
              >
                <option value="Career Guidance">Career Guidance</option>
                <option value="Resume Review">Resume Review</option>
                <option value="Interview Preparation">Interview Preparation</option>
                <option value="Technical Guidance">Technical Guidance</option>
                <option value="Project Guidance">Project Guidance</option>
                <option value="Networking">Networking</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Duration (minutes)
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="45">45 mins</option>
                <option value="60">60 mins</option>
                <option value="90">90 mins</option>
                <option value="120">120+ mins</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Notes / Feedback (Private)
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 min-h-[100px]"
                placeholder="Briefly describe what was discussed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
