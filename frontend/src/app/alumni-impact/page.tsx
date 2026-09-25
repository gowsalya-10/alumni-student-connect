'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { Star, Gift, TrendingUp, Users, CheckCircle2, Clock } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ImpactScore {
  total_score: number;
  total_interactions: number;
  students_helped: number;
  completed_mentorships: number;
  average_rating: number;
  reward_points: number;
}

interface RewardTransaction {
  id: string;
  points: number;
  reason: string;
  created_at: string;
}

export default function AlumniImpactPage() {
  const { user } = useAuth();
  const [impact, setImpact] = useState<ImpactScore | null>(null);
  const [rewards, setRewards] = useState<RewardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [impactRes, rewardsRes] = await Promise.all([
          api.get(`/api/v1/alumni/${user.id}/impact`),
          api.get('/api/v1/alumni/my/rewards')
        ]);
        setImpact(impactRes.data);
        setRewards(rewardsRes.data);
      } catch (err) {
        setError('Failed to load impact data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['alumni']}>
        <div className="p-4 sm:p-8 space-y-6">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !impact) {
    return (
      <DashboardLayout allowedRoles={['alumni']}>
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
          <Alert variant="error" title="Error">{error || 'Data not found'}</Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['alumni']}>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Star className="h-8 w-8 text-yellow-500" />
            Impact & Rewards
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Track the difference you are making and the reward points you've earned.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
            <p className="text-indigo-100 font-medium mb-1">Impact Score</p>
            <h2 className="text-4xl font-bold">{impact.total_score}</h2>
            <p className="text-xs text-indigo-200 mt-2 flex items-center gap-1"><TrendingUp className="h-3 w-3"/> Deterministic algorithm</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-none">
            <p className="text-yellow-100 font-medium mb-1">Reward Points</p>
            <h2 className="text-4xl font-bold">{impact.reward_points}</h2>
            <p className="text-xs text-yellow-100 mt-2 flex items-center gap-1"><Gift className="h-3 w-3"/> Redeemable soon</p>
          </Card>
          <Card className="p-6 border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" /> Avg Rating
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {impact.average_rating > 0 ? impact.average_rating.toFixed(1) : 'N/A'}
            </h2>
          </Card>
          <Card className="p-6 border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> Students Helped
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{impact.students_helped}</h2>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reward History</h2>
            {rewards.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                You haven't earned any reward points yet. Accept a mentorship and log interactions to earn points!
              </Card>
            ) : (
              <div className="space-y-4">
                {rewards.map(r => (
                  <Card key={r.id} className="p-4 flex items-center justify-between border-l-4 border-l-yellow-500">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{r.reason}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-lg font-bold text-yellow-600 dark:text-yellow-500">
                      +{r.points} pts
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">How it works</h2>
            <Card className="p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Mentorship Completion</h4>
                  <p className="text-xs text-gray-500 mt-1">Earn 10 impact score per completed mentorship.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Interactions & Logging</h4>
                  <p className="text-xs text-gray-500 mt-1">Earn 5 impact score per interaction, plus reward points (1pt per 10 mins).</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Star className="h-5 w-5 text-yellow-500 shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Ratings</h4>
                  <p className="text-xs text-gray-500 mt-1">Your average rating multiplies into your impact score.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
