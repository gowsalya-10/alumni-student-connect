'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { 
  Star, Gift, TrendingUp, Users, Clock, 
  Sparkles, MessageSquare, ArrowRight 
} from 'lucide-react';
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
      } catch {
        setError('Failed to load impact and reward data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['alumni']}>
        <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !impact) {
    return (
      <DashboardLayout allowedRoles={['alumni']}>
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
          <Alert variant="error" title="Notice">{error || 'Data unavailable'}</Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['alumni']}>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Star className="h-5 w-5 fill-white text-white" />
              </div>
              Alumni Impact & Recognition Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your mentorship contributions, student ratings, and earned institutional reward points.
            </p>
          </div>

          <Link href="/alumni-mentorship">
            <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs">
              <MessageSquare className="h-4 w-4" /> Go to Mentorship Sessions
            </Button>
          </Link>
        </div>

        {/* 4 Impact Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <Card className="p-5 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Total Impact Score
              </p>
              <h2 className="text-4xl font-extrabold mt-2 tracking-tight">
                {impact.total_score}
              </h2>
            </div>
            <p className="text-[11px] text-indigo-200 mt-4 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Weighted algorithmic scoring
            </p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-100">
                Reward Points
              </p>
              <h2 className="text-4xl font-extrabold mt-2 tracking-tight">
                {impact.reward_points}
              </h2>
            </div>
            <p className="text-[11px] text-amber-100 mt-4 flex items-center gap-1">
              <Gift className="h-3 w-3" /> 1 pt per 10 mins coached
            </p>
          </Card>

          <Card className="p-5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-2xs flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Students Coached
              </p>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
                {impact.students_helped}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1">
              <Users className="h-3 w-3 text-indigo-600" /> Across multiple engineering years
            </p>
          </Card>

          <Card className="p-5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-2xs flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Average Rating
              </p>
              <div className="flex items-center gap-2 mt-2">
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {impact.average_rating > 0 ? impact.average_rating.toFixed(1) : '5.0'}
                </h2>
                <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-4">
              From verified completed sessions
            </p>
          </Card>

        </div>

        {/* Gamification Explainer Banner */}
        <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                How Impact & Reward Points Work
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-xl">
                Earn 10 points per completed mentorship, 1 point per 10 minutes of logged 1:1 sessions, and bonus multipliers for 5-star ratings. Points are redeemable for campus speaker invitations and alumni honors.
              </p>
            </div>
          </div>
          <Link href="/alumni-mentorship">
            <Button size="sm" variant="outline" className="text-xs shrink-0 border-indigo-200 text-indigo-700 dark:text-indigo-300">
              Log Session Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Reward Transactions Table */}
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-2xs">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            Reward Points Activity Log
          </h3>

          {rewards.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">
              No reward transactions recorded yet. Log sessions in the Mentorship Hub to start earning points.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Activity Description</th>
                    <th className="pb-3 text-right">Points Earned</th>
                    <th className="pb-3 text-right pr-2">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rewards.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-2 font-medium text-slate-900 dark:text-white">
                        {tx.reason}
                      </td>
                      <td className="py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        +{tx.points} pts
                      </td>
                      <td className="py-3.5 text-right pr-2 text-slate-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </div>
    </DashboardLayout>
  );
}
