'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { 
  Target, CheckCircle2, AlertTriangle, 
  ArrowRight, Compass 
} from 'lucide-react';
import api from '@/lib/api';
import { CareerRoadmap, StudentProfile } from '@/types';

interface SkillGapData {
  profile: StudentProfile | null;
  roadmap: CareerRoadmap | null;
  currentSkills: string[];
}

export default function SkillGapPage() {
  const [data, setData] = useState<SkillGapData>({ profile: null, roadmap: null, currentSkills: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const fetchSkillGap = async () => {
      try {
        const [profileRes, skillsRes, roadmapRes] = await Promise.all([
          api.get('/api/v1/student/profile'),
          api.get('/api/v1/student/skills'),
          api.get('/api/v1/roadmap')
        ]);
        
        if (!ignore) {
          setData({
            profile: profileRes.data,
            currentSkills: skillsRes.data || [],
            roadmap: roadmapRes.data || null
          });
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setError('Failed to load skill gap data.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchSkillGap();
    return () => { ignore = true; };
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl md:col-span-2" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
          <Alert variant="error" title="Notice">{error}</Alert>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, roadmap, currentSkills } = data;
  const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

  // Extract required skills from roadmap
  const requiredSkills: { name: string; difficulty: string }[] = [];
  if (roadmap) {
    roadmap.phases.forEach(phase => {
      phase.milestones.forEach(m => {
        if (!requiredSkills.find(s => s.name.toLowerCase() === m.skill_name.toLowerCase())) {
          requiredSkills.push({ name: m.skill_name, difficulty: m.difficulty });
        }
      });
    });
  }

  // Calculate gaps
  const matchedSkills = requiredSkills.filter(s => currentSkillsLower.includes(s.name.toLowerCase()));
  const missingSkills = requiredSkills.filter(s => !currentSkillsLower.includes(s.name.toLowerCase()));
  
  // Extra skills
  const extraSkills = currentSkills.filter(
    s => !requiredSkills.find(rs => rs.name.toLowerCase() === s.toLowerCase())
  );

  const matchPercentage = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100) 
    : 0;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Target className="h-5 w-5" />
              </div>
              Skill Proficiency & Gap Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Benchmark your technical skillset against industry demands for {profile?.desired_career || 'your dream job'}.
            </p>
          </div>

          <Link href="/career-navigator">
            <Button variant="outline" size="sm" className="gap-1.5 border-indigo-200 text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
              <Compass className="h-4 w-4" /> View AI Roadmap
            </Button>
          </Link>
        </div>

        {/* Top Alignment Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Match Score Gauge Card */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-2xs flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Roadmap Skill Match
            </span>
            <ProgressRing value={matchPercentage} size={130} strokeWidth={10} />
            <div className="mt-4 space-y-1">
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {matchedSkills.length} of {requiredSkills.length} Core Skills Acquired
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {matchPercentage >= 75 ? '🎯 Excellent Alignment' : '📈 Recommended Learning Pathway'}
              </p>
            </div>
          </Card>

          {/* Goal & Recommendations Summary */}
          <Card className="p-6 md:col-span-2 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Target Role Profile
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {profile?.desired_career || 'Software Engineer'}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Our AI model analyzed your current skillset against production job requirements. Closing the identified skill gaps will increase your profile visibility with alumni mentors and campus recruiters.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">{matchedSkills.length}</p>
                  <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">Matched Skills</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                  <p className="text-xl font-extrabold text-amber-700 dark:text-amber-400">{missingSkills.length}</p>
                  <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mt-0.5">Missing Gaps</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                  <p className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400">{extraSkills.length}</p>
                  <p className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 mt-0.5">Additional Skills</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">Benchmark: Real-time University Dataset</span>
              <Link href="/alumni">
                <Button size="sm" variant="ghost" className="text-xs text-indigo-600 gap-1 font-semibold">
                  Find Mentors in this Field <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Detailed Breakdown Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Matched Skills Card */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Acquired & Validated Skills ({matchedSkills.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Skills you currently possess that directly match your active career roadmap:
            </p>

            {matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map(s => (
                  <span 
                    key={s.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {s.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No matching skills yet. Complete roadmap milestones to unlock.</p>
            )}

            {extraSkills.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Additional Core Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {extraSkills.map(s => (
                    <span 
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Missing Skills Gap Card */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Recommended Skill Gaps to Bridge ({missingSkills.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              High-priority skills required by your roadmap to achieve role readiness:
            </p>

            {missingSkills.length > 0 ? (
              <div className="space-y-2.5">
                {missingSkills.map(s => (
                  <div 
                    key={s.name}
                    className="p-3 rounded-xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{s.name}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {s.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-600 font-semibold">
                Congratulations! You have mastered all skills required by your roadmap.
              </p>
            )}
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
