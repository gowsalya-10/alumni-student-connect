'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { SkillChip } from '@/components/ui/SkillChip';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Compass, CheckCircle2, FileText, ArrowRight, TrendingUp, 
  Sparkles, Briefcase, Users, Award, ChevronRight 
} from 'lucide-react';
import api from '@/lib/api';
import { StudentProfile, AlumniMatch } from '@/types';

interface DashboardData {
  profile: StudentProfile;
  skills: string[];
  has_resume: boolean;
  roadmap_phases: string[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [smartMatches, setSmartMatches] = useState<AlumniMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const fetchDashboard = async () => {
      try {
        const [dashRes, matchRes] = await Promise.allSettled([
          api.get('/api/v1/student/dashboard'),
          api.get('/api/v1/alumni/matching')
        ]);

        if (!ignore) {
          if (dashRes.status === 'fulfilled') {
            setData(dashRes.value.data);
          } else {
            setError('Failed to load your dashboard data.');
          }

          if (matchRes.status === 'fulfilled' && Array.isArray(matchRes.value.data)) {
            setSmartMatches(matchRes.value.data.slice(0, 3));
          }
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setError('Failed to load your dashboard. Please refresh.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { ignore = true; };
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          <Alert variant="error" title="Dashboard Error">{error || 'Data unavailable'}</Alert>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, skills, has_resume, roadmap_phases } = data;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
        
        {/* Welcome Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-850 to-violet-900 text-white p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                <span>Student Career Command Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {profile.name}!
              </h1>
              <p className="text-sm sm:text-base text-indigo-200/90 max-w-xl">
                {profile.desired_career 
                  ? `Pursuing: ${profile.desired_career} • Year ${profile.year || 3} • ${profile.department || 'Engineering'}`
                  : 'Empowering your transition from campus to industry leader.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/career-navigator">
                <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-xs">
                  <Compass className="h-4 w-4 mr-1.5 text-indigo-600" /> View Roadmap
                </Button>
              </Link>
              <Link href="/alumni">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Users className="h-4 w-4 mr-1.5" /> Find Mentors
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Readiness Score Card */}
          <Card className="p-5 border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center justify-center bg-white dark:bg-slate-900 shadow-2xs rounded-2xl">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Career Readiness
            </span>
            <div className="my-2">
              <ProgressRing 
                value={profile.career_readiness_pct} 
                size={110} 
                strokeWidth={9} 
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {profile.career_readiness_pct >= 80 ? '🌟 Outstanding Progress' : '📈 Advancing Milestones'}
            </p>
          </Card>

          {/* Active Skills */}
          <Card className="p-5 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between bg-white dark:bg-slate-900 shadow-2xs rounded-2xl">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Technical Skills
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {skills.length} Acquired
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3 max-h-24 overflow-hidden">
                {skills.map(s => (
                  <SkillChip key={s} name={s} className="text-xs py-0.5 px-2 bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            </div>
            <Link href="/skills" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              Manage Skills & Gap Analysis <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Card>

          {/* Resume Status */}
          <Card className="p-5 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between bg-white dark:bg-slate-900 shadow-2xs rounded-2xl">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  ATS Resume Vault
                </span>
                <FileText className="h-4 w-4 text-indigo-500" />
              </div>
              {has_resume ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Primary Resume Active</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ATS scanned and optimized for campus hiring & internships.
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    No resume uploaded yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload your PDF to get an instant ATS score check.
                  </p>
                </div>
              )}
            </div>
            <Link href="/resume" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              {has_resume ? 'View ATS Score & Download' : 'Upload Resume'} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Card>

          {/* Mentorship Interests */}
          <Card className="p-5 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between bg-white dark:bg-slate-900 shadow-2xs rounded-2xl">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Focus Areas
                </span>
                <Award className="h-4 w-4 text-violet-500" />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.mentorship_interests?.map((item, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <Link href="/mentorship" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              Mentorship Requests & Sessions <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        </div>

        {/* Career Roadmap Phased Progress */}
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Active Career Roadmap Sequence
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target: {profile.desired_career || 'Software Engineering'}
              </p>
            </div>
            <Link href="/career-navigator">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-600 gap-1">
                Full Navigator <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {roadmap_phases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roadmap_phases.map((phase, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-start gap-3"
                >
                  <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Phase {idx + 1}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                      {phase}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<TrendingUp className="h-8 w-8 text-indigo-500" />}
              title="No roadmap generated yet"
              description="Generate a personalized, phased AI roadmap tailored to your target engineering role."
              action={
                <Link href="/career-navigator">
                  <Button size="sm">Generate Career Roadmap</Button>
                </Link>
              }
              className="py-6 border-none bg-transparent"
            />
          )}
        </Card>

        {/* Recommended Alumni Mentors (Smart Matches Preview) */}
        {smartMatches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Recommended Alumni Mentors
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AI-ranked based on your skills and career interests
                </p>
              </div>
              <Link href="/alumni">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-600 gap-1">
                  View All Mentors <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {smartMatches.map(mentor => (
                <Card 
                  key={mentor.user_id} 
                  className="p-5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={mentor.photo_url || undefined} alt={mentor.name} size="md" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                            {mentor.name}
                          </h4>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium line-clamp-1">
                            {mentor.current_role}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {mentor.match_pct}% Match
                      </span>
                    </div>

                    {mentor.company && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                        <Briefcase className="h-3.5 w-3.5" />
                        {mentor.company}
                      </p>
                    )}

                    {mentor.matching_reasons?.length > 0 && (
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 mb-3">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Match Reason: </span>
                        {mentor.matching_reasons[0]}
                      </div>
                    )}
                  </div>

                  <Link href={`/alumni/${mentor.user_id}`} className="mt-2">
                    <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                      View Profile & Connect
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
