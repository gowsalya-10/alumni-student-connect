'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { SkillChip } from '@/components/ui/SkillChip';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Compass, CheckCircle2, FileText, ArrowRight, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { StudentProfile } from '@/types';

interface DashboardData {
  profile: StudentProfile;
  skills: string[];
  has_resume: boolean;
  roadmap_phases: string[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/v1/student/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load your dashboard. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 col-span-1" />
            <Skeleton className="h-48 col-span-2" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8">
          <Alert variant="error" title="Error">{error}</Alert>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, skills, has_resume, roadmap_phases } = data;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Good morning, {profile.name.split(' ')[0]}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {profile.desired_career ? `Aspiring ${profile.desired_career}` : 'Let\'s build your career profile.'}
            </p>
          </div>
          {!profile.onboarding_completed && (
            <Link href="/onboarding">
              <Button>Complete Profile setup</Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Readiness Score */}
          <Card className="col-span-1 border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">Career Readiness</h3>
            <ProgressRing 
              value={profile.career_readiness_pct} 
              size={140} 
              strokeWidth={10} 
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 max-w-xs">
              Complete your roadmap and upload a resume to boost your score.
            </p>
          </Card>

          {/* Career Roadmap Preview */}
          <Card className="col-span-1 lg:col-span-2 border-gray-200 dark:border-gray-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                Career Roadmap
              </h3>
              <Link href="/career-navigator">
                <Button variant="ghost" size="sm" className="gap-1">
                  View full <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {roadmap_phases.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-4">
                  {roadmap_phases.map((phase, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400">
                        {idx + 1}. {phase}
                      </div>
                      {idx < roadmap_phases.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-700" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<TrendingUp />}
                title="No roadmap created yet"
                description="Use our AI Career Navigator to generate a structured path to your dream job."
                action={
                  <Link href="/career-navigator">
                    <Button>Generate Roadmap</Button>
                  </Link>
                }
                className="flex-1 border-none bg-transparent"
              />
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Skills */}
          <Card className="col-span-1 p-6 border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Skills</h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <SkillChip key={skill} name={skill} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You haven't added any skills yet.
              </p>
            )}
          </Card>

          {/* Resume */}
          <Card className="col-span-1 p-6 border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-400" />
              Resume Status
            </h3>
            {has_resume ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Primary resume active
                </div>
                <Link href="/resume" className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2 inline-block">
                  Manage resume &rarr;
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No resume uploaded yet.
                </p>
                <Link href="/resume">
                  <Button variant="outline" size="sm">Upload Resume</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Mentorship */}
          <Card className="col-span-1 p-6 border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mentorship</h3>
            {profile.mentorship_interests.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Looking for help with:
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.mentorship_interests.map((interest, idx) => (
                    <span key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                      {interest}
                    </span>
                  ))}
                </div>
                <Link href="/mentors" className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2 inline-block">
                  Find Mentors &rarr;
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You haven't set any mentorship preferences.
              </p>
            )}
          </Card>
        </div>
        
      </div>
    </DashboardLayout>
  );
}
